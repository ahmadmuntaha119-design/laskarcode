'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  GuestProfileService,
  createGuestProfileSchema,
  recoverProfileInputSchema,
  ProfileDTO,
} from '@/services/guestProfileService';
import {
  resolveGuestSession,
} from '@/lib/session/resolveSession';
import { clearGuestSessionCookie } from '@/lib/session/cookie';
import {
  ValidationError,
  AuthorizationError,
  DatabaseOperationError,
  ConfigurationError,
} from '@/services/types';
import { RateLimitExceededError } from '@/lib/security/rateLimiter';

export interface CreateProfileActionResult {
  success: boolean;
  profile?: ProfileDTO;
  recoveryCode?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface RecoverProfileActionResult {
  success: boolean;
  profile?: ProfileDTO;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server Action: Pembuatan profil baru anak.
 * Menerbitkan session cookie bertanda tangan dan mengembalikan Kode Petualangan satu kali untuk dicatat.
 * Jangan pernah me-log Kode Petualangan mentah ke console/log server.
 */
export async function createPlayerProfileAction(
  _prevState: unknown,
  formData: FormData
): Promise<CreateProfileActionResult> {
  const rawNickname = formData.get('nickname');
  const rawAvatarId = formData.get('avatarId');

  const parsed = createGuestProfileSchema.safeParse({
    nickname: typeof rawNickname === 'string' ? rawNickname.trim() : '',
    avatarId: typeof rawAvatarId === 'string' ? rawAvatarId.trim() : 'boti_default',
  });

  if (!parsed.success) {
    const errorIssues = parsed.error.issues;
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of errorIssues) {
      const field = issue.path[0] ? String(issue.path[0]) : 'form';
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }

    return {
      success: false,
      error: errorIssues[0]?.message || 'Data pembuatan profil tidak valid.',
      fieldErrors,
    };
  }

  try {
    const cookieStore = await cookies();
    const result = await GuestProfileService.createProfile(
      {
        nickname: parsed.data.nickname,
        avatarId: parsed.data.avatarId,
      },
      { cookieStore }
    );

    return {
      success: true,
      profile: result.profile,
      recoveryCode: result.recoveryCode,
    };
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      return {
        success: false,
        error: err.message,
      };
    }

    if (err instanceof DatabaseOperationError) {
      return {
        success: false,
        error: 'Koneksi database sedang bermasalah. Mohon coba beberapa saat lagi.',
      };
    }

    if (err instanceof ConfigurationError) {
      return {
        success: false,
        error: 'Layanan belum siap. Hubungi administrator.',
      };
    }

    // Hindari membocorkan stack trace internal ke pengguna
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat membuat profil. Silakan coba lagi.',
    };
  }
}

/**
 * Server Action: Pemulihan profil melalui Kode Petualangan.
 * Menerapkan rate limit, verifikasi hash, dan pesan error generik agar tidak membocorkan keberadaan akun.
 */
export async function recoverPlayerProfileAction(
  _prevState: unknown,
  formData: FormData
): Promise<RecoverProfileActionResult> {
  const rawCode = formData.get('recoveryCode');

  // Ambil IP klien untuk rate limiting di development/test
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || 'local-client';

  const normalizedCode = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';

  const parsed = recoverProfileInputSchema.safeParse({
    recoveryCode: normalizedCode,
    clientIp,
  });

  if (!parsed.success) {
    const errorIssues = parsed.error.issues;
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of errorIssues) {
      const field = issue.path[0] ? String(issue.path[0]) : 'form';
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }

    return {
      success: false,
      error: errorIssues[0]?.message || 'Format Kode Petualangan tidak valid.',
      fieldErrors,
    };
  }

  try {
    const cookieStore = await cookies();
    const result = await GuestProfileService.recoverProfile(
      {
        recoveryCode: parsed.data.recoveryCode,
        clientIp,
      },
      { cookieStore }
    );

    return {
      success: true,
      profile: result.profile,
    };
  } catch (err: unknown) {
    if (err instanceof RateLimitExceededError) {
      return {
        success: false,
        error: err.message,
      };
    }

    if (err instanceof AuthorizationError) {
      // Respons generik agar penyerang tidak bisa menebak keberadaan profil
      return {
        success: false,
        error: 'Kode Petualangan tidak valid atau tidak ditemukan. Periksa kembali kode Anda.',
      };
    }

    if (err instanceof DatabaseOperationError) {
      return {
        success: false,
        error: 'Koneksi database sedang bermasalah. Mohon coba beberapa saat lagi.',
      };
    }

    return {
      success: false,
      error: 'Terjadi kendala saat memulihkan profil. Silakan coba kembali.',
    };
  }
}

/**
 * Server Action: Keluar dari sesi guest aktif.
 */
export async function logoutPlayerProfileAction(): Promise<void> {
  const cookieStore = await cookies();
  clearGuestSessionCookie(cookieStore);
  redirect('/');
}

/**
 * Server Action: Mengambil informasi sesi profil pemain saat ini.
 */
export async function getCurrentPlayerProfileAction(): Promise<ProfileDTO | null> {
  try {
    const cookieStore = await cookies();
    const session = await resolveGuestSession({ cookieStore });
    if (!session) return null;

    return await GuestProfileService.getCurrentProfile({ cookieStore });
  } catch {
    return null;
  }
}
