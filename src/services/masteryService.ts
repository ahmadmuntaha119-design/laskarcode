/**
 * Mastery Service
 * Bertanggung jawab menyediakan data penguasaan konsep komputasional (mastery) pemain.
 * Digunakan oleh Adaptive Engine untuk menentukan penyesuaian difficulty di tahap berikutnya.
 *
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §14, §15.9, §20
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import {
  AuthContext,
  assertAuthorized,
  PlayerMasteryDTO,
  DatabaseOperationError,
  ConfigurationError,
} from './types';

interface MasteryQueryRow {
  concept_id: string;
  score: number | string;
  status: string;
  evidence_count: number;
  updated_at: string;
  concepts: {
    slug: string;
    name: string;
  };
}

export class MasteryService {
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
   * Mengambil data penguasaan seluruh konsep untuk pemain terotorisasi.
   * DILINDUNGI: Memeriksa kepemilikan auth context sebelum query.
   */
  async getPlayerMastery(
    auth: AuthContext,
    profileId: string
  ): Promise<PlayerMasteryDTO[]> {
    // 1. Verifikasi otorisasi kepemilikan
    assertAuthorized(auth, profileId);

    const supabase = await this.getClient();

    const { data, error } = (await supabase
      .from('mastery')
      .select(`
        concept_id,
        score,
        status,
        evidence_count,
        updated_at,
        concepts!inner (
          slug,
          name
        )
      `)
      .eq('profile_id', profileId)) as unknown as {
      data: MasteryQueryRow[] | null;
      error: { message: string } | null;
    };

    if (error) {
      throw new DatabaseOperationError(
        `Gagal mengambil data mastery untuk profil '${profileId}': ${error.message}`,
        error
      );
    }

    if (!data) return [];

    return data.map((row) => ({
      conceptId: row.concept_id,
      conceptSlug: row.concepts.slug,
      conceptName: row.concepts.name,
      score: Number(row.score),
      status: row.status,
      evidenceCount: row.evidence_count,
      updatedAt: row.updated_at,
    }));
  }
}
