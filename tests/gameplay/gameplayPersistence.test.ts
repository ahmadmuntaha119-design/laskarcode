import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  submitGameplayAttemptAction,
  getPlayerProgressAction,
} from '@/app/actions/gameplayActions';
import { calculateStars } from '@/game/levels/progression';
import { requireGuestSession } from '@/lib/session/resolveSession';
import { LevelService } from '@/services/levelService';
import { ProgressService } from '@/services/progressService';
import {
  AuthorizationError,
  DatabaseOperationError,
  PlayerProgressDTO,
} from '@/services/types';
import { getLevelByCode as getCatalogLevelByCode } from '@/game/levels/catalog';
import { useProgressionStore } from '@/game/levels/store';
import { isLevelUnlocked } from '@/game/levels/progression';

// Mock session resolver
vi.mock('@/lib/session/resolveSession', () => ({
  requireGuestSession: vi.fn(),
  resolveGuestSession: vi.fn(),
}));

// Mock services
vi.mock('@/services/levelService');
vi.mock('@/services/progressService');

describe('Task 011 — Gameplay Progress Persistence & Server-Side Validation Tests', () => {
  const mockProfileId = 'a1111111-1111-1111-1111-111111111111';
  const mockLevelId = 'b1111111-1111-1111-1111-111111111111';
  const level11Def = getCatalogLevelByCode('1.1')!;

  let mockRecordAttempt: ReturnType<typeof vi.fn>;
  let mockGetAttemptCount: ReturnType<typeof vi.fn>;
  let mockGetSingleLevelProgress: ReturnType<typeof vi.fn>;
  let mockUpdateLevelProgress: ReturnType<typeof vi.fn>;
  let mockGetPlayerProgress: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default valid session
    vi.mocked(requireGuestSession).mockResolvedValue({
      profileId: mockProfileId,
      isAuthenticated: true,
    });

    // Default level service mock returning level 1.1 definition
    vi.mocked(LevelService).mockImplementation(() => ({
      getLevelByCode: vi.fn().mockResolvedValue({
        id: mockLevelId,
        code: '1.1',
        title: level11Def.title,
        configuration: level11Def,
      }),
      getActiveLevels: vi.fn().mockResolvedValue([
        {
          id: mockLevelId,
          code: '1.1',
          title: level11Def.title,
          configuration: level11Def,
        },
      ]),
    } as unknown as LevelService));

    // Progress service mocks
    mockRecordAttempt = vi.fn().mockResolvedValue({
      attemptId: 'att-0001',
      profileId: mockProfileId,
      levelId: mockLevelId,
      attemptNumber: 1,
      successful: true,
      actionsUsed: 2,
      collisions: 0,
      timeToCompleteMs: 1500,
      errorTypes: [],
      programData: ['MOVE', 'MOVE'],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    mockGetAttemptCount = vi.fn().mockResolvedValue(0);
    mockGetSingleLevelProgress = vi.fn().mockResolvedValue(null);
    mockUpdateLevelProgress = vi.fn().mockImplementation((_auth, input) => {
      return Promise.resolve({
        id: 'prog-0001',
        profileId: input.profileId,
        levelId: input.levelId,
        levelCode: '1.1',
        status: input.status,
        stars: input.stars,
        bestAttempts: input.bestAttempts,
        bestTimeMs: input.bestTimeMs,
        completedAt: input.completedAt,
        updatedAt: new Date().toISOString(),
      } as PlayerProgressDTO);
    });

    mockGetPlayerProgress = vi.fn().mockResolvedValue([]);

    vi.mocked(ProgressService).mockImplementation(() => ({
      recordAttempt: mockRecordAttempt,
      getAttemptCount: mockGetAttemptCount,
      getSingleLevelProgress: mockGetSingleLevelProgress,
      updateLevelProgress: mockUpdateLevelProgress,
      getPlayerProgress: mockGetPlayerProgress,
    } as unknown as ProgressService));
  });

  describe('1. Server-Side Star Calculation (calculateStars)', () => {
    it('menghasilkan 0 bintang jika permainan tidak berhasil', () => {
      expect(calculateStars(false, 2, 0, 10)).toBe(0);
    });

    it('menghasilkan 1 bintang jika berhasil tetapi terjadi collision', () => {
      expect(calculateStars(true, 5, 1, 10)).toBe(1);
    });

    it('menghasilkan 2 bintang jika berhasil tanpa collision tetapi langkah tidak efisien (> 75% max)', () => {
      // maxActions = 10, 75% = 7.5 -> ceil = 8. actionsUsed = 9
      expect(calculateStars(true, 9, 0, 10)).toBe(2);
    });

    it('menghasilkan 3 bintang jika berhasil tanpa collision dan langkah efisien (<= 75% max)', () => {
      // maxActions = 10, ceil(10 * 0.75) = 8. actionsUsed = 2
      expect(calculateStars(true, 2, 0, 10)).toBe(3);
      // Boundary check: actionsUsed exactly 8
      expect(calculateStars(true, 8, 0, 10)).toBe(3);
    });
  });

  describe('2. Server-Side Result Validation & Game Engine Anti-Cheat', () => {
    it('memvalidasi hasil sukses secara objektif melalui Game Engine server-side', async () => {
      // Level 1.1: Grid 5x3, start (0,1) facing EAST, goal at (4,1).
      // Empat langkah MOVE akan mencapai goal target.
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE', 'MOVE', 'MOVE'],
        durationMs: 1200,
      });

      expect(result.success).toBe(true);
      expect(result.verifiedResult).toBeDefined();
      expect(result.verifiedResult?.successful).toBe(true);
      expect(result.verifiedResult?.stars).toBe(3);
      expect(result.verifiedResult?.actionsUsed).toBe(4);
      expect(result.verifiedResult?.collisions).toBe(0);
      expect(result.progress?.status).toBe('COMPLETED');
      expect(result.progress?.stars).toBe(3);

      // Pastikan recordAttempt dipanggil dengan nilai terverifikasi server
      expect(mockRecordAttempt).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: mockProfileId }),
        expect.objectContaining({
          profileId: mockProfileId,
          levelId: mockLevelId,
          successful: true,
          actionsUsed: 4,
          collisions: 0,
        })
      );
    });

    it('mencegah pemalsuan hasil: aksi gagal tidak dapat diklaim sebagai sukses', async () => {
      // Mengirim hanya 2 langkah MOVE (belum mencapai target bintang di (4,1))
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
        durationMs: 800,
      });

      expect(result.success).toBe(true);
      expect(result.verifiedResult?.successful).toBe(false);
      expect(result.verifiedResult?.stars).toBe(0);
      expect(result.verifiedResult?.status).toBe('FAILED');
      expect(result.progress?.status).toBe('IN_PROGRESS');

      // Attempt tetap dicatat sebagai gagal
      expect(mockRecordAttempt).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          successful: false,
          actionsUsed: 2,
        })
      );
    });

    it('menolak aksi yang menggunakan blok di luar availableBlocks level', async () => {
      // Level 1.1 hanya mengizinkan 'MOVE'. Mengirim 'TURN_LEFT' harus ditolak
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'TURN_LEFT'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("tidak diizinkan pada level '1.1'");
      expect(mockRecordAttempt).not.toHaveBeenCalled();
    });

    it('menolak eksekusi jika jumlah aksi melebihi batas maxActions level', async () => {
      // Level 1.1 maxActions adalah 10. Mengirim 11 aksi harus ditolak
      const tooManyActions = [
        'MOVE', 'MOVE', 'MOVE', 'MOVE', 'MOVE',
        'MOVE', 'MOVE', 'MOVE', 'MOVE', 'MOVE',
        'MOVE'
      ];
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: tooManyActions,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('melebihi batas maksimal level');
      expect(mockRecordAttempt).not.toHaveBeenCalled();
    });
  });

  describe('3. Security & Sesi Guest Server-Side', () => {
    it('menolak attempt jika session tidak valid atau tidak ada', async () => {
      vi.mocked(requireGuestSession).mockRejectedValueOnce(
        new AuthorizationError('Sesi guest tidak ditemukan.')
      );

      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sesi guest tidak ditemukan');
      expect(mockRecordAttempt).not.toHaveBeenCalled();
    });

    it('mengabaikan profileId palsu di payload client dan tetap menggunakan session profileId', async () => {
      const forgedPayload = {
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
        profileId: 'attacker-uuid-9999-999999999999',
      };

      const result = await submitGameplayAttemptAction(forgedPayload);

      expect(result.success).toBe(true);
      // Profil yang disimpan HANYA mockProfileId dari session server yang sah
      expect(mockRecordAttempt).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: mockProfileId }),
        expect.objectContaining({ profileId: mockProfileId })
      );
      expect(mockUpdateLevelProgress).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: mockProfileId }),
        expect.objectContaining({ profileId: mockProfileId })
      );
    });
  });

  describe('4. Non-Regresi Progress & Rekor Terbaik', () => {
    it('tidak menurunkan status COMPLETED saat pemain mengulang level dan gagal', async () => {
      // Pemain sudah pernah menuntaskan level 1.1 dengan 3 bintang
      mockGetSingleLevelProgress.mockResolvedValueOnce({
        id: 'prog-0001',
        profileId: mockProfileId,
        levelId: mockLevelId,
        levelCode: '1.1',
        status: 'COMPLETED',
        stars: 3,
        bestAttempts: 1,
        bestTimeMs: 1200,
        completedAt: '2026-10-10T00:00:00.000Z',
        updatedAt: '2026-10-10T00:00:00.000Z',
      });

      // Pemain mengulang tapi gagal (hanya 1 MOVE)
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE'],
      });

      expect(result.success).toBe(true);
      expect(result.verifiedResult?.successful).toBe(false);

      // Status progress tetap dipertahankan COMPLETED dengan 3 bintang
      expect(mockUpdateLevelProgress).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'COMPLETED',
          stars: 3,
          bestAttempts: 1,
          bestTimeMs: 1200,
        })
      );
    });

    it('memperbarui bintang terbaik dan waktu terbaik jika attempt baru lebih baik', async () => {
      // Sebelumnya selesai dengan 1 bintang dan waktu 5000ms
      mockGetSingleLevelProgress.mockResolvedValueOnce({
        id: 'prog-0001',
        profileId: mockProfileId,
        levelId: mockLevelId,
        levelCode: '1.1',
        status: 'COMPLETED',
        stars: 1,
        bestAttempts: 3,
        bestTimeMs: 5000,
        completedAt: '2026-10-10T00:00:00.000Z',
        updatedAt: '2026-10-10T00:00:00.000Z',
      });

      // Attempt baru berhasil dengan 3 bintang dan waktu 1200ms
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE', 'MOVE', 'MOVE'],
        durationMs: 1200,
      });

      expect(result.success).toBe(true);
      expect(mockUpdateLevelProgress).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'COMPLETED',
          stars: 3,
          bestTimeMs: 1200,
        })
      );
    });

    it('mempertahankan waktu terbaik yang lebih cepat saat attempt baru lebih lambat', async () => {
      // Sebelumnya selesai dengan 3 bintang dan waktu 1000ms
      mockGetSingleLevelProgress.mockResolvedValueOnce({
        id: 'prog-0001',
        profileId: mockProfileId,
        levelId: mockLevelId,
        levelCode: '1.1',
        status: 'COMPLETED',
        stars: 3,
        bestAttempts: 1,
        bestTimeMs: 1000,
        completedAt: '2026-10-10T00:00:00.000Z',
        updatedAt: '2026-10-10T00:00:00.000Z',
      });

      // Attempt baru berhasil dengan waktu 4500ms
      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE', 'MOVE', 'MOVE'],
        durationMs: 4500,
      });

      expect(result.success).toBe(true);
      expect(mockUpdateLevelProgress).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'COMPLETED',
          stars: 3,
          bestTimeMs: 1000, // Tetap 1000ms yang lebih cepat
        })
      );
    });
  });

  describe('5. Penanganan Kegagalan Database (Anti Fake Persistence)', () => {
    it('menangani kegagalan database saat recordAttempt dan tidak mengklaim sukses', async () => {
      mockRecordAttempt.mockRejectedValueOnce(
        new DatabaseOperationError('Gagal menyisipkan catatan attempt ke Supabase.')
      );

      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Kendala penyimpanan database');
      expect(result.error).toContain('Gagal menyisipkan catatan attempt');
      expect(mockUpdateLevelProgress).not.toHaveBeenCalled();
    });

    it('menangani kegagalan database saat updateLevelProgress secara transparan', async () => {
      mockUpdateLevelProgress.mockRejectedValueOnce(
        new DatabaseOperationError('Gagal memperbarui progres level.')
      );

      const result = await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Kendala penyimpanan database');
      expect(result.error).toContain('Gagal memperbarui progres level');
    });
  });

  describe('6. Pemulihan Progress & Sinkronisasi Store', () => {
    it('memulihkan status level dan membuka level berikutnya pada ProgressionStore', () => {
      const store = useProgressionStore.getState();
      store.resetProgress();

      // Sebelum sync, hanya level 1.1 yang NOT_STARTED
      expect(store.progress['1.1']?.status).toBe('NOT_STARTED');

      // Sinkronisasi data yang dimuat dari database Supabase
      store.syncProgressFromDatabase([
        {
          levelCode: '1.1',
          status: 'COMPLETED',
          stars: 3,
          bestAttempts: 1,
        },
      ]);

      const stateAfter = useProgressionStore.getState();
      expect(stateAfter.progress['1.1'].status).toBe('COMPLETED');
      expect(stateAfter.progress['1.1'].stars).toBe(3);

      // Verifikasi bahwa level 1.2 kini terbuka (unlocked) karena prasyarat 1.1 terpenuhi
      const completedCodes = new Set(['1.1']);
      expect(isLevelUnlocked('1.2', completedCodes)).toBe(true);

      // Level 1.3 masih terkunci karena 1.2 belum selesai
      expect(isLevelUnlocked('1.3', completedCodes)).toBe(false);
    });

    it('getPlayerProgressAction mengembalikan daftar progres dari database untuk pemain yang sah', async () => {
      const mockDbList: PlayerProgressDTO[] = [
        {
          id: 'prog-01',
          profileId: mockProfileId,
          levelId: mockLevelId,
          levelCode: '1.1',
          status: 'COMPLETED',
          stars: 3,
          bestAttempts: 1,
          bestTimeMs: 1100,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockGetPlayerProgress.mockResolvedValueOnce(mockDbList);

      const items = await getPlayerProgressAction();
      expect(items).toHaveLength(1);
      expect(items[0].levelCode).toBe('1.1');
      expect(items[0].status).toBe('COMPLETED');
      expect(items[0].stars).toBe(3);
    });
  });

  describe('7. Double Submission & Idempotensi', () => {
    it('menangani eksekusi berturut-turut tanpa merusak urutan attemptNumber', async () => {
      // First attempt
      mockGetAttemptCount.mockResolvedValueOnce(0);
      await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
      });
      expect(mockRecordAttempt).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ attemptNumber: 1 })
      );

      // Second attempt
      mockGetAttemptCount.mockResolvedValueOnce(1);
      await submitGameplayAttemptAction({
        levelCode: '1.1',
        actions: ['MOVE', 'MOVE'],
      });
      expect(mockRecordAttempt).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ attemptNumber: 2 })
      );
    });
  });
});
