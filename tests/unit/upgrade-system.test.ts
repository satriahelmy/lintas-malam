import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { TrainSystem } from '../../src/entities/train/train-system';
import { UPGRADE_DEFINITIONS } from '../../src/data/upgrade-config';
import { DefenseTurretSystem } from '../../src/systems/defense-turret-system';
import { UpgradeOfferDirector, UpgradeSystem } from '../../src/systems/upgrade-system';

describe('UpgradeSystem', () => {
  it('creates three unique choices and filters maxed upgrades', () => {
    const run = createInitialRunState();
    const upgrades = new UpgradeSystem();
    const offer = upgrades.createOffer(run, () => 0);

    expect(offer).toHaveLength(3);
    expect(new Set(offer.map((definition) => definition.id)).size).toBe(3);

    run.upgradeIds.push('RAPID_FIRE', 'RAPID_FIRE', 'RAPID_FIRE');
    const filteredOffer = upgrades.createOffer(run, () => 0);
    expect(filteredOffer).toHaveLength(3);
    expect(filteredOffer.some((definition) => definition.id === 'RAPID_FIRE')).toBe(false);
  });

  it('applies player stat upgrades exactly once per selected level', () => {
    const run = createInitialRunState();
    const upgrades = new UpgradeSystem();
    const train = new TrainSystem(run);

    expect(upgrades.applyUpgrade(run, train, 'RAPID_FIRE')).toMatchObject({ applied: true, level: 1 });
    expect(run.player.fireRate).toBe(4.8);
    expect(upgrades.applyUpgrade(run, train, 'HEAVY_ROUND')).toMatchObject({ applied: true, level: 1 });
    expect(run.player.damage).toBe(12.5);
    expect(upgrades.applyUpgrade(run, train, 'LONG_BARREL')).toMatchObject({ applied: true, level: 1 });
    expect(run.player.weaponRange).toBe(576);

    run.upgradeIds.push('RAPID_FIRE', 'RAPID_FIRE');
    expect(upgrades.applyUpgrade(run, train, 'RAPID_FIRE').applied).toBe(false);
    expect(run.player.fireRate).toBe(4.8);
  });

  it('raises train max HP while preserving the previous damage amount', () => {
    const run = createInitialRunState();
    const train = new TrainSystem(run);
    train.damage('DEFENSE', 40);
    const upgrades = new UpgradeSystem();

    const result = upgrades.applyUpgrade(run, train, 'REINFORCED_CARRIAGE');

    expect(result.applied).toBe(true);
    expect(run.train.every((section) => section.maxHp === 115)).toBe(true);
    expect(run.train.find((section) => section.id === 'DEFENSE')?.currentHp).toBe(75);
  });

  it('uses the shared repair API and never repairs beyond max HP', () => {
    const run = createInitialRunState();
    const train = new TrainSystem(run);
    train.damage('WORKSHOP', 90);
    const upgrades = new UpgradeSystem();

    const result = upgrades.applyUpgrade(run, train, 'EMERGENCY_REPAIR');

    expect(result).toMatchObject({ applied: true, repairedSection: 'WORKSHOP', repairedAmount: 25 });
    expect(run.train.find((section) => section.id === 'WORKSHOP')?.currentHp).toBe(35);
    expect(run.train.every((section) => section.currentHp <= section.maxHp)).toBe(true);
  });

  it('offers no upgrade after the configured max level is reached', () => {
    const run = createInitialRunState();
    const train = new TrainSystem(run);
    const upgrades = new UpgradeSystem();
    const definition = UPGRADE_DEFINITIONS.find((candidate) => candidate.id === 'DEFENSE_TURRET');
    expect(definition).toBeDefined();

    for (let level = 0; level < (definition?.maxLevel ?? 0); level += 1) upgrades.applyUpgrade(run, train, 'DEFENSE_TURRET');
    expect(upgrades.getLevel(run, 'DEFENSE_TURRET')).toBe(definition?.maxLevel);
    expect(upgrades.applyUpgrade(run, train, 'DEFENSE_TURRET').applied).toBe(false);
  });
});

describe('UpgradeOfferDirector', () => {
  it('opens on enemy milestones and advances only after an offer is shown', () => {
    const run = createInitialRunState();
    const director = new UpgradeOfferDirector();
    run.enemiesDefeated = 2;
    expect(director.shouldOffer(run)).toBe(false);
    run.enemiesDefeated = 3;
    expect(director.shouldOffer(run)).toBe(true);
    director.markOfferShown();
    expect(director.shouldOffer(run)).toBe(false);
    run.enemiesDefeated = 6;
    expect(director.shouldOffer(run)).toBe(true);
  });
});

describe('DefenseTurretSystem', () => {
  it('fires on cadence at the nearest active enemy and scales damage by level', () => {
    const turret = new DefenseTurretSystem();
    const targets = [
      { id: 'far', x: 500, y: 500, health: 10, active: true },
      { id: 'near', x: 100, y: 0, health: 10, active: true },
      { id: 'dead', x: 1, y: 1, health: 0, active: false },
    ];
    turret.setLevel(2);

    expect(turret.update(0.9, { x: 0, y: 0 }, targets)).toBeNull();
    const shot = turret.update(0.6, { x: 0, y: 0 }, targets);

    expect(shot).toMatchObject({ targetId: 'near', damage: 12 });
    expect(turret.update(0.1, { x: 0, y: 0 }, targets)).toBeNull();
  });
});
