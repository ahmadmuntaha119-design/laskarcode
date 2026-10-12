import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import {
  assertAuthorized,
  AuthorizationError,
  DatabaseOperationError,
  ValidationError,
  levelConfigSchema,
  recordAttemptInputSchema,
  updateProgressInputSchema,
} from '@/services/types';
import { LevelService } from '@/services/levelService';
import { ProgressService } from '@/services/progressService';
import { MasteryService } from '@/services/masteryService';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Service Layer - Authorization & Schemas', () => {
  const validProfileId1 = 'a0000000-0000-0000-0000-000000000001';
  const validProfileId2 = 'a0000000-0000-0000-0000-000000000002';
  const validLevelId = 'b0000000-0000-0000-0000-000000000001';

  describe('assertAuthorized', () => {
    it('mengizinkan akses ketika auth context valid dan profileId cocok', () => {
      expect(() => {
        assertAuthorized(
          { profileId: validProfileId1, isAuthenticated: true },
          validProfileId1
        );
      }).not.toThrow();
    });

    it('menolak akses jika isAuthenticated bernilai false', () => {
      expect(() => {
        assertAuthorized(
          { profileId: validProfileId1, isAuthenticated: false },
          validProfileId1
        );
      }).toThrow(AuthorizationError);
    });

    it('menolak akses jika profileId penyerang berbeda dengan resource target', () => {
      expect(() => {
        assertAuthorized(
          { profileId: validProfileId1, isAuthenticated: true },
          validProfileId2
        );
      }).toThrow(AuthorizationError);
    });

    it('menolak jika profileId bukan UUID valid', () => {
      expect(() => {
        assertAuthorized(
          { profileId: 'invalid-id', isAuthenticated: true },
          'invalid-id'
        );
      }).toThrow(AuthorizationError);
    });
  });

  describe('Zod Schemas Validation', () => {
    it('memvalidasi levelConfigSchema secara ketat', () => {
      const validConfig = {
        grid: { width: 5, height: 3 },
        start: { x: 0, y: 1, direction: 'EAST' as const },
        goal: { x: 4, y: 1 },
        obstacles: [{ x: 2, y: 1 }],
        availableBlocks: ['MOVE', 'TURN_LEFT'],
        maxActions: 10,
      };

      expect(levelConfigSchema.safeParse(validConfig).success).toBe(true);

      // Grid invalid
      expect(
        levelConfigSchema.safeParse({ ...validConfig, grid: { width: 0, height: 3 } }).success
      ).toBe(false);

      // Direction invalid
      expect(
        levelConfigSchema.safeParse({
          ...validConfig,
          start: { x: 0, y: 1, direction: 'UP' },
        }).success
      ).toBe(false);

      // Blocks kosong
      expect(
        levelConfigSchema.safeParse({ ...validConfig, availableBlocks: [] }).success
      ).toBe(false);
    });

    it('memvalidasi recordAttemptInputSchema', () => {
      const validInput = {
        profileId: validProfileId1,
        levelId: validLevelId,
        attemptNumber: 1,
        successful: true,
        actionsUsed: 5,
        optimalActions: 4,
        collisions: 0,
        hintsUsed: 1,
        programChanges: 2,
        timeToCompleteMs: 12000,
        errorTypes: [],
        programData: ['MOVE', 'MOVE'],
      };

      expect(recordAttemptInputSchema.safeParse(validInput).success).toBe(true);

      // Actions negatif tidak diizinkan
      expect(
        recordAttemptInputSchema.safeParse({ ...validInput, actionsUsed: -1 }).success
      ).toBe(false);

      // Attempt number non-positif tidak diizinkan
      expect(
        recordAttemptInputSchema.safeParse({ ...validInput, attemptNumber: 0 }).success
      ).toBe(false);
    });

    it('memvalidasi updateProgressInputSchema', () => {
      const validProgress = {
        profileId: validProfileId1,
        levelId: validLevelId,
        status: 'COMPLETED' as const,
        stars: 3,
        bestAttempts: 1,
        bestTimeMs: 15000,
      };

      expect(updateProgressInputSchema.safeParse(validProgress).success).toBe(true);

      // Stars > 3 dilarang
      expect(
        updateProgressInputSchema.safeParse({ ...validProgress, stars: 4 }).success
      ).toBe(false);

      // Stars < 0 dilarang
      expect(
        updateProgressInputSchema.safeParse({ ...validProgress, stars: -1 }).success
      ).toBe(false);

      // Status sembarang dilarang
      expect(
        updateProgressInputSchema.safeParse({ ...validProgress, status: 'UNKNOWN' }).success
      ).toBe(false);
    });
  });
});

