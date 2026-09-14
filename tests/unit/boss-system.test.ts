import { describe, expect, it } from 'vitest';

import { BossSystem } from '../../src/systems/boss-system';
import type { BossTargetContext } from '../../src/entities/boss/boss-types';

function context(overrides: Partial<BossTargetContext> = {}): BossTargetContext {
  return {
    nowMs: 0,
    player: {
      id: 'PLAYER',
      type: 'PLAYER',
      x: 940,
      y: 475,
      radius: 24,
      health: 100,
      maxHealth: 100,
      active: true,
    },
    train: [
      { id: 'DEFENSE', type: 'TRAIN', x: 520, y: 610, radius: 125, health: 100, maxHealth: 100, active: true },
      { id: 'WORKSHOP', type: 'TRAIN', x: 782, y: 610, radius: 125, health: 100, maxHealth: 100, active: true },
    ],
    ...overrides,
  };
}

describe('BossSystem', () => {
  it('starts Raksasa Alas and pursues the player', () => {
    const system = new BossSystem();
    const state = system.start(0);
    expect(state).toMatchObject({ id: 'RAKSASA_ALAS', behaviorState: 'PURSUIT', health: 900, active: true });

    system.update(1, context({ nowMs: 1000 }));
    expect(state.x).toBeLessThan(1740);
    expect(system.getCombatTargets()).toHaveLength(1);
  });

  it('emits a contact attack on cooldown when it reaches the player', () => {
    const system = new BossSystem();
    system.start(0, { x: 980, y: 475 });

    const first = system.update(0, context({ nowMs: 1500 }));
    const blocked = system.update(0, context({ nowMs: 1600 }));
    const next = system.update(0, context({ nowMs: 3000 }));

    expect(first.filter((event) => event.type === 'attacked')).toHaveLength(1);
    expect(blocked.filter((event) => event.type === 'attacked')).toHaveLength(0);
    expect(next.filter((event) => event.type === 'attacked')).toHaveLength(1);
  });

  it('telegraphs an area attack before resolving damage against overlapping targets', () => {
    const system = new BossSystem();
    system.start(0, { x: 1600, y: 475 });
    const overlappingTrain = {
      id: 'PASSENGER' as const,
      type: 'TRAIN' as const,
      x: 1020,
      y: 475,
      radius: 40,
      health: 100,
      maxHealth: 100,
      active: true,
    };
    const targetContext = context({ train: [overlappingTrain] });

    const telegraph = system.update(0, { ...targetContext, nowMs: 6200 });
    const beforeResolve = system.update(0, { ...targetContext, nowMs: 7399 });
    const resolved = system.update(0, { ...targetContext, nowMs: 7400 });

    expect(telegraph.map((event) => event.type)).toContain('area-telegraph');
    expect(beforeResolve.filter((event) => event.type === 'area-hit')).toHaveLength(0);
    expect(resolved.filter((event) => event.type === 'area-hit')).toEqual([
      { type: 'area-hit', bossId: 'RAKSASA_ALAS', targetType: 'PLAYER', targetId: 'PLAYER', damage: 28 },
      { type: 'area-hit', bossId: 'RAKSASA_ALAS', targetType: 'TRAIN', targetId: 'PASSENGER', damage: 28 },
    ]);
  });

  it('switches to ENRAGED at half health and emits one defeat event', () => {
    const system = new BossSystem();
    system.start(0);

    expect(system.applyDamage(450).map((event) => event.type)).toEqual(['hit', 'state-changed']);
    expect(system.getState()?.behaviorState).toBe('ENRAGED');
    expect(system.applyDamage(450).map((event) => event.type)).toEqual(['hit', 'defeated']);
    expect(system.isActive()).toBe(false);
    expect(system.applyDamage(10)).toEqual([]);
  });
});
