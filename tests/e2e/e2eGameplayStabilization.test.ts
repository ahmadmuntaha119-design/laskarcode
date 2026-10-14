import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '@/game/engine/GameEngine';
import { GameController } from '@/game/execution/GameController';
import { getLevelByCode } from '@/game/levels/catalog';
import { isLevelUnlocked, computeLevelSummary } from '@/game/levels/progression';
import { useProgressionStore } from '@/game/levels/store';
import { calculateStars } from '@/game/levels/progression';
import type { GameAction } from '@/game/types';

describe('Task 012 — E2E Gameplay Stabilization & Core Flow Verification', () => {
  beforeEach(() => {
    useProgressionStore.getState().resetProgress();
  });

  describe('1. Gameplay Verification — Level 1.1 (Desa Boti)', () => {
    const level11 = getLevelByCode('1.1')!;

    it('Level 1.1: 4 langkah MOVE membawa Boti tepat ke goal target', () => {
      const engine = new GameEngine(level11);
      const actions: GameAction[] = ['MOVE', 'MOVE', 'MOVE', 'MOVE'];

      const result = engine.execute(actions);

      expect(result.completed).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.actionsExecuted).toBe(4);
      expect(result.collisions).toBe(0);
      expect(result.finalPosition.x).toBe(level11.goal.x);
      expect(result.finalPosition.y).toBe(level11.goal.y);

      // Verifikasi perolehan 3 bintang (efisien & tanpa tabrakan)
      const stars = calculateStars(true, result.actionsExecuted, result.collisions, level11.maxActions);
      expect(stars).toBe(3);
    });

    it('Level 1.1: Kurang langkah MOVE menghasilkan status gagal tanpa menabrak', () => {
      const engine = new GameEngine(level11);
      const actions: GameAction[] = ['MOVE', 'MOVE']; // hanya 2 langkah

      const result = engine.execute(actions);

      expect(result.completed).toBe(false);
      expect(result.status).toBe('FAILED'); // belum mencapai target saat aksi habis
      expect(result.actionsExecuted).toBe(2);
      expect(result.collisions).toBe(0);

      const stars = calculateStars(false, result.actionsExecuted, result.collisions, level11.maxActions);
      expect(stars).toBe(0);
    });
  });

  describe('2. Gameplay Verification — Level 1.3 (Belok & Orientasi)', () => {
    const level13 = getLevelByCode('1.3')!;

    it('Level 1.3: Berbelok kanan dan kiri dengan tepat menghindari rintangan', () => {
      // Level 1.3: Start (0,0) facing EAST. Obstacles: (3,0), (1,1). Goal: (3,2).
      // Path: (0,0) -> MOVE -> (1,0) -> MOVE -> (2,0)
      // -> TURN_RIGHT (SOUTH) -> MOVE -> (2,1) -> MOVE -> (2,2)
      // -> TURN_LEFT (EAST) -> MOVE -> (3,2) [GOAL]
      const engine = new GameEngine(level13);
      const actions: GameAction[] = [
        'MOVE',
        'MOVE',
        'TURN_RIGHT',
        'MOVE',
        'MOVE',
        'TURN_LEFT',
        'MOVE',
      ];

      const result = engine.execute(actions);

      expect(result.completed).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.actionsExecuted).toBe(7);
      expect(result.collisions).toBe(0);
      expect(result.finalPosition.x).toBe(3);
      expect(result.finalPosition.y).toBe(2);

      const stars = calculateStars(true, result.actionsExecuted, result.collisions, level13.maxActions);
      expect(stars).toBe(3);
    });

    it('Level 1.3: Berbelok ke arah yang salah menyebabkan tabrakan rintangan atau dinding', () => {
      // Jika dari (0,0) menghadap EAST, berbelok kanan lalu maju langsung ke (0,1) lalu belok kiri maju ke (1,1) [RINTANGAN]
      const engine = new GameEngine(level13);
      const actions: GameAction[] = [
        'TURN_RIGHT', // south
        'MOVE',       // (0,1)
        'TURN_LEFT',  // east
        'MOVE',       // (1,1) -> OBSTACLE!
      ];

      const result = engine.execute(actions);

      expect(result.completed).toBe(false);
      expect(result.status).toBe('FAILED');
      expect(result.collisions).toBe(1);

      // Verifikasi event obstacle collision tercatat
      const collisionEvents = engine.getEvents().filter((e) => e.type === 'OBSTACLE_COLLISION');
      expect(collisionEvents).toHaveLength(1);
    });
  });

  describe('3. Gameplay Verification — Level 1.5 (Debugging & Koreksi Program)', () => {
    const level15 = getLevelByCode('1.5')!;

    it('Level 1.5: Program bermasalah (menabrak rintangan) terdeteksi gagal', () => {
      // Start (0,1) facing EAST. Obstacle di (2,1).
      // Program salah: Maju lurus 2 kali -> menabrak rintangan di (2,1)!
      const buggyActions: GameAction[] = ['MOVE', 'MOVE'];
      const engine = new GameEngine(level15);

      const result = engine.execute(buggyActions);

      expect(result.completed).toBe(false);
      expect(result.status).toBe('FAILED');
      expect(result.collisions).toBe(1);
    });

    it('Level 1.5: Program yang diperbaiki berhasil mencapai goal target', () => {
      // Program perbaikan:
      // Dari (0,1) facing EAST:
      // MOVE -> (1,1)
      // TURN_RIGHT -> facing SOUTH
      // MOVE -> (1,2)
      // MOVE -> (1,3)
      // TURN_LEFT -> facing EAST
      // MOVE -> (2,3)
      // MOVE -> (3,3) [GOAL]
      const correctedActions: GameAction[] = [
        'MOVE',
        'TURN_RIGHT',
        'MOVE',
        'MOVE',
        'TURN_LEFT',
        'MOVE',
        'MOVE',
      ];
      const engine = new GameEngine(level15);

      const result = engine.execute(correctedActions);

      expect(result.completed).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.collisions).toBe(0);
      expect(result.finalPosition.x).toBe(3);
      expect(result.finalPosition.y).toBe(3);
    });
  });

  describe('4. Gameplay Verification — Level 2.1 (Hutan Pola)', () => {
    const level21 = getLevelByCode('2.1')!;

    it('Level 2.1: Menuntaskan pola pergerakan tangga di Hutan Pola', () => {
      // Start (0,0) facing EAST. Obstacles: (3,0), (5,1). Goal: (6,2).
      // Pola berulang:
      // Langkah 1: MOVE, MOVE -> (2,0), TURN_RIGHT -> SOUTH, MOVE -> (2,1), TURN_LEFT -> EAST
      // Langkah 2: MOVE, MOVE -> (4,1), TURN_RIGHT -> SOUTH, MOVE -> (4,2), TURN_LEFT -> EAST
      // Langkah 3: MOVE, MOVE -> (6,2) [GOAL]
      const patternActions: GameAction[] = [
        'MOVE', 'MOVE', 'TURN_RIGHT', 'MOVE', 'TURN_LEFT',
        'MOVE', 'MOVE', 'TURN_RIGHT', 'MOVE', 'TURN_LEFT',
        'MOVE', 'MOVE',
      ];

      const engine = new GameEngine(level21);
      const result = engine.execute(patternActions);

      expect(result.completed).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.collisions).toBe(0);
      expect(result.actionsExecuted).toBe(12);
      expect(result.finalPosition.x).toBe(6);
      expect(result.finalPosition.y).toBe(2);

      const stars = calculateStars(true, result.actionsExecuted, result.collisions, level21.maxActions);
      expect(stars).toBe(3);
    });
  });

  describe('5. Collision & Batas Grid', () => {
    const level11 = getLevelByCode('1.1')!;

    it('Boti menabrak batas grid utara saat diarahkan ke luar koordinat', () => {
      // Dari (0,1) belok kiri (NORTH) lalu maju -> y: 0 -> batas grid y < 0
      const engine = new GameEngine(level11);
      const actions: GameAction[] = ['TURN_LEFT', 'MOVE', 'MOVE'];

      const result = engine.execute(actions);

      expect(result.status).toBe('FAILED');
      expect(result.collisions).toBeGreaterThanOrEqual(1);
      const boundaryEvents = engine.getEvents().filter((e) => e.type === 'BOUNDARY_COLLISION');
      expect(boundaryEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('6. GameController — RUN, RESET, dan Cancel Execution', () => {
    const level11 = getLevelByCode('1.1')!;

    it('GameController dapat me-reset state Boti kembali ke konfigurasi awal', async () => {
      const controller = new GameController(level11);
      expect(controller.getStatus()).toBe('IDLE');

      // Jalankan langkah parsial
      const runPromise = controller.run(['MOVE', 'MOVE', 'MOVE', 'MOVE'], { stepDelayMs: 10 });
      await runPromise;

      expect(controller.getStatus()).toBe('SUCCESS');
      expect(controller.getState().position.x).toBe(4);

      // Panggil reset
      controller.reset();
      expect(controller.getStatus()).toBe('IDLE');
      expect(controller.getState().position.x).toBe(level11.start.x);
      expect(controller.getState().position.y).toBe(level11.start.y);
      expect(controller.getState().direction).toBe(level11.start.direction);
      expect(controller.getActionsExecuted()).toBe(0);
      expect(controller.getCollisions()).toBe(0);
    });

    it('GameController dapat membatalkan eksekusi yang sedang berjalan', async () => {
      const controller = new GameController(level11);
      const runPromise = controller.run(['MOVE', 'MOVE', 'MOVE', 'MOVE'], { stepDelayMs: 200 });

      // Batalkan eksekusi segera
      controller.cancelExecution();
      await runPromise;

      expect(controller.getStatus()).toBe('IDLE');
    });

    it('Workspace kosong menghasilkan pesan kegagalan ramah tanpa crash', async () => {
      const controller = new GameController(level11);
      const result = await controller.run([], { stepDelayMs: 10 });

      expect(result.status).toBe('FAILED');
      expect(result.completed).toBe(false);
      expect(result.actionsExecuted).toBe(0);
    });
  });

  describe('7. Level Progression & Prerequisite Logic', () => {
    it('membuka level berikutnya secara bertahap saat level sebelumnya COMPLETED', () => {
      const store = useProgressionStore.getState();
      store.resetProgress();

      // Awalnya hanya 1.1 yang terbuka
      expect(isLevelUnlocked('1.1', new Set())).toBe(true);
      expect(isLevelUnlocked('1.2', new Set())).toBe(false);

      // Selesaikan level 1.1
      store.completeLevel('1.1', 3);
      const completedSet1 = new Set(['1.1']);
      expect(isLevelUnlocked('1.2', completedSet1)).toBe(true);
      expect(isLevelUnlocked('1.3', completedSet1)).toBe(false);

      // Selesaikan level 1.2
      store.completeLevel('1.2', 2);
      const completedSet2 = new Set(['1.1', '1.2']);
      expect(isLevelUnlocked('1.3', completedSet2)).toBe(true);
      expect(isLevelUnlocked('1.4', completedSet2)).toBe(false);
    });

    it('computeLevelSummary menghitung status LOCKED, AVAILABLE, dan COMPLETED secara runtime', () => {
      const level11 = getLevelByCode('1.1')!;
      const level12 = getLevelByCode('1.2')!;

      // Kondisi awal (belum ada yang selesai)
      const summary11 = computeLevelSummary(level11, {});
      expect(summary11.computedStatus).toBe('AVAILABLE');
      expect(summary11.isAvailable).toBe(true);
      expect(summary11.isLocked).toBe(false);

      const summary12 = computeLevelSummary(level12, {});
      expect(summary12.computedStatus).toBe('LOCKED');
      expect(summary12.isAvailable).toBe(false);
      expect(summary12.isLocked).toBe(true);

      // Setelah 1.1 selesai
      const progressAfter = {
        '1.1': { status: 'COMPLETED' as const, stars: 3 },
      };
      const summary11After = computeLevelSummary(level11, progressAfter);
      expect(summary11After.computedStatus).toBe('COMPLETED');
      expect(summary11After.stars).toBe(3);

      const summary12After = computeLevelSummary(level12, progressAfter);
      expect(summary12After.computedStatus).toBe('AVAILABLE');
      expect(summary12After.isAvailable).toBe(true);
      expect(summary12After.isLocked).toBe(false);
    });
  });
});
