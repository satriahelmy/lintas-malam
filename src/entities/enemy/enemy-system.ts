import type { ProjectileHitEvent } from '../combat/combat-types';
import type { TrainSectionId } from '../../core/run-state';
import { ENEMY_ACTIVE_CAP, ENEMY_CLEANUP_BOUNDS, ENEMY_CONFIGS, ENEMY_MIN_PLAYER_SPAWN_DISTANCE } from '../../data/enemy-config';
import type {
  EnemyArchetype,
  EnemyConfig,
  EnemySpawnSide,
  EnemyState,
  EnemySystemEvent,
  EnemyTarget,
  EnemyTargetContext,
  EnemyTargetSnapshot,
} from './enemy-types';

interface Point {
  x: number;
  y: number;
}

const SPAWN_POINTS: Record<EnemySpawnSide, Point> = {
  UPPER: { x: 620, y: 245 },
  LOWER: { x: 760, y: 955 },
  REAR: { x: 245, y: 420 },
  FRONT: { x: 1695, y: 505 },
};

const TRAIN_SPAWN_PADDING = 28;

export class EnemySystem {
  private readonly enemies = new Map<string, EnemyState>();
  private nextEnemyId = 1;
  private spawnSequence = 0;

  public constructor(
    private readonly configs: Readonly<Record<EnemyArchetype, EnemyConfig>> = ENEMY_CONFIGS,
    private readonly activeCap = ENEMY_ACTIVE_CAP,
  ) {}

  public getActiveEnemies(): readonly EnemyState[] {
    return [...this.enemies.values()];
  }

  public getCombatTargets(): readonly EnemyState[] {
    return this.getActiveEnemies();
  }

  public getActiveCount(): number {
    return this.enemies.size;
  }

  public getEnemy(id: string): EnemyState | undefined {
    return this.enemies.get(id);
  }

  public getSpawnPosition(side: EnemySpawnSide): Point {
    const base = SPAWN_POINTS[side];
    const offset = ((this.spawnSequence++ % 3) - 1) * 120;
    if (side === 'UPPER' || side === 'LOWER') return { x: base.x + offset, y: base.y };
    return { x: base.x, y: base.y + offset };
  }

  public spawn(
    archetype: EnemyArchetype,
    side: EnemySpawnSide,
    nowMs: number,
    context: EnemyTargetContext,
    requestedPosition?: Point,
  ): EnemyState | null {
    if (this.enemies.size >= this.activeCap) return null;

    const config = this.configs[archetype];
    const position = requestedPosition ?? this.getSpawnPosition(side);
    if (!this.isSafeSpawn(position, config.size, context)) return null;

    const enemy: EnemyState = {
      id: `enemy-${this.nextEnemyId}`,
      x: position.x,
      y: position.y,
      radius: config.size,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      active: true,
      archetype,
      spawnSide: side,
      speed: config.speed,
      damage: config.damage,
      attackIntervalMs: config.attackIntervalMs,
      attackRange: config.attackRange,
      dropValue: config.dropValue,
      movementProfile: config.movementProfile,
      targetRule: config.targetRule,
      retargetIntervalMs: config.retargetIntervalMs,
      target: null,
      targetLockUntilMs: 0,
      nextAttackAtMs: nowMs + config.attackIntervalMs,
      hitFlashUntilMs: 0,
      wobblePhase: this.nextEnemyId * 0.73,
    };

    this.nextEnemyId += 1;
    this.enemies.set(enemy.id, enemy);
    this.selectTarget(enemy, context);
    return enemy;
  }

  public spawnWeighted(
    side: EnemySpawnSide,
    nowMs: number,
    context: EnemyTargetContext,
    randomValue = Math.random(),
  ): EnemyState | null {
    const entries = Object.values(this.configs);
    const totalWeight = entries.reduce((sum, config) => sum + Math.max(0, config.spawnWeight), 0);
    if (totalWeight <= 0) return null;

    let cursor = Math.max(0, Math.min(0.999999, randomValue)) * totalWeight;
    for (const config of entries) {
      cursor -= Math.max(0, config.spawnWeight);
      if (cursor < 0) return this.spawn(config.archetype, side, nowMs, context);
    }
    return this.spawn(entries[entries.length - 1].archetype, side, nowMs, context);
  }

