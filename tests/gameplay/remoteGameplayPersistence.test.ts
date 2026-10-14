import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { ProgressService } from '@/services/progressService';
import { LevelService } from '@/services/levelService';
import type { AuthContext } from '@/services/types';

// Muat .env.local jika tersedia untuk pengujian remote live
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const hasRemoteEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SECRET_KEY);

describe.runIf(hasRemoteEnv)('Remote Supabase Integration Tests (LIVE REMOTE DB)', () => {
  let supabase: SupabaseClient<Database>;
  const testProfileId = randomUUID();
  const testAvatar = 'avatar-boti-test';
  const testDisplayName = `TestChild-${Date.now().toString().slice(-4)}`;

  const authContext: AuthContext = {
    profileId: testProfileId,
    isAuthenticated: true,
  };

  beforeAll(async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  });

  afterAll(async () => {
    // Bersihkan profile uji coba (CASCADE akan menghapus attempt dan progress)
    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', testProfileId);
      } catch (e) {
        console.warn('Gagal membersihkan remote test profile:', e);
      }
    }
  });

  it('berhasil melakukan round-trip persistence (attempt & level_progress) ke Supabase Remote', async () => {
    // 1. Buat profil uji coba di database remote
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: testProfileId,
      nickname: testDisplayName,
      avatar_id: testAvatar,
    });
    expect(profileErr).toBeNull();

    // 2. Ambil level 1.1 yang ada di database remote
    const levelService = new LevelService(supabase);
    const dbLevel = await levelService.getLevelByCode('1.1');
    expect(dbLevel).toBeDefined();
    if (!dbLevel) throw new Error('dbLevel 1.1 tidak ditemukan di database');
    expect(dbLevel.code).toBe('1.1');
    expect(dbLevel.id).toBeDefined();

    const progressService = new ProgressService(supabase);

    // 3. Simpan attempt nyata ke remote Supabase
    const recordedAttempt = await progressService.recordAttempt(authContext, {
      profileId: testProfileId,
      levelId: dbLevel.id,
      attemptNumber: 1,
      successful: true,
      actionsUsed: 4,
      collisions: 0,
      timeToCompleteMs: 1350,
      errorTypes: [],
      programData: ['MOVE', 'MOVE', 'MOVE', 'MOVE'],
      startedAt: new Date(Date.now() - 1350).toISOString(),
      completedAt: new Date().toISOString(),
    });

    expect(recordedAttempt.attemptId).toBeDefined();

    // 4. Perbarui level_progress ke remote Supabase
    const updatedProgress = await progressService.updateLevelProgress(authContext, {
      profileId: testProfileId,
      levelId: dbLevel.id,
      status: 'COMPLETED',
      stars: 3,
      bestAttempts: 1,
      bestTimeMs: 1350,
      completedAt: new Date().toISOString(),
    });

    expect(updatedProgress.status).toBe('COMPLETED');
    expect(updatedProgress.stars).toBe(3);
    expect(updatedProgress.levelId).toBe(dbLevel.id);

    // 5. Query langsung dari remote Supabase untuk memverifikasi data fisik
    const { data: remoteAttempts, error: attErr } = await supabase
      .from('level_attempts')
      .select('*')
      .eq('profile_id', testProfileId)
      .eq('level_id', dbLevel.id);

    expect(attErr).toBeNull();
    expect(remoteAttempts).toHaveLength(1);
    expect(remoteAttempts![0].successful).toBe(true);
    expect(remoteAttempts![0].actions_used).toBe(4);
    expect(remoteAttempts![0].collisions).toBe(0);

    const { data: remoteProgress, error: progErr } = await supabase
      .from('level_progress')
      .select('*')
      .eq('profile_id', testProfileId)
      .eq('level_id', dbLevel.id);

    expect(progErr).toBeNull();
    expect(remoteProgress).toHaveLength(1);
    expect(remoteProgress![0].status).toBe('COMPLETED');
    expect(remoteProgress![0].stars).toBe(3);
    expect(remoteProgress![0].best_attempts).toBe(1);
    expect(remoteProgress![0].best_time_ms).toBe(1350);

    // 6. Verifikasi pengambilan daftar progres (pemulihan progres)
    const allProgress = await progressService.getPlayerProgress(authContext, testProfileId);
    expect(allProgress).toHaveLength(1);
    expect(allProgress[0].levelCode).toBe('1.1');
    expect(allProgress[0].status).toBe('COMPLETED');
    expect(allProgress[0].stars).toBe(3);
  });
});
