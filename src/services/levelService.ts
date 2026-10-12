/**
 * Level Service
 * Bertanggung jawab mengambil konfigurasi level aktif dari database Supabase
 * dan memvalidasi integritas strukturnya.
 *
 * Dokumen Acuan: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §15.4, §16, §19
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import {
  ActiveLevelDTO,
  levelConfigSchema,
  DatabaseOperationError,
  ConfigurationError,
  ValidationError,
} from './types';

interface LevelConceptRelation {
  weight: number | string;
  role: string;
  concepts: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

interface IslandRelation {
  id: string;
  slug: string;
  name: string;
  order_index: number;
  is_active: boolean;
}

interface LevelQueryRow {
  id: string;
  island_id: string;
  code: string;
  title: string;
  description: string | null;
  level_type: string;
  order_index: number;
  difficulty: number;
  configuration: unknown;
  is_active: boolean;
  islands: IslandRelation;
  level_concepts: LevelConceptRelation[];
}

export class LevelService {
  private client?: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client;
  }

  private async getClient(): Promise<SupabaseClient<Database>> {
    if (this.client) return this.client;

    // Coba inisialisasi server client jika di server environment
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
   * Mengambil semua level aktif yang diurutkan berdasarkan urutan pulau dan order_index level.
   */
  async getActiveLevels(): Promise<ActiveLevelDTO[]> {
    const supabase = await this.getClient();

    const { data, error } = (await supabase
      .from('levels')
      .select(`
        id,
        island_id,
        code,
        title,
        description,
        level_type,
        order_index,
        difficulty,
        configuration,
        is_active,
        islands!inner (
          id,
          slug,
          name,
          order_index,
          is_active
        ),
        level_concepts (
          weight,
          role,
          concepts (
            id,
            slug,
            name
          )
        )
      `)
      .eq('is_active', true)
      .eq('islands.is_active', true)
      .order('order_index', { ascending: true })) as unknown as {
      data: LevelQueryRow[] | null;
      error: { message: string } | null;
    };

    if (error) {
      throw new DatabaseOperationError(
        `Gagal mengambil data level aktif dari database: ${error.message}`,
        error
      );
    }

    if (!data) return [];

    return data.map((row) => {
      // Validasi konfigurasi JSONB
      const configParse = levelConfigSchema.safeParse(row.configuration);
      if (!configParse.success) {
        throw new ValidationError(
          `Konfigurasi level '${row.code}' tidak valid sesuai skema LevelConfig.`,
          configParse.error.issues
        );
      }

      // Format relasi konsep
      const rawLevelConcepts = (row.level_concepts as unknown as LevelConceptRelation[]) || [];
      const concepts = rawLevelConcepts
        .filter((lc): lc is LevelConceptRelation & { concepts: NonNullable<LevelConceptRelation['concepts']> } => Boolean(lc.concepts))
        .map((lc) => ({
          slug: lc.concepts.slug,
          name: lc.concepts.name,
          weight: Number(lc.weight),
          role: lc.role,
        }));

      const island = row.islands as unknown as IslandRelation;

      return {
        id: row.id,
        islandId: row.island_id,
        islandSlug: island.slug,
        islandName: island.name,
        code: row.code,
        title: row.title,
        description: row.description,
        levelType: row.level_type,
        orderIndex: row.order_index,
        difficulty: row.difficulty,
        configuration: configParse.data,
        concepts,
      };
    });
  }

  /**
   * Mengambil detail level aktif tunggal berdasarkan kode level (misal '1.1').
   */
  async getLevelByCode(code: string): Promise<ActiveLevelDTO | null> {
    const supabase = await this.getClient();

    const { data, error } = (await supabase
      .from('levels')
      .select(`
        id,
        island_id,
        code,
        title,
        description,
        level_type,
        order_index,
        difficulty,
        configuration,
        is_active,
        islands!inner (
          id,
          slug,
          name,
          order_index,
          is_active
        ),
        level_concepts (
          weight,
          role,
          concepts (
            id,
            slug,
            name
          )
        )
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single()) as unknown as {
      data: LevelQueryRow | null;
      error: { message: string; code?: string } | null;
    };

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw new DatabaseOperationError(
        `Gagal mengambil level dengan kode '${code}': ${error.message}`,
        error
      );
    }

    if (!data) return null;

    const configParse = levelConfigSchema.safeParse(data.configuration);
    if (!configParse.success) {
      throw new ValidationError(
        `Konfigurasi level '${data.code}' tidak valid.`,
        configParse.error.issues
      );
    }

    const rawLevelConcepts = (data.level_concepts as unknown as LevelConceptRelation[]) || [];
    const concepts = rawLevelConcepts
      .filter((lc): lc is LevelConceptRelation & { concepts: NonNullable<LevelConceptRelation['concepts']> } => Boolean(lc.concepts))
      .map((lc) => ({
        slug: lc.concepts.slug,
        name: lc.concepts.name,
        weight: Number(lc.weight),
        role: lc.role,
      }));

    const island = data.islands as unknown as IslandRelation;

    return {
      id: data.id,
      islandId: data.island_id,
      islandSlug: island.slug,
      islandName: island.name,
      code: data.code,
      title: data.title,
      description: data.description,
      levelType: data.level_type,
      orderIndex: data.order_index,
      difficulty: data.difficulty,
      configuration: configParse.data,
      concepts,
    };
  }
}
