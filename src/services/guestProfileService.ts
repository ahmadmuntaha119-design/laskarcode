import 'server-only';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  signGuestSessionPayload,
  GUEST_SESSION_MAX_AGE_SECONDS,
} from '@/lib/session';
import {
  setGuestSessionCookie,
  CookieStoreLike,
} from '@/lib/session/cookie';
import {
  generateRecoveryCode,
  hashRecoveryCode,
  recoveryCodeFormatSchema,
} from '@/lib/security/recoveryCode';
import {
  DevMemoryRateLimiter,
  RateLimitExceededError,
} from '@/lib/security/rateLimiter';
import {
  DatabaseOperationError,
  AuthorizationError,
  ValidationError,
  uuidSchema,
} from './types';
import { requireGuestSession } from '@/lib/session/resolveSession';

// ============================================================================
// Input Validation Schemas
// ============================================================================

export const createGuestProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, 'Nama panggilan tidak boleh kosong')
    .max(20, 'Nama panggilan maksimal 20 karakter'),
  avatarId: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .default('boti_default'),
});

export type CreateGuestProfileInput = z.input<typeof createGuestProfileSchema>;

export const recoverProfileInputSchema = z.object({
  recoveryCode: recoveryCodeFormatSchema,
  clientIp: z.string().optional().default('unknown-client'),
});

export type RecoverProfileInput = z.infer<typeof recoverProfileInputSchema>;

export interface ProfileDTO {
  id: string;
  nickname: string;
  avatarId: string;
  createdAt?: string;
}

export interface CreateProfileResult {
  profile: ProfileDTO;
  recoveryCode: string;
  sessionToken: string;
}

export interface RecoverProfileResult {
  profile: ProfileDTO;
  sessionToken: string;
}

export interface GuestServiceOptions {
  cookieStore?: CookieStoreLike;
  adminClient?: ReturnType<typeof createAdminClient>;
  sessionSecret?: string;
  recoverySecret?: string;
}

/**
 * ============================================================================
 * Guest Profile & Identity Service
 * ============================================================================
 * Mengelola alur pendaftaran profil guest, penerbitan sesi bertanda tangan,
 * dan pemulihan profil melalui Kode Petualangan secara aman.
 * Dokumen Acuan: §20, §21, §22
 */
