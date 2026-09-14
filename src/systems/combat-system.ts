import type { CombatTarget, PlayerDamageResult, ProjectileHitEvent, ProjectileState, WeaponStats } from '../entities/combat/combat-types';

export class CombatSystem {
  private readonly projectiles = new Map<number, ProjectileState>();
  private nextProjectileId = 1;
  private nextAllowedShotMs = 0;

  public fire(origin: { x: number; y: number }, target: { x: number; y: number }, nowMs: number, weapon: WeaponStats): ProjectileState | null {
    if (weapon.fireRate <= 0 || nowMs < this.nextAllowedShotMs) return null;

    const directionX = target.x - origin.x;
    const directionY = target.y - origin.y;
    const length = Math.hypot(directionX, directionY);
    const normalizedX = length === 0 ? 1 : directionX / length;
    const normalizedY = length === 0 ? 0 : directionY / length;
    const projectile: ProjectileState = {
      id: this.nextProjectileId,
      x: origin.x,
      y: origin.y,
      velocityX: normalizedX * weapon.projectileSpeed,
      velocityY: normalizedY * weapon.projectileSpeed,
      radius: weapon.projectileRadius,
      damage: weapon.damage,
      remainingRange: weapon.range,
      active: true,
    };

    this.nextProjectileId += 1;
    this.nextAllowedShotMs = nowMs + 1000 / weapon.fireRate;
    this.projectiles.set(projectile.id, projectile);
    return projectile;
  }

  public update(deltaSeconds: number, targets: readonly CombatTarget[]): ProjectileHitEvent[] {
    const hits: ProjectileHitEvent[] = [];
    for (const projectile of this.projectiles.values()) {
      if (!projectile.active) continue;

      const distanceTravelled = Math.hypot(projectile.velocityX, projectile.velocityY) * deltaSeconds;
      projectile.x += projectile.velocityX * deltaSeconds;
      projectile.y += projectile.velocityY * deltaSeconds;
      projectile.remainingRange -= distanceTravelled;

      if (projectile.remainingRange <= 0) {
        projectile.active = false;
        continue;
      }

      const target = targets.find((candidate) => candidate.active && candidate.health > 0 && this.overlaps(projectile, candidate));
      if (!target) continue;

      target.health = Math.max(0, target.health - projectile.damage);
      target.active = target.health > 0;
      projectile.active = false;
      hits.push({
        projectileId: projectile.id,
        targetId: target.id,
        x: projectile.x,
        y: projectile.y,
        damage: projectile.damage,
        targetHealth: target.health,
        targetDefeated: !target.active,
      });
    }

    for (const [id, projectile] of this.projectiles) {
      if (!projectile.active) this.projectiles.delete(id);
    }
    return hits;
  }

  public getProjectiles(): readonly ProjectileState[] {
    return [...this.projectiles.values()];
  }

  public reset(): void {
    this.projectiles.clear();
    this.nextProjectileId = 1;
    this.nextAllowedShotMs = 0;
  }

  private overlaps(projectile: ProjectileState, target: CombatTarget): boolean {
    return Math.hypot(projectile.x - target.x, projectile.y - target.y) <= projectile.radius + target.radius;
  }
}

export function applyPlayerDamage(
  state: { health: number; maxHealth: number },
  amount: number,
  nowMs: number,
  invulnerableUntilMs: number,
  invulnerabilityMs = 350,
): PlayerDamageResult {
  if (nowMs < invulnerableUntilMs || amount <= 0 || state.health <= 0) {
    return {
      appliedDamage: 0,
      health: state.health,
      invulnerableUntilMs,
      defeated: state.health <= 0,
    };
  }

  const appliedDamage = Math.min(state.health, amount);
  state.health -= appliedDamage;
  const nextInvulnerableUntilMs = nowMs + Math.max(0, invulnerabilityMs);
  return {
    appliedDamage,
    health: state.health,
    invulnerableUntilMs: nextInvulnerableUntilMs,
    defeated: state.health <= 0,
  };
}
