/**
 * Progress & Attempt Service
 * Bertanggung jawab mengelola progress dan catatan percobaan pemain secara aman.
 * Menerapkan otorisasi berbasis sesi server-side dan validasi skema ketat.
 *
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §15.7, §15.8, §20, §22
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import {
  AuthContext,
  assertAuthorized,
  RecordAttemptInput,
  recordAttemptInputSchema,
  UpdateProgressInput,
  updateProgressInputSchema,
  PlayerProgressDTO,
  DatabaseOperationError,
  ValidationError,
  ConfigurationError,
} from './types';

interface ProgressQueryRow {
  id: string;
  profile_id: string;
  level_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  stars: number;
  best_attempts: number;
  best_time_ms: number | null;
  completed_at: string | null;
  updated_at: string;
  levels?: { code: string } | null;
}

export class ProgressService {
  private client?: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client;
  }

  private async getClient(): Promise<SupabaseClient<Database>> {
    if (this.client) return this.client;

    try {
      const { createClient } = await import('@/lib/supabase/server');
      return await createClient();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ConfigurationError(
        `Klien database tidak dapat diinisialisasi: ${message}`
      );
    }
  }

  /**
   * Mengambil seluruh progress level untuk pemain yang terotorisasi.
   * DILINDUNGI: Memeriksa kepemilikan auth context sebelum query.
   */
  async getPlayerProgress(
    auth: AuthContext,
    profileId: string
  ): Promise<PlayerProgressDTO[]> {
    // 1. Verifikasi otorisasi kepemilikan (Dokumen acuan §20)
    assertAuthorized(auth, profileId);

    const supabase = await this.getClient();

    const { data, error } = (await supabase
      .from('level_progress')
      .select(`
        id,
        profile_id,
        level_id,
        status,
        stars,
        best_attempts,
        best_time_ms,
        completed_at,
        updated_at,
        levels (
          code
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })) as unknown as {
      data: ProgressQueryRow[] | null;
      error: { message: string } | null;
    };

    if (error) {
      throw new DatabaseOperationError(
        `Gagal mengambil data progress untuk profil '${profileId}': ${error.message}`,
        error
      );
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      levelId: row.level_id,
      levelCode: row.levels?.code,
      status: row.status,
      stars: row.stars,
      bestAttempts: row.best_attempts,
      bestTimeMs: row.best_time_ms,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Mencatat data attempt permainan ke dalam database.
   * DILINDUNGI: Hanya pemilik profil yang boleh mencatat attempt-nya sendiri.
   */
  async recordAttempt(
    auth: AuthContext,
    input: RecordAttemptInput
  ): Promise<{ attemptId: string }> {
    // 1. Verifikasi kepemilikan
    assertAuthorized(auth, input.profileId);

    // 2. Validasi input
    const parsed = recordAttemptInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        'Data attempt permainan tidak memenuhi spesifikasi.',
        parsed.error.issues
      );
    }

    const validData = parsed.data;
    const supabase = await this.getClient();

    const attemptsTable = supabase.from('level_attempts') as unknown as {
      insert: (values: unknown) => {
        select: (columns: string) => {
          single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
        };
      };
    };

    const { data, error } = await attemptsTable
      .insert({
        profile_id: validData.profileId,
        level_id: validData.levelId,
        attempt_number: validData.attemptNumber,
        successful: validData.successful,
        actions_used: validData.actionsUsed,
        optimal_actions: validData.optimalActions ?? null,
        collisions: validData.collisions,
        hints_used: validData.hintsUsed,
        program_changes: validData.programChanges,
        time_to_complete_ms: validData.timeToCompleteMs ?? null,
        error_types: validData.errorTypes,
        program_data: validData.programData,
        started_at: validData.startedAt ?? new Date().toISOString(),
        completed_at: validData.completedAt ?? new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new DatabaseOperationError(
        `Gagal menyimpan attempt permainan ke database: ${error?.message ?? 'Operasi tidak menghasilkan data'}`,
        error
      );
    }

    return { attemptId: data.id };
  }

  /**
   * Memperbarui progress level pemain setelah permainan selesai dan divalidasi.
   * DILINDUNGI: Menggunakan upsert idempotent pada (profile_id, level_id).
   */
  async updateLevelProgress(
    auth: AuthContext,
    input: UpdateProgressInput
  ): Promise<PlayerProgressDTO> {
    // 1. Verifikasi kepemilikan
    assertAuthorized(auth, input.profileId);

    // 2. Validasi input
    const parsed = updateProgressInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        'Data update progress tidak valid.',
        parsed.error.issues
      );
    }

    const validData = parsed.data;
    const supabase = await this.getClient();

    const progressTable = supabase.from('level_progress') as unknown as {
      upsert: (values: unknown, options: { onConflict: string }) => {
        select: () => {
          single: () => Promise<{ data: ProgressQueryRow | null; error: { message: string } | null }>;
        };
      };
    };

    const { data, error } = await progressTable
      .upsert(
        {
          profile_id: validData.profileId,
          level_id: validData.levelId,
          status: validData.status,
          stars: validData.stars,
          best_attempts: validData.bestAttempts,
          best_time_ms: validData.bestTimeMs ?? null,
          completed_at: validData.completedAt ?? (validData.status === 'COMPLETED' ? new Date().toISOString() : null),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,level_id' }
      )
      .select()
      .single();

    if (error || !data) {
      throw new DatabaseOperationError(
        `Gagal memperbarui progress level di database: ${error?.message ?? 'Operasi tidak menghasilkan data'}`,
        error
      );
    }

    return {
      id: data.id,
      profileId: data.profile_id,
      levelId: data.level_id,
      status: data.status,
      stars: data.stars,
      bestAttempts: data.best_attempts,
      bestTimeMs: data.best_time_ms,
      completedAt: data.completed_at,
      updatedAt: data.updated_at,
    };
  }
}