  public update(deltaSeconds: number, context: EnemyTargetContext): EnemySystemEvent[] {
    const events: EnemySystemEvent[] = [];
    for (const enemy of this.enemies.values()) {
      if (!enemy.active) continue;

      const snapshot = this.getTargetSnapshot(enemy.target, context);
      if (!snapshot || context.nowMs >= enemy.targetLockUntilMs) this.selectTarget(enemy, context);
      const targetSnapshot = this.getTargetSnapshot(enemy.target, context);
      if (!targetSnapshot) continue;

      const targetPoint = this.getMovementTarget(enemy, targetSnapshot, context.nowMs);
      const distance = Math.hypot(targetPoint.x - enemy.x, targetPoint.y - enemy.y);
      const attackDistance = targetSnapshot.radius + enemy.attackRange;
      if (distance > attackDistance) {
        const step = Math.min(distance, enemy.speed * Math.max(0, deltaSeconds));
        enemy.x += ((targetPoint.x - enemy.x) / distance) * step;
        enemy.y += ((targetPoint.y - enemy.y) / distance) * step;
      }

      const targetDistance = Math.hypot(targetSnapshot.x - enemy.x, targetSnapshot.y - enemy.y);
      if (targetDistance <= attackDistance && context.nowMs >= enemy.nextAttackAtMs) {
        enemy.nextAttackAtMs = context.nowMs + enemy.attackIntervalMs;
        events.push({
          type: 'attacked',
          enemyId: enemy.id,
          archetype: enemy.archetype,
          targetType: targetSnapshot.type,
          targetId: targetSnapshot.id,
          damage: enemy.damage,
        });
      }

      if (this.isOutsideCleanupBounds(enemy)) {
        enemy.active = false;
        this.enemies.delete(enemy.id);
        events.push({ type: 'removed', enemyId: enemy.id, archetype: enemy.archetype, reason: 'OFFSCREEN' });
      }
    }
    return events;
  }

  public applyDamage(id: string, amount: number, nowMs: number): EnemySystemEvent[] {
    const enemy = this.enemies.get(id);
    if (!enemy || !enemy.active || amount <= 0) return [];

    enemy.health = Math.max(0, enemy.health - amount);
    enemy.hitFlashUntilMs = nowMs + 100;
    const events: EnemySystemEvent[] = [{
      type: 'hit',
      enemyId: enemy.id,
      archetype: enemy.archetype,
      remainingHealth: enemy.health,
    }];
    if (enemy.health <= 0) events.push(...this.defeat(enemy));
    return events;
  }

  public handleCombatHits(hits: readonly ProjectileHitEvent[], nowMs: number): EnemySystemEvent[] {
    const events: EnemySystemEvent[] = [];
    for (const hit of hits) {
      const enemy = this.enemies.get(hit.targetId);
      if (!enemy || !enemy.active) continue;

      enemy.hitFlashUntilMs = nowMs + 100;
      events.push({
        type: 'hit',
        enemyId: enemy.id,
        archetype: enemy.archetype,
        remainingHealth: enemy.health,
      });
      if (hit.targetDefeated || enemy.health <= 0) events.push(...this.defeat(enemy));
    }
    return events;
  }

  public reset(): void {
    this.enemies.clear();
    this.nextEnemyId = 1;
    this.spawnSequence = 0;
  }

