import { describe, expect, it } from 'vitest';

import { FEEDBACK_BALANCE, ROUTE_BALANCE_TARGETS } from '../../src/data/balance-config';
import { BASE_WEAPON } from '../../src/data/player-config';
import { RAKSASA_ALAS_CONFIG } from '../../src/data/boss-config';
import { STATION_DEFINITIONS } from '../../src/data/station-config';
import { ENCOUNTER_PROFILES, ROUTE_PHASE_DEFINITIONS, ROUTE_TOTAL_TARGET_SECONDS } from '../../src/data/route-config';
import { createInitialRunState } from '../../src/core/run-state';
import { ScrapSystem } from '../../src/systems/scrap-system';
import { UpgradeSystem } from '../../src/systems/upgrade-system';

describe('M14 balance contract', () => {
  it('keeps the route budget at the 10–15 minute target', () => {
    const configuredSeconds = ROUTE_PHASE_DEFINITIONS.reduce((total, phase) => total + phase.targetDurationSeconds, 0);

    expect(configuredSeconds).toBe(ROUTE_TOTAL_TARGET_SECONDS);
    expect(configuredSeconds).toBe(ROUTE_BALANCE_TARGETS.totalSeconds);
    expect(configuredSeconds).toBeGreaterThanOrEqual(ROUTE_BALANCE_TARGETS.acceptableMinimumSeconds);
    expect(configuredSeconds).toBeLessThanOrEqual(ROUTE_BALANCE_TARGETS.acceptableMaximumSeconds);
  });

  it('ramps encounter pressure without changing the V1 enemy roster', () => {
    expect(ENCOUNTER_PROFILES.EARLY.spawnIntervalMs).toBeGreaterThan(ENCOUNTER_PROFILES.MID.spawnIntervalMs);
    expect(ENCOUNTER_PROFILES.MID.spawnIntervalMs).toBeGreaterThan(ENCOUNTER_PROFILES.LATE.spawnIntervalMs);
    expect(ENCOUNTER_PROFILES.LATE.spawnIntervalMs).toBeGreaterThan(ENCOUNTER_PROFILES.BOSS_PREP.spawnIntervalMs);
    expect(ENCOUNTER_PROFILES.EARLY.activeCap).toBeLessThan(ENCOUNTER_PROFILES.LATE.activeCap);
    expect(Object.keys(ENCOUNTER_PROFILES.BOSS_PREP.spawnWeights).sort()).toEqual(['KEEPER', 'MIST', 'SHADOW']);
  });

  it('keeps placeholder feedback bounded for worst-case combat', () => {
    expect(FEEDBACK_BALANCE.maxConcurrentEffects).toBeLessThanOrEqual(32);
    expect(FEEDBACK_BALANCE.hitFlashDurationMs).toBeLessThan(200);
    expect(FEEDBACK_BALANCE.heavyImpactShakeDurationMs).toBeLessThan(120);
  });

  it('keeps the boss finishable with the base weapon and useful offers available', () => {
    const baseWeaponSeconds = RAKSASA_ALAS_CONFIG.maxHealth / (BASE_WEAPON.damage * BASE_WEAPON.fireRate);
    const offer = new UpgradeSystem().createOffer(createInitialRunState(), () => 0);

    expect(baseWeaponSeconds).toBeLessThan(ROUTE_BALANCE_TARGETS.bossSeconds);
    expect(offer).toHaveLength(3);
    expect(offer.every((definition) => definition.description.length > 0)).toBe(true);
  });

  it('leaves a meaningful Scrap decision at both stations without creating a dead end', () => {
    const run = createInitialRunState();
    const scrap = new ScrapSystem(run);
    const firstStation = STATION_DEFINITIONS[0];
    const secondStation = STATION_DEFINITIONS[1];

    scrap.grantEncounterReward(30);
    expect(scrap.spend(firstStation.repairCost)).toBe(true);
    expect(scrap.spend(firstStation.upgradeCost)).toBe(true);
    scrap.grantEncounterReward(34);
    expect(scrap.spend(secondStation.repairCost)).toBe(true);
    expect(scrap.spend(secondStation.upgradeCost)).toBe(true);
    expect(run.scrap).toBeGreaterThan(0);
  });
});
