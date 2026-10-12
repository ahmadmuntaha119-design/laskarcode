import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LEVEL_CATALOG } from '@/game/levels/catalog';
import { levelConfigSchema } from '@/services/types';

describe('Database Schema & Migration Validation', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const schemaSql = fs.readFileSync(path.join(migrationsDir, '001_initial_schema.sql'), 'utf-8');
  const rlsSql = fs.readFileSync(path.join(migrationsDir, '002_rls_policies.sql'), 'utf-8');
  const seedSql = fs.readFileSync(path.join(migrationsDir, '003_seed_data.sql'), 'utf-8');

  const EXPECTED_TABLES = [
    'profiles',
    'recovery_codes',
    'islands',
    'levels',
    'concepts',
    'level_concepts',
    'level_progress',
    'level_attempts',
    'mastery',
    'learning_events',
    'ai_interactions',
  ];

  it('mendefinisikan tepat 11 tabel inti dalam 001_initial_schema.sql', () => {
    for (const table of EXPECTED_TABLES) {
      const regex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}\\b`, 'i');
      expect(schemaSql, `Table ${table} harus didefinisikan`).toMatch(regex);
    }
  });

  it('menerapkan constraint kolom sesuai spesifikasi Dokumen Acuan §15', () => {
    // Constraint difficulty: 1 <= difficulty <= 5
    expect(schemaSql).toMatch(/difficulty\s+INTEGER\s+NOT\s+NULL\s+CHECK\s*\(\s*difficulty\s*>=\s*1\s+AND\s+difficulty\s*<=\s*5\s*\)/i);

    // Constraint weight: 0 <= weight <= 1
    expect(schemaSql).toMatch(/weight\s+NUMERIC\s+NOT\s+NULL\s+CHECK\s*\(\s*weight\s*>=\s*0\s+AND\s+weight\s*<=\s*1\s*\)/i);

    // Constraint stars: 0 <= stars <= 3
    expect(schemaSql).toMatch(/stars\s+SMALLINT\s+NOT\s+NULL\s+DEFAULT\s+0\s+CHECK\s*\(\s*stars\s*>=\s*0\s+AND\s+stars\s*<=\s*3\s*\)/i);

    // Constraint mastery score: 0 <= score <= 100
    expect(schemaSql).toMatch(/score\s+NUMERIC\(5,2\)\s+NOT\s+NULL\s+DEFAULT\s+0\.00\s+CHECK\s*\(\s*score\s*>=\s*0\.00\s+AND\s+score\s*<=\s*100\.00\s*\)/i);

    // Constraint status progress
    expect(schemaSql).toMatch(/status\s+VARCHAR\(20\)\s+NOT\s+NULL\s+CHECK\s*\(\s*status\s+IN\s*\('NOT_STARTED',\s*'IN_PROGRESS',\s*'COMPLETED'\)\)/i);

    // Constraint AI interaction type
    expect(schemaSql).toMatch(/type\s+VARCHAR\(30\)\s+NOT\s+NULL\s+CHECK\s*\(\s*type\s+IN\s*\('KAWAN_KOD',\s*'BOTI_STORY'\)\)/i);
  });

  it('menerapkan 6 indeks yang direkomendasikan pada Dokumen Acuan §17', () => {
    expect(schemaSql).toMatch(/idx_levels_island_order/i);
    expect(schemaSql).toMatch(/idx_level_progress_profile_level/i);
    expect(schemaSql).toMatch(/idx_level_attempts_profile_level/i);
    expect(schemaSql).toMatch(/idx_mastery_profile_concept/i);
    expect(schemaSql).toMatch(/idx_learning_events_profile_created/i);
    expect(schemaSql).toMatch(/idx_ai_interactions_profile_created/i);
  });

  it('mengaktifkan RLS pada seluruh 11 tabel dalam 002_rls_policies.sql', () => {
    for (const table of EXPECTED_TABLES) {
      const regex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(rlsSql, `RLS harus diaktifkan pada tabel ${table}`).toMatch(regex);
    }
  });

  it('memastikan tabel data privat pemain tidak memiliki policy publik atau anonim', () => {
    // Tabel privat tidak boleh memberikan akses public
    const privateTables = [
      'recovery_codes',
      'level_progress',
      'level_attempts',
      'mastery',
      'learning_events',
      'ai_interactions',
    ];

    for (const table of privateTables) {
      const regex = new RegExp(`CREATE POLICY [^;]+ ON public\\.${table}[^;]+TO public`, 'i');
      expect(rlsSql).not.toMatch(regex);
    }
  });

  it('memastikan seed data memuat 2 pulau dan 8 konsep inti', () => {
    // 2 Pulau
    expect(seedSql).toContain('desa-boti');
    expect(seedSql).toContain('hutan-pola');

    // 8 Konsep §14.1
    const concepts = [
      'sequence',
      'direction',
      'planning',
      'debugging',
      'pattern',
      'algorithm',
      'problem-solving',
      'efficiency',
    ];

    for (const concept of concepts) {
      expect(seedSql, `Concept '${concept}' harus ada di seed data`).toContain(`'${concept}'`);
    }
  });

  it('memastikan 12 level di seed data 100% selaras dengan Level Catalog Task 006', () => {
    expect(LEVEL_CATALOG).toHaveLength(12);

    for (const level of LEVEL_CATALOG) {
      // Memeriksa keberadaan kode level di seed SQL
      expect(seedSql, `Seed harus memuat level code ${level.code}`).toContain(`'${level.code}'`);

      // Memvalidasi JSON konfigurasi level catalog terhadap levelConfigSchema
      const configValidation = levelConfigSchema.safeParse({
        grid: level.grid,
        start: level.start,
        goal: level.goal,
        obstacles: level.obstacles,
        availableBlocks: level.availableBlocks,
        maxActions: level.maxActions,
      });

      expect(configValidation.success, `Konfigurasi level ${level.code} harus valid Zod`).toBe(true);
    }
  });
});
