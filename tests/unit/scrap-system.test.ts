import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { ScrapSystem } from '../../src/systems/scrap-system';

describe('ScrapSystem', () => {
  it('uses archetype drop values and ignores duplicate enemy drops', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);

    const first = scrap.handleEnemyDrop({ enemyId: 'enemy-1', archetype: 'MIST', value: 3, x: 100, y: 100 }, 0, () => 0.5);
    const duplicate = scrap.handleEnemyDrop({ enemyId: 'enemy-1', archetype: 'MIST', value: 3, x: 100, y: 100 }, 0, () => 0.5);
    const noDrop = scrap.handleEnemyDrop({ enemyId: 'enemy-2', archetype: 'SHADOW', value: 5, x: 100, y: 100 }, 0, () => 0.95);

    expect(first).toMatchObject({ value: 3, source: 'ENEMY_DROP' });
    expect(duplicate).toBeNull();
    expect(noDrop).toBeNull();
    expect(scrap.getPickups()).toHaveLength(1);
  });

  it('honors encounter-scaled enemy drop values', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);

    const pickup = scrap.handleEnemyDrop({ enemyId: 'enemy-scaled', archetype: 'MIST', value: 6, x: 100, y: 100 }, 0, () => 0);

    expect(pickup?.value).toBe(6);
  });

  it('attracts a pickup and collects it once within the player radius', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);
    const pickup = scrap.spawnRewardPickup(5, { x: 100, y: 0 }, 0, 'ENCOUNTER_REWARD');
    expect(pickup).not.toBeNull();

    const firstUpdate = scrap.update(0.1, { x: 0, y: 0 });
    expect(firstUpdate).toEqual([]);
    const collected = scrap.update(0.3, { x: 0, y: 0 });

    expect(collected).toMatchObject([{ type: 'collected', pickupId: pickup?.id, value: 5 }]);
    expect(run.scrap).toBe(5);
    expect(run.scrapCollected).toBe(5);
    expect(scrap.update(0.3, { x: 0, y: 0 })).toEqual([]);
    expect(run.scrap).toBe(5);
  });

  it('supports rewards, spending, refunds, and insufficient-funds protection', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);

    expect(scrap.grantEncounterReward(10)).toBe(10);
    expect(scrap.grantStationReward(4)).toBe(4);
    expect(scrap.spend(9)).toBe(true);
    expect(scrap.spend(6)).toBe(false);
    expect(scrap.refund(3)).toBe(3);
    expect(scrap.spend(-1)).toBe(false);
    expect(run.scrap).toBe(8);
    expect(run.scrapCollected).toBe(14);
    expect(run.scrapSpent).toBe(9);
  });

  it('expires abandoned pickups and resets all run-local economy values', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);
    scrap.spawnRewardPickup(7, { x: 500, y: 500 }, 0, 'STATION_REWARD');

    expect(scrap.update(12.1, { x: 0, y: 0 })).toMatchObject([{ type: 'expired', value: 7 }]);
    scrap.grantEncounterReward(20);
    scrap.spend(5);
    scrap.resetRunEconomy();

    expect(run.scrap).toBe(0);
    expect(run.scrapCollected).toBe(0);
    expect(run.scrapSpent).toBe(0);
    expect(scrap.getPickups()).toEqual([]);
  });
});
