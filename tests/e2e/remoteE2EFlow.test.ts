import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID, createHmac } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { ProgressService } from '@/services/progressService';
import { LevelService } from '@/services/levelService';
import { generateRecoveryCode, getRecoveryCodeSecret } from '@/lib/security/recoveryCode';
import { signGuestSessionPayload, verifyGuestSessionToken } from '@/lib/session/crypto';
import type { AuthContext } from '@/services/types';
import { isLevelUnlocked } from '@/game/levels/progression';

// Muat .env.local jika ada untuk pengujian langsung ke database Supabase remote
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

describe.runIf(hasRemoteEnv)('Task 012 — E2E Live Remote Supabase Flow (FULL PLAYER JOURNEY)', () => {
  let supabase: SupabaseClient<Database>;
  const testProfileId = randomUUID();
  const testNickname = `BotiE2E-${Date.now().toString().slice(-4)}`;
  const testAvatarId = 'boti_kreatif';
  let rawRecoveryCode: string;

  const authContext: AuthContext = {
    profileId: testProfileId,
    isAuthenticated: true,
  };

  beforeAll(async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  });

  afterAll(async () => {
    // Bersihkan test profile (CASCADE akan menghapus level_attempts, level_progress, recovery_codes)
    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', testProfileId);
      } catch (err) {
        console.warn('Gagal membersihkan remote test profile:', err);
      }
    }
  });

  it('Langkah 1: Pemain baru mendaftar (Profile & Recovery Code tersimpan di remote DB)', async () => {
    // 1. Simpan profil pemain ke remote profiles table
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: testProfileId,
        nickname: testNickname,
        avatar_id: testAvatarId,
      })
      .select()
      .single();

    expect(profileErr).toBeNull();
    expect(profileData).toBeDefined();
    expect(profileData!.nickname).toBe(testNickname);
    expect(profileData!.avatar_id).toBe(testAvatarId);

    // 2. Generate Kode Petualangan ramah anak (format BOTI-XXXX-XX)
    rawRecoveryCode = generateRecoveryCode();
    expect(rawRecoveryCode).toMatch(/^BOTI-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{2}$/i);

    // 3. Hash Kode Petualangan dengan HMAC SHA-256 (jangan simpan kode mentah di DB)
    const recoverySecret = getRecoveryCodeSecret();
    const codeHash = createHmac('sha256', recoverySecret).update(rawRecoveryCode).digest('hex');

    const { error: codeErr } = await supabase.from('recovery_codes').insert({
      profile_id: testProfileId,
      code_hash: codeHash,
    });
    expect(codeErr).toBeNull();

    // 4. Terbitkan Guest Session bertanda tangan HMAC
    const now = Date.now();
    const sessionToken = signGuestSessionPayload({
      profileId: testProfileId,
      issuedAt: now,
      expiresAt: now + 86400 * 1000,
      v: 1,
    });
    expect(sessionToken).toBeDefined();

    const verifiedSession = verifyGuestSessionToken(sessionToken);
    expect(verifiedSession).not.toBeNull();
    expect(verifiedSession?.profileId).toBe(testProfileId);
  });

  it('Langkah 2: Pemain menyelesaikan Level 1.1 dan attempt/progress tersimpan di remote DB', async () => {
    const levelService = new LevelService(supabase);
    const progressService = new ProgressService(supabase);

    const level11 = await levelService.getLevelByCode('1.1');
    expect(level11).toBeDefined();
    if (!level11) throw new Error('Level 1.1 tidak ditemukan di database');

    // Rekam attempt Level 1.1 ke database remote
    const recordedAttempt = await progressService.recordAttempt(authContext, {
      profileId: testProfileId,
      levelId: level11.id,
      attemptNumber: 1,
      successful: true,
      actionsUsed: 4,
      collisions: 0,
      timeToCompleteMs: 1450,
      errorTypes: [],
      programData: ['MOVE', 'MOVE', 'MOVE', 'MOVE'],
      startedAt: new Date(Date.now() - 1450).toISOString(),
      completedAt: new Date().toISOString(),
    });

    expect(recordedAttempt.attemptId).toBeDefined();

    // Update level_progress ke status COMPLETED dengan 3 bintang
    const updatedProgress = await progressService.updateLevelProgress(authContext, {
      profileId: testProfileId,
      levelId: level11.id,
      status: 'COMPLETED',
      stars: 3,
      bestAttempts: 1,
      bestTimeMs: 1450,
      completedAt: new Date().toISOString(),
    });

    expect(updatedProgress.status).toBe('COMPLETED');
    expect(updatedProgress.stars).toBe(3);

    // Verifikasi baris fisik di Supabase remote
    const { data: dbProgressRows, error: fetchErr } = await supabase
      .from('level_progress')
      .select('*')
      .eq('profile_id', testProfileId)
      .eq('level_id', level11.id);

    expect(fetchErr).toBeNull();
    expect(dbProgressRows).toHaveLength(1);
    expect(dbProgressRows![0].status).toBe('COMPLETED');
    expect(dbProgressRows![0].stars).toBe(3);
  });

  it('Langkah 3: Pemulihan saat refresh (Fetch progress dari DB membuka Level 1.2)', async () => {
    const progressService = new ProgressService(supabase);

    // Simulasi refresh browser: ambil seluruh progress dari remote DB
    const playerProgress = await progressService.getPlayerProgress(authContext, testProfileId);

    expect(playerProgress).toHaveLength(1);
    expect(playerProgress[0].levelCode).toBe('1.1');
    expect(playerProgress[0].status).toBe('COMPLETED');
    expect(playerProgress[0].stars).toBe(3);

    // Verifikasi bahwa dengan Level 1.1 COMPLETED, Level 1.2 terbuka (unlocked)
    const completedCodes = new Set(
      playerProgress.filter((p) => p.status === 'COMPLETED').map((p) => p.levelCode!)
    );

    expect(isLevelUnlocked('1.2', completedCodes)).toBe(true);
    expect(isLevelUnlocked('1.3', completedCodes)).toBe(false);
  });

  it('Langkah 4: Pemulihan akun pada perangkat baru dengan Kode Petualangan', async () => {
    // Simulasi browser/perangkat baru tanpa cookie sesi:
    // Pemain memasukkan rawRecoveryCode di halaman /profile/recover
    const recoverySecret = getRecoveryCodeSecret();
    const queryHash = createHmac('sha256', recoverySecret).update(rawRecoveryCode).digest('hex');

    // Query recovery code dari remote DB
    const { data: codeRecord, error: codeFindErr } = await supabase
      .from('recovery_codes')
      .select('profile_id')
      .eq('code_hash', queryHash)
      .single();

    expect(codeFindErr).toBeNull();
    expect(codeRecord?.profile_id).toBe(testProfileId);

    // Ambil data profil yang sama
    const { data: restoredProfile, error: profileFindErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', codeRecord!.profile_id)
      .single();

    expect(profileFindErr).toBeNull();
    expect(restoredProfile?.id).toBe(testProfileId);
    expect(restoredProfile?.nickname).toBe(testNickname);

    // Terbitkan sesi baru untuk perangkat baru
    const now = Date.now();
    const newSessionToken = signGuestSessionPayload({
      profileId: restoredProfile!.id,
      issuedAt: now,
      expiresAt: now + 86400 * 1000,
      v: 1,
    });

    const newSession = verifyGuestSessionToken(newSessionToken);
    expect(newSession?.profileId).toBe(testProfileId);

    // Progres pemain yang dipulihkan tetap utuh tanpa membuat profil ganda
    const progressService = new ProgressService(supabase);
    const restoredProgress = await progressService.getPlayerProgress(
      { profileId: newSession!.profileId, isAuthenticated: true },
      newSession!.profileId
    );

    expect(restoredProgress).toHaveLength(1);
    expect(restoredProgress[0].levelCode).toBe('1.1');
    expect(restoredProgress[0].status).toBe('COMPLETED');
  });

  it('Langkah 5: Keamanan — Percobaan manipulasi kepemilikan ditolak (assertAuthorized)', async () => {
    const progressService = new ProgressService(supabase);
    const attackerProfileId = randomUUID();

    // Penyerang mencoba mengambil progress korban dengan auth context miliknya
    await expect(
      progressService.getPlayerProgress(
        { profileId: attackerProfileId, isAuthenticated: true },
        testProfileId // profile korban
      )
    ).rejects.toThrow();

    // Penyerang mencoba memutasi attempt korban dengan auth context miliknya
    await expect(
      progressService.recordAttempt(
        { profileId: attackerProfileId, isAuthenticated: true },
        {
          profileId: testProfileId,
          levelId: randomUUID(),
          attemptNumber: 1,
          successful: true,
          actionsUsed: 1,
          collisions: 0,
          errorTypes: [],
          programData: ['MOVE'],
        }
      )
    ).rejects.toThrow();
  });
});