  private selectTarget(enemy: EnemyState, context: EnemyTargetContext): void {
    const trainTargets = context.train.filter((target) => target.active && target.health > 0);
    if (trainTargets.length === 0 && context.player.active && context.player.health > 0) {
      enemy.target = { type: 'PLAYER', id: 'PLAYER' };
      enemy.targetLockUntilMs = context.nowMs + enemy.retargetIntervalMs;
      return;
    }

    const weakestTrain = this.getWeakestTrain(trainTargets);
    if (!weakestTrain) {
      enemy.target = null;
      enemy.targetLockUntilMs = context.nowMs + enemy.retargetIntervalMs;
      return;
    }

    if (enemy.targetRule === 'NEAREST_TRAIN') {
      const nearest = trainTargets.reduce((closest, candidate) => (
        this.distanceTo(enemy, candidate) < this.distanceTo(enemy, closest) ? candidate : closest
      ));
      enemy.target = { type: 'TRAIN', id: nearest.id as TrainSectionId };
    } else if (enemy.targetRule === 'WEAKEST_TRAIN') {
      enemy.target = { type: 'TRAIN', id: weakestTrain.id as TrainSectionId };
    } else {
      const playerAvailable = context.player.active && context.player.health > 0;
      const playerIsCloser = playerAvailable && this.distanceTo(enemy, context.player) <= this.distanceTo(enemy, weakestTrain) + 120;
      enemy.target = playerIsCloser ? { type: 'PLAYER', id: 'PLAYER' } : { type: 'TRAIN', id: weakestTrain.id as TrainSectionId };
    }
    enemy.targetLockUntilMs = context.nowMs + enemy.retargetIntervalMs;
  }

  private getTargetSnapshot(target: EnemyTarget | null, context: EnemyTargetContext): EnemyTargetSnapshot | undefined {
    if (!target) return undefined;
    if (target.type === 'PLAYER') return context.player.active && context.player.health > 0 ? context.player : undefined;
    return context.train.find((candidate) => candidate.id === target.id && candidate.active && candidate.health > 0);
  }

  private getMovementTarget(enemy: EnemyState, target: EnemyTargetSnapshot, nowMs: number): Point {
    if (enemy.movementProfile !== 'IRREGULAR') return { x: target.x, y: target.y };
    const directionX = target.x - enemy.x;
    const directionY = target.y - enemy.y;
    const distance = Math.hypot(directionX, directionY) || 1;
    const wobble = Math.sin(nowMs / 180 + enemy.wobblePhase) * 90;
    return {
      x: target.x - (directionY / distance) * wobble,
      y: target.y + (directionX / distance) * wobble,
    };
  }

  private getWeakestTrain(targets: readonly EnemyTargetSnapshot[]): EnemyTargetSnapshot | undefined {
    return targets.reduce<EnemyTargetSnapshot | undefined>((weakest, candidate) => {
      if (!weakest) return candidate;
      const candidateRatio = candidate.maxHealth > 0 ? candidate.health / candidate.maxHealth : 0;
      const weakestRatio = weakest.maxHealth > 0 ? weakest.health / weakest.maxHealth : 0;
      return candidateRatio < weakestRatio ? candidate : weakest;
    }, undefined);
  }

  private defeat(enemy: EnemyState): EnemySystemEvent[] {
    if (!enemy.active) return [];
    enemy.active = false;
    this.enemies.delete(enemy.id);
    return [
      { type: 'defeated', enemyId: enemy.id, archetype: enemy.archetype, dropValue: enemy.dropValue, x: enemy.x, y: enemy.y },
      { type: 'scrap-drop', enemyId: enemy.id, archetype: enemy.archetype, value: enemy.dropValue, x: enemy.x, y: enemy.y },
    ];
  }

  private isSafeSpawn(position: Point, enemySize: number, context: EnemyTargetContext): boolean {
    if (Math.hypot(position.x - context.player.x, position.y - context.player.y) < ENEMY_MIN_PLAYER_SPAWN_DISTANCE + enemySize) return false;
    return context.train.every((train) => {
      const halfWidth = train.radius + TRAIN_SPAWN_PADDING;
      const halfHeight = train.radius + TRAIN_SPAWN_PADDING;
      return Math.abs(position.x - train.x) > halfWidth || Math.abs(position.y - train.y) > halfHeight;
    });
  }

  private isOutsideCleanupBounds(enemy: EnemyState): boolean {
    return enemy.x < ENEMY_CLEANUP_BOUNDS.left
      || enemy.x > ENEMY_CLEANUP_BOUNDS.right
      || enemy.y < ENEMY_CLEANUP_BOUNDS.top
      || enemy.y > ENEMY_CLEANUP_BOUNDS.bottom;
  }

  private distanceTo(enemy: EnemyState, target: EnemyTargetSnapshot): number {
    return Math.hypot(enemy.x - target.x, enemy.y - target.y);
  }
}