describe('LevelService Integration with Database Client', () => {
  it('berhasil memetakan level aktif dari mock Supabase client', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'b0000000-0000-0000-0000-000000000001',
                    island_id: 'a0000000-0000-0000-0000-000000000001',
                    code: '1.1',
                    title: 'Boti Mau Maju',
                    description: 'Maju 4 kali',
                    level_type: 'Learn',
                    order_index: 1,
                    difficulty: 1,
                    configuration: {
                      grid: { width: 5, height: 3 },
                      start: { x: 0, y: 1, direction: 'EAST' },
                      goal: { x: 4, y: 1 },
                      obstacles: [],
                      availableBlocks: ['MOVE'],
                      maxActions: 10,
                    },
                    is_active: true,
                    islands: {
                      id: 'a0000000-0000-0000-0000-000000000001',
                      slug: 'desa-boti',
                      name: 'Pulau 1 — Desa Boti',
                      order_index: 1,
                      is_active: true,
                    },
                    level_concepts: [
                      {
                        weight: 1.0,
                        role: 'primary',
                        concepts: {
                          id: 'c0000000-0000-0000-0000-000000000001',
                          slug: 'sequence',
                          name: 'Sequence',
                        },
                      },
                    ],
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const service = new LevelService(mockClient);
    const levels = await service.getActiveLevels();

    expect(levels).toHaveLength(1);
    expect(levels[0].code).toBe('1.1');
    expect(levels[0].islandSlug).toBe('desa-boti');
    expect(levels[0].concepts[0].slug).toBe('sequence');
    expect(levels[0].configuration.grid.width).toBe(5);
  });

  it('melempar DatabaseOperationError jika query database gagal', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Connection refused', code: '500' },
              }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const service = new LevelService(mockClient);
    await expect(service.getActiveLevels()).rejects.toThrow(DatabaseOperationError);
  });

  it('melempar ValidationError jika konfigurasi di database korup', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'b0000000-0000-0000-0000-000000000001',
                    island_id: 'a0000000-0000-0000-0000-000000000001',
                    code: '1.1',
                    title: 'Boti',
                    level_type: 'Learn',
                    order_index: 1,
                    difficulty: 1,
                    configuration: { grid: { width: -5 } }, // KORUP
                    islands: { slug: 'desa-boti', name: 'Desa Boti' },
                    level_concepts: [],
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const service = new LevelService(mockClient);
    await expect(service.getActiveLevels()).rejects.toThrow(ValidationError);
  });
});

describe('ProgressService & MasteryService Security & Validation', () => {
  const profileId = 'a0000000-0000-0000-0000-000000000001';
  const otherProfileId = 'a0000000-0000-0000-0000-000000000099';
  const levelId = 'b0000000-0000-0000-0000-000000000001';

  it('menolak getPlayerProgress jika auth context tidak cocok', async () => {
    const service = new ProgressService({} as unknown as SupabaseClient<Database>);
    await expect(
      service.getPlayerProgress(
        { profileId: otherProfileId, isAuthenticated: true },
        profileId
      )
    ).rejects.toThrow(AuthorizationError);
  });

  it('menyimpan attempt dan tidak pernah berpura-pura sukses jika database gagal', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database insert failed' },
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const service = new ProgressService(mockClient);
    await expect(
      service.recordAttempt(
        { profileId, isAuthenticated: true },
        {
          profileId,
          levelId,
          attemptNumber: 1,
          successful: true,
          actionsUsed: 4,
        }
      )
    ).rejects.toThrow(DatabaseOperationError);
  });

  it('berhasil menyimpan attempt saat database merespons positif', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'attempt-uuid-123' },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const service = new ProgressService(mockClient);
    const result = await service.recordAttempt(
      { profileId, isAuthenticated: true },
      {
        profileId,
        levelId,
        attemptNumber: 1,
        successful: true,
        actionsUsed: 4,
      }
    );

    expect(result.attemptId).toBe('attempt-uuid-123');
  });

  it('MasteryService memeriksa otorisasi sebelum query data', async () => {
    const service = new MasteryService({} as unknown as SupabaseClient<Database>);
    await expect(
      service.getPlayerMastery(
        { profileId: otherProfileId, isAuthenticated: true },
        profileId
      )
    ).rejects.toThrow(AuthorizationError);
  });
});

describe('Supabase Client Security', () => {
  it('createAdminClient melempar error keras jika dipanggil dalam browser window', () => {
    const globalObj = globalThis as { window?: unknown };
    globalObj.window = {};

    expect(() => {
      createAdminClient();
    }).toThrow('PELANGGARAN KEAMANAN: createAdminClient (service role) tidak boleh dipanggil di lingkungan browser.');

    delete globalObj.window;
  });
});
