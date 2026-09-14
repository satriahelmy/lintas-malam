import { describe, expect, it } from 'vitest';

import { ENEMY_ACTIVE_CAP } from '../../src/data/enemy-config';
import { EnemySystem } from '../../src/entities/enemy/enemy-system';
import type { EnemyArchetype, EnemyTargetContext } from '../../src/entities/enemy/enemy-types';

function context(overrides: Partial<EnemyTargetContext> = {}): EnemyTargetContext {
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
      { id: 'DEFENSE', type: 'TRAIN', x: 520, y: 610, radius: 40, health: 100, maxHealth: 100, active: true },
      { id: 'WORKSHOP', type: 'TRAIN', x: 782, y: 610, radius: 40, health: 35, maxHealth: 100, active: true },
      { id: 'PASSENGER', type: 'TRAIN', x: 1044, y: 610, radius: 40, health: 100, maxHealth: 100, active: true },
      { id: 'LOCOMOTIVE', type: 'TRAIN', x: 1306, y: 610, radius: 40, health: 100, maxHealth: 100, active: true },
    ],
    ...overrides,
  };
}

describe('EnemySystem', () => {
  it('spawns all archetypes from all supported sides with safe positions', () => {
    const system = new EnemySystem();
    const archetypes: EnemyArchetype[] = ['MIST', 'SHADOW', 'KEEPER'];
    const sides = ['UPPER', 'LOWER', 'REAR', 'FRONT'] as const;

    for (const archetype of archetypes) {
      for (const side of sides) {
        const enemy = system.spawn(archetype, side, 0, context());
        expect(enemy).not.toBeNull();
        expect(enemy?.spawnSide).toBe(side);
        expect(enemy?.health).toBe(enemy?.maxHealth);
        expect(Math.hypot((enemy?.x ?? 0) - 940, (enemy?.y ?? 0) - 475)).toBeGreaterThan(180);
      }
    }
  });

  it('uses distinct movement profiles and explicit target priorities', () => {
    const system = new EnemySystem();
    const mist = system.spawn('MIST', 'REAR', 0, context(), { x: 250, y: 420 });
    const shadowContext = context({
      player: { id: 'PLAYER', type: 'PLAYER', x: 340, y: 200, radius: 24, health: 100, maxHealth: 100, active: true },
    });
    const shadow = system.spawn('SHADOW', 'REAR', 0, shadowContext, { x: 300, y: 420 });
    const keeper = system.spawn('KEEPER', 'REAR', 0, context(), { x: 350, y: 420 });

    expect(mist?.target).toEqual({ type: 'TRAIN', id: 'DEFENSE' });
    expect(shadow?.target).toEqual({ type: 'PLAYER', id: 'PLAYER' });
    expect(keeper?.target).toEqual({ type: 'TRAIN', id: 'WORKSHOP' });

    const start = { x: mist?.x ?? 0, y: mist?.y ?? 0 };
    system.update(1, context({ nowMs: 1000 }));
    expect(mist?.x).not.toBe(start.x);
    expect(mist?.y).not.toBe(start.y);
    expect((keeper?.x ?? 0) - 350).toBeLessThanOrEqual(65);
  });

  it('routes attacks through stable cooldowns', () => {
    const system = new EnemySystem();
    const attackContext = context({
      player: { id: 'PLAYER', type: 'PLAYER', x: 1000, y: 1000, radius: 24, health: 100, maxHealth: 100, active: true },
      train: [
        { id: 'DEFENSE', type: 'TRAIN', x: 420, y: 420, radius: 40, health: 100, maxHealth: 100, active: true },
      ],
    });
    const keeper = system.spawn('KEEPER', 'REAR', 0, attackContext, { x: 300, y: 420 });
    expect(keeper).not.toBeNull();

    const first = system.update(1, { ...attackContext, nowMs: 1500 });
    const blocked = system.update(0.1, { ...attackContext, nowMs: 1600 });
    const next = system.update(1.5, { ...attackContext, nowMs: 3000 });

    expect(first.filter((event) => event.type === 'attacked')).toHaveLength(1);
    expect(blocked.filter((event) => event.type === 'attacked')).toHaveLength(0);
    expect(next.filter((event) => event.type === 'attacked')).toHaveLength(1);
  });

  it('emits one hit, defeat, and Scrap-drop event, then removes the enemy', () => {
    const system = new EnemySystem();
    const enemy = system.spawn('MIST', 'REAR', 0, context(), { x: 250, y: 420 });
    expect(enemy).not.toBeNull();

    const events = system.applyDamage(enemy?.id ?? '', 999, 100);

    expect(events.map((event) => event.type)).toEqual(['hit', 'defeated', 'scrap-drop']);
    expect(system.getActiveCount()).toBe(0);
    expect(system.applyDamage(enemy?.id ?? '', 10, 200)).toEqual([]);
  });

  it('enforces the active cap and removes an off-screen enemy', () => {
    const system = new EnemySystem();
    for (let index = 0; index < ENEMY_ACTIVE_CAP; index += 1) {
      const enemy = system.spawn('MIST', 'UPPER', 0, context(), { x: 300 + index * 100, y: 200 });
      expect(enemy).not.toBeNull();
    }
    expect(system.getActiveCount()).toBe(ENEMY_ACTIVE_CAP);
    expect(system.spawn('MIST', 'UPPER', 0, context(), { x: 200, y: 200 })).toBeNull();

    const cleanupSystem = new EnemySystem();
    const offscreen = cleanupSystem.spawn('MIST', 'FRONT', 0, context(), { x: 2200, y: 200 });
    expect(offscreen).not.toBeNull();
    const events = cleanupSystem.update(0, context({ nowMs: 0 }));
    expect(events).toContainEqual({ type: 'removed', enemyId: offscreen?.id, archetype: 'MIST', reason: 'OFFSCREEN' });
    expect(cleanupSystem.getActiveCount()).toBe(0);
  });

  it('applies encounter tuning to composition, cap, and spawned stats', () => {
    const system = new EnemySystem();
    system.setTuning({
      activeCap: 1,
      spawnWeights: { MIST: 0, SHADOW: 0, KEEPER: 1 },
      healthMultiplier: 2,
      damageMultiplier: 1.5,
      speedMultiplier: 2,
      attackIntervalMultiplier: 0.5,
      dropMultiplier: 2,
    });

    const keeper = system.spawnWeighted('REAR', 0, context(), 0);
    expect(keeper).toMatchObject({ archetype: 'KEEPER', health: 220, maxHealth: 220, damage: 27, speed: 130, attackIntervalMs: 750, dropValue: 20 });
    expect(system.getActiveCap()).toBe(1);
    expect(system.spawnWeighted('REAR', 0, context(), 0)).toBeNull();
  });

  it('uses the tuned attack interval for the first attack window', () => {
    const system = new EnemySystem();
    system.setTuning({
      activeCap: 1,
      spawnWeights: { MIST: 0, SHADOW: 0, KEEPER: 1 },
      healthMultiplier: 1,
      damageMultiplier: 1,
      speedMultiplier: 1,
      attackIntervalMultiplier: 0.5,
      dropMultiplier: 1,
    });
    const tunedContext = context({
      train: [{ id: 'DEFENSE', type: 'TRAIN', x: 420, y: 420, radius: 40, health: 100, maxHealth: 100, active: true }],
    });
    const keeper = system.spawn('KEEPER', 'REAR', 0, tunedContext, { x: 300, y: 420 });
    expect(keeper).not.toBeNull();

    const early = system.update(0.7, { ...tunedContext, nowMs: 700 });
    const ready = system.update(0.1, { ...tunedContext, nowMs: 800 });

    expect(early.filter((event) => event.type === 'attacked')).toHaveLength(0);
    expect(ready.filter((event) => event.type === 'attacked')).toHaveLength(1);
  });
});
