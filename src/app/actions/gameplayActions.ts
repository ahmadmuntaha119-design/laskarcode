'use server';

import { z } from 'zod';
import { requireGuestSession } from '@/lib/session/resolveSession';
import { LevelService } from '@/services/levelService';
import { ProgressService } from '@/services/progressService';
import { GameEngine } from '@/game/engine/GameEngine';
import type { GameAction } from '@/game/types/game';
import type { PlayerProgressDTO } from '@/services/types';
import {
  AuthorizationError,
  DatabaseOperationError,
  ValidationError,
  ConfigurationError,
} from '@/services/types';
import { getLevelByCode as getCatalogLevelByCode } from '@/game/levels/catalog';
import { calculateStars } from '@/game/levels/progression';

const gameActionSchema = z.enum(['MOVE', 'TURN_LEFT', 'TURN_RIGHT']);

const submitAttemptInputSchema = z.object({
  levelCode: z.string().min(1, 'Kode level wajib diisi'),
  actions: z.array(gameActionSchema).max(50, 'Jumlah aksi melebihi batas wajar'),
  durationMs: z.number().int().nonnegative().optional(),
  startedAt: z.string().optional(),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptInputSchema>;

export interface VerifiedGameplayResult {
  successful: boolean;
  stars: number;
  actionsUsed: number;
  collisions: number;
  status: 'SUCCESS' | 'FAILED';
}

export interface SubmitAttemptActionResult {
  success: boolean;
  verifiedResult?: VerifiedGameplayResult;
  progress?: PlayerProgressDTO;
  attemptId?: string;
  error?: string;
}

/**
 * Server Action: Validasi Hasil Gameplay dan Penyimpanan Progres ke Supabase.
 *
 * KRUSIAL UNTUK KEAMANAN (ANTI-CHEAT):
 * Hasil dari browser (klien) adalah input yang TIDAK TEPERCAYA.
 * Server akan:
 * 1. Memvalidasi session guest yang sah (identitas anak HANYA dari server cookie).
 * 2. Mengambil konfigurasi level resmi dari database/katalog.
 * 3. Memvalidasi bahwa setiap action sequence legal sesuai blok level.
 * 4. MENJALANKAN ULANG action sequence menggunakan GameEngine di server.
 * 5. Menghitung bintang dan hasil akhir secara objektif.
 * 6. Menyimpan attempt ke `level_attempts` dan memperbarui `level_progress`.
 */
export async function submitGameplayAttemptAction(
  rawInput: unknown
): Promise<SubmitAttemptActionResult> {
  // 1. Verifikasi guest session di server
  let auth;
  try {
    auth = await requireGuestSession();
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof AuthorizationError ? err.message : 'Sesi tidak valid atau telah kedaluwarsa.',
    };
  }

  const profileId = auth.profileId;

  // 2. Validasi format input dari client
  const parsed = submitAttemptInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Format data aksi permainan tidak valid.',
    };
  }

  const { levelCode, actions, durationMs, startedAt } = parsed.data;

  try {
    // 3. Ambil konfigurasi level resmi (dengan fallback aman ke LevelCatalog jika DB belum di-seed)
    const levelService = new LevelService();
    const progressService = new ProgressService();

    let levelId: string | undefined = undefined;
    let levelConfig: unknown = null;

    try {
      const level = await levelService.getLevelByCode(levelCode);
      levelId = level?.id;
      levelConfig = level?.configuration;
    } catch {
      // Database belum di-seed atau offline, gunakan fallback catalog
    }

    // Fallback ke catalog jika level query tidak mengembalikan data atau database belum siap
    if (!levelConfig) {
      const catalogLevel = getCatalogLevelByCode(levelCode);
      if (!catalogLevel) {
        return {
          success: false,
          error: `Level '${levelCode}' tidak ditemukan dalam katalog sistem.`,
        };
      }
      levelConfig = catalogLevel;
    }

    if (!levelId) {
      try {
        const allDbLevels = await levelService.getActiveLevels();
        const match = allDbLevels.find((l) => l.code === levelCode);
        levelId = match?.id;
      } catch {
        // Abaikan jika database belum siap
      }
    }

    // 4. Validasi ketersediaan blok untuk level ini
    const typedConfig = levelConfig as { availableBlocks: string[]; maxActions: number };
    const availableBlocks = new Set(typedConfig.availableBlocks);
    for (const action of actions) {
      if (!availableBlocks.has(action)) {
        return {
          success: false,
          error: `Aksi '${action}' tidak diizinkan pada level '${levelCode}'.`,
        };
      }
    }

    if (actions.length > typedConfig.maxActions) {
      return {
        success: false,
        error: `Jumlah aksi (${actions.length}) melebihi batas maksimal level (${typedConfig.maxActions}).`,
      };
    }

    // 5. SERVER-SIDE RE-EXECUTION melalui GameEngine
    const engine = new GameEngine(levelConfig);
    const verifiedResult = engine.execute(actions as readonly GameAction[]);

    const successful = verifiedResult.completed && verifiedResult.status === 'SUCCESS';
    const actionsUsed = verifiedResult.actionsExecuted;
    const collisions = verifiedResult.collisions;

    // Ekstraksi error events dari game engine jika ada
    const errorTypes = Array.from(
      new Set(
        engine
          .getEvents()
          .filter((e) =>
            ['BOUNDARY_COLLISION', 'OBSTACLE_COLLISION', 'MAX_ACTIONS_REACHED'].includes(e.type)
          )
          .map((e) => e.type)
      )
    );

    // 6. Hitung perolehan bintang server
    const computedStars = calculateStars(
      successful,
      actionsUsed,
      collisions,
      typedConfig.maxActions
    );

    let recordedAttemptId: string | undefined = undefined;
    let updatedProgress = undefined;
    let saveNotice: string | undefined = undefined;

    // 7. Simpan catatan attempt dan update level_progress jika tabel DB tersedia
    if (levelId) {
      try {
        const priorAttemptCount = await progressService.getAttemptCount(auth, profileId, levelId);
        const attemptNumber = priorAttemptCount + 1;

        const recordedAttempt = await progressService.recordAttempt(auth, {
          profileId,
          levelId,
          attemptNumber,
          successful,
          actionsUsed,
          collisions,
          timeToCompleteMs: durationMs ?? null,
          errorTypes,
          programData: actions,
          startedAt: startedAt ?? new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
        recordedAttemptId = recordedAttempt.attemptId;

        // Ambil progress sebelumnya untuk mencegah regresi data
        const existingProgress = await progressService.getSingleLevelProgress(auth, profileId, levelId);

        let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS';
        let stars = 0;
        let bestAttempts = attemptNumber;
        let bestTimeMs = durationMs ?? null;
        let completedAt: string | null = null;

        if (successful) {
          status = 'COMPLETED';
          stars = Math.max(existingProgress?.stars ?? 0, computedStars);
          bestAttempts = existingProgress?.status === 'COMPLETED' ? existingProgress.bestAttempts : attemptNumber;
          if (existingProgress?.bestTimeMs && durationMs) {
            bestTimeMs = Math.min(existingProgress.bestTimeMs, durationMs);
          } else {
            bestTimeMs = durationMs ?? existingProgress?.bestTimeMs ?? null;
          }
          completedAt = existingProgress?.completedAt ?? new Date().toISOString();
        } else {
          if (existingProgress?.status === 'COMPLETED') {
            status = 'COMPLETED';
            stars = existingProgress.stars;
            bestAttempts = existingProgress.bestAttempts;
            bestTimeMs = existingProgress.bestTimeMs;
            completedAt = existingProgress.completedAt;
          } else {
            status = 'IN_PROGRESS';
            stars = 0;
            bestAttempts = 0;
          }
        }

        updatedProgress = await progressService.updateLevelProgress(auth, {
          profileId,
          levelId,
          status,
          stars,
          bestAttempts,
          bestTimeMs,
          completedAt,
        });
      } catch (dbErr) {
        if (dbErr instanceof DatabaseOperationError) {
          return {
            success: false,
            error: `Kendala penyimpanan database: ${dbErr.message}`,
          };
        }
        console.warn('Database save warning (offline/unseeded):', dbErr);
        saveNotice = 'Progres bermain disimpan lokal (database Supabase belum aktif).';
      }
    } else {
      saveNotice = 'Progres bermain lokal (tabel database Supabase belum terisi).';
    }

    // Simpan progres ke cookie fallback agar sesi pemain offline tetap berlanjut antar level
    if (successful) {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const existingCookie = cookieStore.get('laskarcode_guest_progress')?.value;
        let progressCookieData: Record<string, { status: string; stars: number }> = {};
        if (existingCookie) {
          try {
            progressCookieData = JSON.parse(existingCookie);
          } catch {
            // Abaikan jika cookie lama tidak valid JSON
          }
        }
        progressCookieData[levelCode] = {
          status: 'COMPLETED',
          stars: Math.max(progressCookieData[levelCode]?.stars ?? 0, computedStars),
        };
        cookieStore.set({
          name: 'laskarcode_guest_progress',
          value: JSON.stringify(progressCookieData),
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 hari
        });
      } catch (cookieErr) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Gagal menyimpan fallback progress cookie:', cookieErr);
        }
      }
    }

    return {
      success: true,
      verifiedResult: {
        successful,
        stars: computedStars,
        actionsUsed,
        collisions,
        status: verifiedResult.status,
      },
      progress: updatedProgress,
      attemptId: recordedAttemptId,
      error: saveNotice,
    };
  } catch (err: unknown) {
    if (err instanceof DatabaseOperationError) {
      return {
        success: false,
        error: `Kendala penyimpanan database: ${err.message}`,
      };
    }

    if (err instanceof ValidationError) {
      return {
        success: false,
        error: `Validasi data gagal: ${err.message}`,
      };
    }

    if (err instanceof ConfigurationError) {
      return {
        success: false,
        error: `Konfigurasi server bermasalah: ${err.message}`,
      };
    }

    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memvalidasi permainan.',
    };
  }
}

/**
 * Server Action: Mengambil seluruh progres level pemain saat ini dari database.
 */
export async function getPlayerProgressAction(): Promise<PlayerProgressDTO[]> {
  try {
    const auth = await requireGuestSession();
    const progressService = new ProgressService();
    return await progressService.getPlayerProgress(auth, auth.profileId);
  } catch {
    return [];
  }
}
