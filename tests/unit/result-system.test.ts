import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { resolveTerminalOutcome } from '../../src/entities/result/result-types';
import { ResultSystem } from '../../src/systems/result-system';

describe('ResultSystem', () => {
  it('prioritizes Game Over when player and locomotive fail together', () => {
    expect(resolveTerminalOutcome({
      playerHealth: 0,
      locomotiveHealth: 0,
      bossDefeated: true,
      routePhase: 'DESTINATION',
      progress: 100,
    })).toEqual({ outcome: 'GAME_OVER', reason: 'PLAYER_AND_LOCOMOTIVE' });
  });

  it('distinguishes player failure, locomotive failure, and an eligible victory', () => {
    expect(resolveTerminalOutcome({
      playerHealth: 0,
      locomotiveHealth: 100,
      bossDefeated: false,
      routePhase: 'BIOME_1',
      progress: 20,
    })).toEqual({ outcome: 'GAME_OVER', reason: 'PLAYER_DOWN' });

    expect(resolveTerminalOutcome({
      playerHealth: 100,
      locomotiveHealth: 0,
      bossDefeated: false,
      routePhase: 'BIOME_3',
      progress: 90,
    })).toEqual({ outcome: 'GAME_OVER', reason: 'LOCOMOTIVE_FAILED' });

    expect(resolveTerminalOutcome({
      playerHealth: 100,
      locomotiveHealth: 38,
      bossDefeated: true,
      routePhase: 'DESTINATION',
      progress: 100,
    })).toEqual({ outcome: 'VICTORY', reason: 'DESTINATION_REACHED' });
  });

  it('requires the destination and boss before returning Victory', () => {
    expect(resolveTerminalOutcome({
      playerHealth: 100,
      locomotiveHealth: 100,
      bossDefeated: true,
      routePhase: 'BOSS',
      progress: 91.67,
    })).toBeNull();
  });

  it('captures run statistics once and resets cleanly for a new run', () => {
    const run = createInitialRunState();
    run.progress = 82;
    run.scrapCollected = 25;
    run.enemiesDefeated = 7;
    run.elapsedSeconds = 95;
    run.survivorIds.push('MONTIR');
    run.train.find((section) => section.id === 'DEFENSE')!.currentHp = 50;

    const system = new ResultSystem();
    run.player.health = 0;
    const result = system.evaluate(run, false);

    expect(result).toMatchObject({
      outcome: 'GAME_OVER',
      reason: 'PLAYER_DOWN',
      progress: 82,
      enemiesDefeated: 7,
      scrapCollected: 25,
      survivorsRescued: 1,
      runTimeSeconds: 95,
      trainCondition: 'OPERATIONAL',
      trainConditionPercent: 88,
    });
    run.progress = 99;
    expect(system.evaluate(run, false)).toBe(result);

    system.reset();
    expect(system.getResult()).toBeUndefined();
  });
});
