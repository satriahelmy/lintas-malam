import { describe, expect, it } from 'vitest';

import type { CombatTarget } from '../../src/entities/combat/combat-types';
import { applyPlayerDamage, CombatSystem } from '../../src/systems/combat-system';

const weapon = {
  damage: 20,
  fireRate: 4,
  projectileSpeed: 100,
  range: 300,
  projectileRadius: 5,
};

function target(overrides: Partial<CombatTarget> = {}): CombatTarget {
  return {
    id: 'target',
    x: 100,
    y: 0,
    radius: 10,
    health: 50,
    maxHealth: 50,
    active: true,
    ...overrides,
  };
}

describe('CombatSystem', () => {
  it('keeps aim speed normalized across eight directions', () => {
    const directions = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ];

    for (const direction of directions) {
      const projectile = new CombatSystem().fire({ x: 0, y: 0 }, direction, 0, weapon);
      expect(Math.hypot(projectile?.velocityX ?? 0, projectile?.velocityY ?? 0)).toBeCloseTo(weapon.projectileSpeed);
    }
  });

  it('fires normalized projectiles and enforces fire-rate cooldown', () => {
    const combat = new CombatSystem();

    const first = combat.fire({ x: 0, y: 0 }, { x: 3, y: 4 }, 0, weapon);
    const blocked = combat.fire({ x: 0, y: 0 }, { x: 1, y: 0 }, 100, weapon);
    const second = combat.fire({ x: 0, y: 0 }, { x: 1, y: 0 }, 250, weapon);

    expect(first?.velocityX).toBeCloseTo(60);
    expect(first?.velocityY).toBeCloseTo(80);
    expect(blocked).toBeNull();
    expect(second).not.toBeNull();
  });

  it('moves, collides, damages, and removes a projectile', () => {
    const combat = new CombatSystem();
    const enemy = target();
    combat.fire({ x: 0, y: 0 }, { x: 100, y: 0 }, 0, weapon);

    const hits = combat.update(1, [enemy]);

    expect(hits).toHaveLength(1);
    expect(hits[0].targetId).toBe('target');
    expect(hits[0].damage).toBe(20);
    expect(enemy.health).toBe(30);
    expect(combat.getProjectiles()).toHaveLength(0);
  });

  it('reports target defeat and expires projectiles at range', () => {
    const combat = new CombatSystem();
    const enemy = target({ health: 10, maxHealth: 10 });
    combat.fire({ x: 0, y: 0 }, { x: 100, y: 0 }, 0, { ...weapon, range: 50 });

    const hits = combat.update(0.5, [enemy]);

    expect(hits).toHaveLength(0);
    expect(enemy.health).toBe(10);
    expect(combat.getProjectiles()).toHaveLength(0);
    expect(combat.fire({ x: 0, y: 0 }, { x: 100, y: 0 }, 1000, weapon)).not.toBeNull();
    const defeat = combat.update(1, [enemy]);
    expect(defeat[0].targetDefeated).toBe(true);
    expect(enemy.active).toBe(false);
  });
});

describe('applyPlayerDamage', () => {
  it('clamps damage and blocks repeated hits during invulnerability', () => {
    const player = { health: 30, maxHealth: 30 };
    const first = applyPlayerDamage(player, 12, 100, 0);
    const blocked = applyPlayerDamage(player, 12, 200, first.invulnerableUntilMs);
    const defeated = applyPlayerDamage(player, 50, first.invulnerableUntilMs, first.invulnerableUntilMs);

    expect(first).toMatchObject({ appliedDamage: 12, health: 18, defeated: false });
    expect(blocked.appliedDamage).toBe(0);
    expect(defeated).toMatchObject({ appliedDamage: 18, health: 0, defeated: true });
  });
});