export class GuestProfileService {
  /**
   * Membuat profil baru anak, menghasilkan Kode Petualangan unik,
   * menyimpan representasi aman (HMAC hash), dan menerbitkan signed session cookie.
   */
  public static async createProfile(
    input: CreateGuestProfileInput,
    options?: GuestServiceOptions
  ): Promise<CreateProfileResult> {
    // 1. Validasi input
    const parsed = createGuestProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        'Data pembuatan profil tidak valid.',
        parsed.error.issues
      );
    }

    const { nickname, avatarId } = parsed.data;
    const adminSupabase = options?.adminClient ?? createAdminClient();

    // 2. Buat profil di tabel `profiles`
    const { data: profileData, error: profileError } = await (
      adminSupabase.from('profiles') as unknown as {
        insert: (values: unknown) => {
          select: () => {
            single: () => Promise<{
              data: { id: string; nickname: string; avatar_id: string; created_at: string } | null;
              error: { message: string } | null;
            }>;
          };
        };
      }
    )
      .insert({
        nickname,
        avatar_id: avatarId,
      })
      .select()
      .single();

    if (profileError || !profileData) {
      throw new DatabaseOperationError(
        `Gagal membuat profil pemain: ${profileError?.message ?? 'Operasi tidak menghasilkan data'}`,
        profileError
      );
    }

    // 3. Bangkitkan Kode Petualangan dengan entropi kriptografis aman
    const rawRecoveryCode = generateRecoveryCode();
    const codeHash = hashRecoveryCode(rawRecoveryCode, options?.recoverySecret);

    // 4. Simpan representasi hash Kode Petualangan ke tabel `recovery_codes`
    const { error: recoveryError } = await (
      adminSupabase.from('recovery_codes') as unknown as {
        insert: (values: unknown) => Promise<{ error: { message: string } | null }>;
      }
    ).insert({
      profile_id: profileData.id,
      code_hash: codeHash,
    });

    if (recoveryError) {
      // Rollback profil jika penyimpanan recovery code gagal untuk mencegah profil tanpa pemulihan
      await (adminSupabase.from('profiles') as unknown as { delete: () => { eq: (k: string, v: string) => Promise<unknown> } })
        .delete()
        .eq('id', profileData.id);

      throw new DatabaseOperationError(
        `Gagal menyimpan Kode Petualangan: ${recoveryError.message}`,
        recoveryError
      );
    }

    // 5. Terbitkan signed guest session token
    const now = Date.now();
    const sessionToken = signGuestSessionPayload(
      {
        profileId: profileData.id,
        issuedAt: now,
        expiresAt: now + GUEST_SESSION_MAX_AGE_SECONDS * 1000,
        v: 1,
      },
      options?.sessionSecret
    );

    // 6. Pasang session cookie HTTP-Only jika cookieStore disediakan
    if (options?.cookieStore) {
      setGuestSessionCookie(options.cookieStore, sessionToken);
    }

    return {
      profile: {
        id: profileData.id,
        nickname: profileData.nickname,
        avatarId: profileData.avatar_id,
        createdAt: profileData.created_at,
      },
      recoveryCode: rawRecoveryCode,
      sessionToken,
    };
  }

  /**
   * Memulihkan profil menggunakan Kode Petualangan (Flow Device B).
   * Menerapkan rate limiting, verifikasi hash aman, respons generik jika gagal,
   * dan penerbitan sesi baru untuk profil yang sudah ada tanpa duplikasi data.
   */
  public static async recoverProfile(
    input: RecoverProfileInput,
    options?: GuestServiceOptions
  ): Promise<RecoverProfileResult> {
    // 1. Validasi format input
    const parsed = recoverProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        'Format Kode Petualangan tidak valid.',
        parsed.error.issues
      );
    }

    const { recoveryCode, clientIp } = parsed.data;

    // 2. Periksa rate limit (Dev & Test limiter)
    const rateCheck = DevMemoryRateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      throw new RateLimitExceededError(
        'Terlalu banyak percobaan pemulihan yang gagal. Silakan tunggu beberapa saat sebelum mencoba kembali.',
        rateCheck.resetAt
      );
    }

    // 3. Normalisasi dan hitung keyed HMAC hash
    const normalizedCode = recoveryCode.trim().toUpperCase();
    const computedHash = hashRecoveryCode(normalizedCode, options?.recoverySecret);
    const adminSupabase = options?.adminClient ?? createAdminClient();

    // 4. Cari record di tabel `recovery_codes`
    const { data: recoveryRecord, error: recoveryQueryError } = await (
      adminSupabase.from('recovery_codes') as unknown as {
        select: (cols: string) => {
          eq: (k: string, v: string) => {
            single: () => Promise<{
              data: { id: string; profile_id: string } | null;
              error: { message: string; code?: string } | null;
            }>;
          };
        };
      }
    )
      .select('id, profile_id')
      .eq('code_hash', computedHash)
      .single();

    // 5. Jika tidak ditemukan atau query error: catat kegagalan dan berikan respons generik
    if (recoveryQueryError || !recoveryRecord) {
      DevMemoryRateLimiter.record(clientIp);
      throw new AuthorizationError(
        'Kode Petualangan tidak valid atau tidak ditemukan. Periksa kembali kode Anda.'
      );
    }

    // 6. Ambil data profil terkait
    const { data: profileData, error: profileQueryError } = await (
      adminSupabase.from('profiles') as unknown as {
        select: (cols: string) => {
          eq: (k: string, v: string) => {
            single: () => Promise<{
              data: { id: string; nickname: string; avatar_id: string; created_at: string } | null;
              error: { message: string } | null;
            }>;
          };
        };
      }
    )
      .select('id, nickname, avatar_id, created_at')
      .eq('id', recoveryRecord.profile_id)
      .single();

    if (profileQueryError || !profileData) {
      DevMemoryRateLimiter.record(clientIp);
      throw new AuthorizationError(
        'Kode Petualangan tidak valid atau profil pemain tidak ditemukan.'
      );
    }

    // 7. Update last_used_at pada recovery_codes
    await (
      adminSupabase.from('recovery_codes') as unknown as {
        update: (values: unknown) => {
          eq: (k: string, v: string) => Promise<unknown>;
        };
      }
    )
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', recoveryRecord.id);

    // 8. Reset rate limiter jika recovery sukses
    DevMemoryRateLimiter.reset(clientIp);

    // 9. Terbitkan signed guest session token baru untuk profil yang ada
    const now = Date.now();
    const sessionToken = signGuestSessionPayload(
      {
        profileId: profileData.id,
        issuedAt: now,
        expiresAt: now + GUEST_SESSION_MAX_AGE_SECONDS * 1000,
        v: 1,
      },
      options?.sessionSecret
    );

    // 10. Pasang session cookie HTTP-Only jika cookieStore disediakan
    if (options?.cookieStore) {
      setGuestSessionCookie(options.cookieStore, sessionToken);
    }

    return {
      profile: {
        id: profileData.id,
        nickname: profileData.nickname,
        avatarId: profileData.avatar_id,
        createdAt: profileData.created_at,
      },
      sessionToken,
    };
  }

  /**
   * Mengambil data profil milik sesi pemain yang sedang aktif.
   * DILINDUNGI: Membaca identitas HANYA dari sesi yang telah diverifikasi kriptografis.
   * JANGAN PERNAH menyertakan data recovery code atau code hash dalam respon profil!
   */
  public static async getCurrentProfile(
    options?: GuestServiceOptions
  ): Promise<ProfileDTO> {
    const auth = await requireGuestSession({
      cookieStore: options?.cookieStore,
      secret: options?.sessionSecret,
    });

    const validProfileId = uuidSchema.parse(auth.profileId);
    const adminSupabase = options?.adminClient ?? createAdminClient();

    const { data: profileData, error } = await (
      adminSupabase.from('profiles') as unknown as {
        select: (cols: string) => {
          eq: (k: string, v: string) => {
            single: () => Promise<{
              data: { id: string; nickname: string; avatar_id: string; created_at: string } | null;
              error: { message: string } | null;
            }>;
          };
        };
      }
    )
      .select('id, nickname, avatar_id, created_at')
      .eq('id', validProfileId)
      .single();

    if (error || !profileData) {
      throw new AuthorizationError(
        'Profil pemain tidak ditemukan dalam sistem.'
      );
    }

    return {
      id: profileData.id,
      nickname: profileData.nickname,
      avatarId: profileData.avatar_id,
      createdAt: profileData.created_at,
    };
  }
}
