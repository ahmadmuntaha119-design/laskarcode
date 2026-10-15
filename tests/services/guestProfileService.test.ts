import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { GuestProfileService } from '@/services/guestProfileService';
import { DevMemoryRateLimiter, RateLimitExceededError } from '@/lib/security/rateLimiter';
import { AuthorizationError, ValidationError } from '@/services/types';
import { GUEST_SESSION_COOKIE_NAME } from '@/lib/session/types';
import { createAdminClient } from '@/lib/supabase/admin';

describe('GuestProfileService & Recovery Code Tests', () => {
  const sessionSecret = 'test-session-secret-key-that-is-at-least-32-chars-long';
  const recoverySecret = 'test-recovery-hmac-secret-key-at-least-32-chars-long';

  // In-memory mock database store
  let mockProfilesDb: Map<string, { id: string; nickname: string; avatar_id: string; created_at: string }>;
  let mockRecoveryCodesDb: Map<string, { id: string; profile_id: string; code_hash: string; last_used_at?: string }>;

  const createMockCookieStore = () => {
    const store = new Map<string, string>();
    return {
      get: (name: string) => {
        const val = store.get(name);
        return val !== undefined ? { name, value: val } : undefined;
      },
      set: ({ name, value }: { name: string; value: string }) => {
        store.set(name, value);
      },
      delete: (name: string) => {
        store.delete(name);
      },
      _store: store,
    };
  };

  const createMockAdminClient = () => {
    return {
      from: (table: string) => {
        if (table === 'profiles') {
          return {
            insert: (values: { nickname: string; avatar_id: string }) => ({
              select: () => ({
                single: async () => {
                  const id = randomUUID();
                  const row = {
                    id,
                    nickname: values.nickname,
                    avatar_id: values.avatar_id,
                    created_at: new Date().toISOString(),
                  };
                  mockProfilesDb.set(id, row);
                  return { data: row, error: null };
                },
              }),
            }),
            select: () => ({
              eq: (_col: string, val: string) => ({
                single: async () => {
                  const row = mockProfilesDb.get(val);
                  return row ? { data: row, error: null } : { data: null, error: { message: 'Not found' } };
                },
              }),
            }),
            delete: () => ({
              eq: (_col: string, val: string) => {
                mockProfilesDb.delete(val);
                return Promise.resolve({ error: null });
              },
            }),
          };
        }

        if (table === 'recovery_codes') {
          return {
            insert: async (values: { profile_id: string; code_hash: string }) => {
              const id = randomUUID();
              mockRecoveryCodesDb.set(values.code_hash, {
                id,
                profile_id: values.profile_id,
                code_hash: values.code_hash,
              });
              return { error: null };
            },
            select: () => ({
              eq: (_col: string, val: string) => ({
                single: async () => {
                  const row = mockRecoveryCodesDb.get(val);
                  return row ? { data: row, error: null } : { data: null, error: { message: 'Not found' } };
                },
              }),
            }),
            update: (values: { last_used_at?: string }) => ({
              eq: (_col: string, id: string) => {
                for (const item of mockRecoveryCodesDb.values()) {
                  if (item.id === id) {
                    item.last_used_at = values.last_used_at;
                  }
                }
                return Promise.resolve({ error: null });
              },
            }),
          };
        }

        throw new Error(`Table ${table} not mocked`);
      },
    } as unknown as ReturnType<typeof createAdminClient>;
  };

  beforeEach(() => {
    mockProfilesDb = new Map();
    mockRecoveryCodesDb = new Map();
    DevMemoryRateLimiter.clearAll();
  });

  it('6. Create profile menghasilkan profil, recovery code, dan sesi yang konsisten', async () => {
    const cookieStore = createMockCookieStore();
    const adminClient = createMockAdminClient();

    const result = await GuestProfileService.createProfile(
      { nickname: 'BudiPetualang', avatarId: 'boti_hero' },
      { cookieStore, adminClient, sessionSecret, recoverySecret }
    );

    // Profile DTO valid
    expect(result.profile.id).toBeDefined();
    expect(result.profile.nickname).toBe('BudiPetualang');
    expect(result.profile.avatarId).toBe('boti_hero');

    // Recovery code berformat anak-facing CIPI-XXXX-XX (mendukung legacy BOTI-XXXX-XX)
    expect(result.recoveryCode).toMatch(/^(CIPI|BOTI)-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{2}$/);

    // Cookie sesi diset
    const sessionCookie = cookieStore.get(GUEST_SESSION_COOKIE_NAME);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe(result.sessionToken);

    // Tersimpan di database
    expect(mockProfilesDb.size).toBe(1);
    expect(mockRecoveryCodesDb.size).toBe(1);
  });

  it('7 & 9. Recovery code valid mengembalikan akses ke profile yang sama tanpa membuat profil duplikat', async () => {
    const adminClient = createMockAdminClient();
    const deviceACookieStore = createMockCookieStore();

    // Device A: Buat profil baru
    const created = await GuestProfileService.createProfile(
      { nickname: 'SitiCerdas' },
      { cookieStore: deviceACookieStore, adminClient, sessionSecret, recoverySecret }
    );

    const originalProfileId = created.profile.id;
    const recoveryCode = created.recoveryCode;
    expect(mockProfilesDb.size).toBe(1);

    // Device B: Pulihkan akun dengan recovery code
    const deviceBCookieStore = createMockCookieStore();
    const recovered = await GuestProfileService.recoverProfile(
      { recoveryCode, clientIp: '192.168.1.100' },
      { cookieStore: deviceBCookieStore, adminClient, sessionSecret, recoverySecret }
    );

    // Identitas profil sama persis
    expect(recovered.profile.id).toBe(originalProfileId);
    expect(recovered.profile.nickname).toBe('SitiCerdas');

    // Device B memiliki cookie sesi valid yang baru
    const deviceBSession = deviceBCookieStore.get(GUEST_SESSION_COOKIE_NAME);
    expect(deviceBSession).toBeDefined();
    expect(deviceBSession?.value).toBe(recovered.sessionToken);

    // TIDAK membuat profil duplikat di database
    expect(mockProfilesDb.size).toBe(1);
  });

  it('8. Recovery code tidak valid ditolak dengan respons generik', async () => {
    const adminClient = createMockAdminClient();
    const cookieStore = createMockCookieStore();

    await expect(
      GuestProfileService.recoverProfile(
        { recoveryCode: 'BOTI-9999-99', clientIp: '192.168.1.50' },
        { cookieStore, adminClient, sessionSecret, recoverySecret }
      )
    ).rejects.toThrow('Kode Petualangan tidak valid atau tidak ditemukan. Periksa kembali kode Anda.');

    // Cookie tidak dipasang
    expect(cookieStore.get(GUEST_SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it('Rate limiter memblokir percobaan setelah 5 kali gagal', async () => {
    const adminClient = createMockAdminClient();
    const cookieStore = createMockCookieStore();
    const clientIp = '10.0.0.1';

    // 5 kali percobaan gagal
    for (let i = 0; i < 5; i++) {
      await expect(
        GuestProfileService.recoverProfile(
          { recoveryCode: 'BOTI-2222-22', clientIp },
          { cookieStore, adminClient, sessionSecret, recoverySecret }
        )
      ).rejects.toThrow(AuthorizationError);
    }

    // Percobaan ke-6 harus langsung ditolak oleh RateLimiter
    await expect(
      GuestProfileService.recoverProfile(
        { recoveryCode: 'BOTI-2222-22', clientIp },
        { cookieStore, adminClient, sessionSecret, recoverySecret }
      )
    ).rejects.toThrow(RateLimitExceededError);
  });

  it('10. Recovery code mentah dan secret tidak dicetak ke console/log', async () => {
    const logSpy = vi.spyOn(console, 'log');
    const infoSpy = vi.spyOn(console, 'info');
    const errorSpy = vi.spyOn(console, 'error');

    const adminClient = createMockAdminClient();
    const cookieStore = createMockCookieStore();

    const created = await GuestProfileService.createProfile(
      { nickname: 'AnakHebat' },
      { cookieStore, adminClient, sessionSecret, recoverySecret }
    );

    await GuestProfileService.recoverProfile(
      { recoveryCode: created.recoveryCode, clientIp: '127.0.0.1' },
      { cookieStore, adminClient, sessionSecret, recoverySecret }
    );

    // Cek semua panggilan log
    const allLoggedArgs = [
      ...logSpy.mock.calls.flat(),
      ...infoSpy.mock.calls.flat(),
      ...errorSpy.mock.calls.flat(),
    ].join(' ');

    expect(allLoggedArgs).not.toContain(created.recoveryCode);
    expect(allLoggedArgs).not.toContain(sessionSecret);
    expect(allLoggedArgs).not.toContain(recoverySecret);

    logSpy.mockRestore();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('11. Akses tidak terautentikasi ke getCurrentProfile ditolak', async () => {
    const emptyCookieStore = createMockCookieStore();
    const adminClient = createMockAdminClient();

    await expect(
      GuestProfileService.getCurrentProfile({
        cookieStore: emptyCookieStore,
        adminClient,
        sessionSecret,
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it('Validasi input profil menolak nickname kosong atau lebih dari 20 karakter', async () => {
    const adminClient = createMockAdminClient();

    await expect(
      GuestProfileService.createProfile(
        { nickname: '   ' },
        { adminClient, sessionSecret, recoverySecret }
      )
    ).rejects.toThrow(ValidationError);

    await expect(
      GuestProfileService.createProfile(
        { nickname: 'NamaYangSangatPanjangSekaliLebihDariDuaPuluhKarakter' },
        { adminClient, sessionSecret, recoverySecret }
      )
    ).rejects.toThrow(ValidationError);
  });
});
