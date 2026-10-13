import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { GuestProfileService } from '@/services/guestProfileService';
import { DatabaseOperationError } from '@/services/types';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Compensation & Partial Failure Tests (Atomic Rollback)', () => {
  const sessionSecret = 'test-session-secret-key-that-is-at-least-32-chars-long';
  const recoverySecret = 'test-recovery-hmac-secret-key-at-least-32-chars-long';

  it('menghapus profil yang baru dibuat (rollback) jika penyimpanan recovery_codes gagal', async () => {
    const mockProfiles = new Map<string, { id: string; nickname: string }>();
    let deleteCalledForId: string | null = null;

    const mockAdminClient = {
      from: (table: string) => {
        if (table === 'profiles') {
          return {
            insert: (values: { nickname: string; avatar_id: string }) => ({
              select: () => ({
                single: async () => {
                  const id = randomUUID();
                  mockProfiles.set(id, { id, nickname: values.nickname });
                  return {
                    data: {
                      id,
                      nickname: values.nickname,
                      avatar_id: values.avatar_id,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  };
                },
              }),
            }),
            delete: () => ({
              eq: (_col: string, id: string) => {
                deleteCalledForId = id;
                mockProfiles.delete(id);
                return Promise.resolve({ error: null });
              },
            }),
          };
        }

        if (table === 'recovery_codes') {
          return {
            insert: async () => {
              // Simulasi kegagalan penyimpanan recovery code
              return { error: { message: 'Database connection failed while inserting recovery code' } };
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    } as unknown as ReturnType<typeof createAdminClient>;

    // Eksekusi createProfile dengan admin client yang gagal pada recovery code
    await expect(
      GuestProfileService.createProfile(
        { nickname: 'OrphanKid', avatarId: 'boti_default' },
        { adminClient: mockAdminClient, sessionSecret, recoverySecret }
      )
    ).rejects.toThrow(DatabaseOperationError);

    // Verifikasi mekanisme kompensasi: profil yang sempat dibuat HARUS di-delete
    expect(deleteCalledForId).not.toBeNull();
    expect(mockProfiles.size).toBe(0); // Tidak ada profil yatim tersisa!
  });
});
