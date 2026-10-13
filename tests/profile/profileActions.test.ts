import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  createPlayerProfileAction,
  recoverPlayerProfileAction,
  getCurrentPlayerProfileAction,
} from '@/app/actions/profileActions';
import { GuestProfileService } from '@/services/guestProfileService';
import { DevMemoryRateLimiter } from '@/lib/security/rateLimiter';
import {
  createGuestProfileSchema,
  recoverProfileInputSchema,
} from '@/services/guestProfileService';
import {
  signGuestSessionPayload,
  verifyGuestSessionToken,
  getGuestSessionSecret,
} from '@/lib/session/crypto';
import { getRecoveryCodeSecret } from '@/lib/security/recoveryCode';
import {
  ConfigurationError,
  DatabaseOperationError,
  AuthorizationError,
} from '@/services/types';
import { requireGuestSession, resolveGuestSession } from '@/lib/session/resolveSession';
import { GUEST_SESSION_COOKIE_NAME } from '@/lib/session/types';

// Mock Next.js headers & cookies
const mockCookieStore = new Map<string, string>();
const mockHeadersStore = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const val = mockCookieStore.get(name);
      return val !== undefined ? { name, value: val } : undefined;
    },
    set: ({ name, value }: { name: string; value: string }) => {
      mockCookieStore.set(name, value);
    },
    delete: (name: string) => {
      mockCookieStore.delete(name);
    },
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => mockHeadersStore.get(name) || null,
  })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Task 010 — Profile Actions & Supabase Runtime Integration Tests', () => {
  beforeEach(() => {
    mockCookieStore.clear();
    mockHeadersStore.clear();
    DevMemoryRateLimiter.clearAll();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. Validasi Form Profil
  // --------------------------------------------------------------------------
  describe('1. Validasi Form Profil', () => {
    it('menolak nama panggilan kurang dari 1 karakter', () => {
      const parsed = createGuestProfileSchema.safeParse({
        nickname: '',
        avatarId: 'boti_default',
      });
      expect(parsed.success).toBe(false);
    });

    it('menolak nama panggilan lebih dari 20 karakter', () => {
      const parsed = createGuestProfileSchema.safeParse({
        nickname: 'NamaAnakSangatPanjangSekali123',
        avatarId: 'boti_default',
      });
      expect(parsed.success).toBe(false);
    });

    it('menerima nama panggilan 2-20 karakter dan menggunakan default avatarId', () => {
      const parsed = createGuestProfileSchema.safeParse({
        nickname: 'BotiJawara',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.nickname).toBe('BotiJawara');
        expect(parsed.data.avatarId).toBe('boti_default');
      }
    });

    it('menolak format Kode Petualangan yang salah', () => {
      const invalidCodes = [
        '12345',
        'BOTI-123',
        'boti-invalid',
        'BOTI-OOOO-00', // Mengandung karakter terlarang O dan 0
        'BOTI-IIII-11', // Mengandung karakter terlarang I dan 1
      ];

      for (const code of invalidCodes) {
        const parsed = recoverProfileInputSchema.safeParse({
          recoveryCode: code,
        });
        expect(parsed.success, `Kode '${code}' harus ditolak`).toBe(false);
      }
    });

    it('menerima format Kode Petualangan yang sah BOTI-XXXX-XX', () => {
      const validCodes = ['BOTI-7K4P-92', 'BOTI-ABCD-EF', 'BOTI-2345-67'];
      for (const code of validCodes) {
        const parsed = recoverProfileInputSchema.safeParse({
          recoveryCode: code,
        });
        expect(parsed.success, `Kode '${code}' harus diterima`).toBe(true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. Create Profile Berhasil
  // --------------------------------------------------------------------------
  describe('2. Create Profile Berhasil', () => {
    it('membuat profil pemain dan mengembalikan profil serta recovery code satu kali', async () => {
      const mockResult = {
        profile: {
          id: randomUUID(),
          nickname: 'BimaSakti',
          avatarId: 'boti_explorer',
          createdAt: new Date().toISOString(),
        },
        recoveryCode: 'BOTI-7K4P-92',
        sessionToken: 'mock.token',
      };

      vi.spyOn(GuestProfileService, 'createProfile').mockResolvedValueOnce(mockResult);

      const formData = new FormData();
      formData.append('nickname', 'BimaSakti');
      formData.append('avatarId', 'boti_explorer');

      const res = await createPlayerProfileAction(null, formData);

      expect(res.success).toBe(true);
      expect(res.profile?.nickname).toBe('BimaSakti');
      expect(res.profile?.avatarId).toBe('boti_explorer');
      expect(res.recoveryCode).toBe('BOTI-7K4P-92');
    });

    it('menolak jika input nickname di form tidak valid', async () => {
      const formData = new FormData();
      formData.append('nickname', '');
      formData.append('avatarId', 'boti_default');

      const res = await createPlayerProfileAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Recovery Berhasil & Tidak Menciptakan Profil Duplikat
  // --------------------------------------------------------------------------
  describe('3. Recovery Berhasil & Idempotensi Profil', () => {
    it('memulihkan profil lama dan tidak membuat profil baru', async () => {
      const existingProfileId = randomUUID();
      const mockRecoverResult = {
        profile: {
          id: existingProfileId,
          nickname: 'CitraCoder',
          avatarId: 'boti_coder',
          createdAt: new Date().toISOString(),
        },
        sessionToken: 'mock.recovered.token',
      };

      vi.spyOn(GuestProfileService, 'recoverProfile').mockResolvedValueOnce(mockRecoverResult);

      const formData = new FormData();
      formData.append('recoveryCode', 'BOTI-7K4P-92');

      const res = await recoverPlayerProfileAction(null, formData);

      expect(res.success).toBe(true);
      expect(res.profile?.id).toBe(existingProfileId);
      expect(res.profile?.nickname).toBe('CitraCoder');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Invalid / Expired Session Ditolak
  // --------------------------------------------------------------------------
  describe('4. Invalid / Expired Session Ditolak', () => {
    const testSecret = '01234567890123456789012345678901';

    it('menolak token sesi jika tanda tangan dimanipulasi', () => {
      const payload = {
        profileId: randomUUID(),
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        v: 1 as const,
      };

      const validToken = signGuestSessionPayload(payload, testSecret);
      const [dataPart] = validToken.split('.');
      const forgedToken = `${dataPart}.forged_signature`;

      const verified = verifyGuestSessionToken(forgedToken, testSecret);
      expect(verified).toBeNull();
    });

    it('menolak token sesi jika sudah melewati expiresAt', () => {
      const expiredPayload = {
        profileId: randomUUID(),
        issuedAt: Date.now() - 7200000,
        expiresAt: Date.now() - 3600000, // Kedaluwarsa 1 jam lalu
        v: 1 as const,
      };

      const expiredToken = signGuestSessionPayload(expiredPayload, testSecret);
      const verified = verifyGuestSessionToken(expiredToken, testSecret);
      expect(verified).toBeNull();
    });

    it('resolveGuestSession mengembalikan null jika sesi kedaluwarsa atau tidak ada cookie', async () => {
      // Tidak ada cookie sama sekali
      const noSession = await resolveGuestSession({
        cookieStore: { get: () => undefined, set: () => {} },
        secret: testSecret,
      });
      expect(noSession).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Endpoint Privat Menolak Akses Tanpa Sesi
  // --------------------------------------------------------------------------
  describe('5. Endpoint Privat Menolak Akses Tanpa Sesi', () => {
    it('getCurrentPlayerProfileAction mengembalikan null jika tidak ada sesi', async () => {
      const current = await getCurrentPlayerProfileAction();
      expect(current).toBeNull();
    });

    it('requireGuestSession melempar AuthorizationError jika tidak ada sesi', async () => {
      await expect(
        requireGuestSession({
          cookieStore: { get: () => undefined, set: () => {} },
          secret: '01234567890123456789012345678901',
        })
      ).rejects.toThrow('Akses ditolak: Sesi petualang tidak ditemukan atau telah kedaluwarsa');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Kegagalan Supabase Ditangani Tanpa Fake Persistence
  // --------------------------------------------------------------------------
  describe('6. Kegagalan Supabase Ditangani Eksplisit (Anti Fake Persistence)', () => {
    it('mengembalikan error jika GuestProfileService gagal terhubung ke database', async () => {
      vi.spyOn(GuestProfileService, 'createProfile').mockRejectedValueOnce(
        new DatabaseOperationError('Connection timeout to Supabase')
      );

      const formData = new FormData();
      formData.append('nickname', 'BudiKuat');
      formData.append('avatarId', 'boti_default');

      const res = await createPlayerProfileAction(null, formData);

      // Harus gagal secara eksplisit, tidak boleh fake persistence!
      expect(res.success).toBe(false);
      expect(res.error).toContain('Koneksi database sedang bermasalah');
    });

    it('menangani error konfigurasi layanan jika secret atau konfigurasi belum siap', async () => {
      vi.spyOn(GuestProfileService, 'createProfile').mockRejectedValueOnce(
        new ConfigurationError('Missing SUPABASE_SECRET_KEY')
      );

      const formData = new FormData();
      formData.append('nickname', 'BudiKuat');

      const res = await createPlayerProfileAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Layanan belum siap');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Pemulihan Tidak Membocorkan Informasi Profil
  // --------------------------------------------------------------------------
  describe('7. Privasi & Keamanan Pemulihan', () => {
    it('mengembalikan pesan error generik saat kode pemulihan salah', async () => {
      vi.spyOn(GuestProfileService, 'recoverProfile').mockRejectedValueOnce(
        new AuthorizationError('Kode Petualangan tidak valid atau tidak ditemukan. Periksa kembali kode Anda.')
      );

      const formData = new FormData();
      formData.append('recoveryCode', 'BOTI-9999-99');

      const res = await recoverPlayerProfileAction(null, formData);

      expect(res.success).toBe(false);
      // Pesan error tidak boleh menyatakan apakah akun ada atau tidak
      expect(res.error).toBe('Kode Petualangan tidak valid atau tidak ditemukan. Periksa kembali kode Anda.');
    });

    it('getCurrentProfile tidak pernah menyertakan recovery code dalam DTO', async () => {
      const profile = {
        id: randomUUID(),
        nickname: 'Arya',
        avatarId: 'boti_star',
        createdAt: new Date().toISOString(),
      };

      const testSecret = '01234567890123456789012345678901';
      const validToken = signGuestSessionPayload(
        {
          profileId: profile.id,
          issuedAt: Date.now(),
          expiresAt: Date.now() + 3600000,
          v: 1,
        },
        testSecret
      );

      vi.spyOn(GuestProfileService, 'getCurrentProfile').mockResolvedValueOnce(profile);
      mockCookieStore.set(GUEST_SESSION_COOKIE_NAME, validToken);

      // Pastikan resolveGuestSession memvalidasi token sesi
      vi.stubEnv('GUEST_SESSION_SECRET', testSecret);

      const res = await getCurrentPlayerProfileAction();
      expect(res).not.toBeNull();
      expect(res?.nickname).toBe('Arya');
      expect(res).not.toHaveProperty('recoveryCode');
      expect(res).not.toHaveProperty('code_hash');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Environment Variable yang Hilang Ditangani dengan Jelas
  // --------------------------------------------------------------------------
  describe('8. Penanganan Environment Variable Hilang', () => {
    it('getGuestSessionSecret melempar ConfigurationError jika secret kurang dari 32 karakter', () => {
      expect(() => getGuestSessionSecret('short-secret')).toThrow(ConfigurationError);
      expect(() => getGuestSessionSecret('')).toThrow(ConfigurationError);
    });

    it('getRecoveryCodeSecret melempar ConfigurationError jika secret kurang dari 32 karakter', () => {
      expect(() => getRecoveryCodeSecret('short')).toThrow(ConfigurationError);
      expect(() => getRecoveryCodeSecret('')).toThrow(ConfigurationError);
    });
  });
});
