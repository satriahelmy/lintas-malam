import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { SURVIVOR_DEFINITIONS } from '../../src/data/survivor-config';
import type { SurvivorId } from '../../src/entities/survivor/survivor-types';
import { SurvivorSystem } from '../../src/systems/survivor-system';

describe('SurvivorSystem', () => {
  it('defines and rescues each V1 survivor once per run', () => {
    const run = createInitialRunState();
    const survivors = new SurvivorSystem();

    expect(survivors.getAvailable(run)).toHaveLength(4);
    for (const definition of SURVIVOR_DEFINITIONS) {
      expect(survivors.rescue(run, definition.id)).toMatchObject({ rescued: true, reason: 'RESCUED' });
      expect(survivors.rescue(run, definition.id)).toMatchObject({ rescued: false, reason: 'DUPLICATE' });
    }

    expect(run.survivorIds).toEqual(['MONTIR', 'PEDAGANG', 'PERAWAT', 'PENJAGA']);
    expect(survivors.getAvailable(run)).toEqual([]);
  });

  it('rejects an invalid runtime id without mutating the roster', () => {
    const run = createInitialRunState();
    const survivors = new SurvivorSystem();

    expect(survivors.rescue(run, 'NOT_A_SURVIVOR' as SurvivorId)).toMatchObject({ rescued: false, reason: 'INVALID' });
    expect(run.survivorIds).toEqual([]);
  });

  it('combines measurable passive modifiers and clamps station discounts', () => {
    const run = createInitialRunState();
    const survivors = new SurvivorSystem();
    run.survivorIds.push('MONTIR', 'PEDAGANG', 'PERAWAT', 'PENJAGA');

    expect(survivors.getPassiveModifiers(run)).toMatchObject({
      repairEffectivenessBonus: 0.25,
      stationPurchaseDiscount: 0.2,
      playerRecoveryPerSecond: 2,
      playerRecoveryDelayMs: 3000,
      defenseEffectivenessBonus: 0.2,
      benefitMultiplier: 1,
    });
    expect(survivors.getStationCost(run, 15)).toBe(12);
    expect(survivors.getStationCost(run, 0)).toBe(0);
    expect(survivors.getStationCost(run, -50)).toBe(0);
  });

  it('recovers the player after the no-damage delay and never exceeds max HP', () => {
    const run = createInitialRunState();
    const survivors = new SurvivorSystem();
    run.survivorIds.push('PERAWAT');
    run.player.health = 98;

    expect(survivors.recoverPlayer(run, 1, 2999, 0)).toBe(0);
    expect(survivors.recoverPlayer(run, 1, 3000, 0)).toBe(2);
    expect(run.player.health).toBe(100);
    run.player.health = 50;
    expect(survivors.recoverPlayer(run, 1, 5000, 4500)).toBe(0);
    expect(survivors.recoverPlayer(run, 1, 10500, 7500)).toBe(2);
  });

  it('reduces then disables survivor benefits as the Passenger Car becomes critical', () => {
    const run = createInitialRunState();
    const survivors = new SurvivorSystem();
    run.survivorIds.push('MONTIR', 'PEDAGANG', 'PERAWAT', 'PENJAGA');
    const passenger = run.train.find((section) => section.id === 'PASSENGER');
    expect(passenger).toBeDefined();
    if (!passenger) return;

    passenger.currentHp = 65;
    expect(survivors.getBenefitState(run)).toBe('REDUCED');
    expect(survivors.getPassiveModifiers(run)).toMatchObject({
      repairEffectivenessBonus: 0.125,
      stationPurchaseDiscount: 0.1,
      playerRecoveryPerSecond: 1,
      defenseEffectivenessBonus: 0.1,
      benefitMultiplier: 0.5,
    });

    passenger.currentHp = 33;
    expect(survivors.getBenefitState(run)).toBe('DISABLED');
    expect(survivors.getPassiveModifiers(run)).toMatchObject({
      repairEffectivenessBonus: 0,
      stationPurchaseDiscount: 0,
      playerRecoveryPerSecond: 0,
      defenseEffectivenessBonus: 0,
      benefitMultiplier: 0,
    });

    passenger.currentHp = passenger.maxHp;
    expect(survivors.getBenefitState(run)).toBe('FULL');
    expect(survivors.getPassiveModifiers(run).repairEffectivenessBonus).toBe(0.25);
  });
});
