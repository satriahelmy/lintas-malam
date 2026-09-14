import { RAKSASA_ALAS_CONFIG } from '../data/boss-config';
import type { ProjectileHitEvent } from '../entities/combat/combat-types';
import type {
  BossBehaviorState,
  BossConfig,
  BossState,
  BossSystemEvent,
  BossTargetContext,
} from '../entities/boss/boss-types';

export class BossSystem {
  private state?: BossState;

  public constructor(private readonly config: BossConfig = RAKSASA_ALAS_CONFIG) {}

  public start(nowMs: number, position = this.config.spawnPosition): BossState {
    this.state = {
      id: this.config.id,
      name: this.config.name,
      x: position.x,
      y: position.y,
      radius: this.config.radius,
      health: this.config.maxHealth,
      maxHealth: this.config.maxHealth,
      active: true,
      behaviorState: 'PURSUIT',
      nextContactAtMs: nowMs + this.config.contactIntervalMs,
      nextAreaAtMs: nowMs + this.config.areaIntervalMs,
      telegraph: null,
    };
    return this.state;
  }

  public getState(): BossState | undefined {
    return this.state;
  }

  public getCombatTargets(): readonly BossState[] {
    return this.state?.active ? [this.state] : [];
  }

  public isActive(): boolean {
    return Boolean(this.state?.active);
  }

  public update(deltaSeconds: number, context: BossTargetContext): BossSystemEvent[] {
    const state = this.state;
    if (!state?.active) return [];

    const events: BossSystemEvent[] = [];
    if (state.behaviorState === 'PURSUIT' && state.health <= state.maxHealth * 0.5) {
      state.behaviorState = 'ENRAGED';
      events.push({ type: 'state-changed', bossId: state.id, state: state.behaviorState });
    }

    if (state.telegraph && context.nowMs >= state.telegraph.resolveAtMs) {
      const telegraph = state.telegraph;
      state.telegraph = null;
      events.push(...this.resolveAreaAttack(telegraph, context));
    }

    if (!state.telegraph && context.nowMs >= state.nextAreaAtMs) {
      const telegraph: NonNullable<BossState['telegraph']> = {
        x: context.player.x,
        y: context.player.y,
        radius: this.config.areaRadius,
        resolveAtMs: context.nowMs + this.config.telegraphDurationMs,
      };
      state.telegraph = telegraph;
      state.nextAreaAtMs = context.nowMs + this.getAreaInterval(state.behaviorState);
      events.push({ type: 'area-telegraph', bossId: state.id, ...telegraph });
    }

    this.moveTowardPlayer(state, context, deltaSeconds);
    const distanceToPlayer = Math.hypot(context.player.x - state.x, context.player.y - state.y);
    if (distanceToPlayer <= state.radius + context.player.radius + 16 && context.nowMs >= state.nextContactAtMs) {
      state.nextContactAtMs = context.nowMs + this.config.contactIntervalMs;
      events.push({ type: 'attacked', bossId: state.id, targetType: 'PLAYER', targetId: 'PLAYER', damage: this.config.contactDamage });
    }
    return events;
  }

  public applyDamage(amount: number): BossSystemEvent[] {
    const state = this.state;
    if (!state?.active || !Number.isFinite(amount) || amount <= 0) return [];

    state.health = Math.max(0, state.health - amount);
    const events: BossSystemEvent[] = [{ type: 'hit', bossId: state.id, remainingHealth: state.health }];
    if (state.behaviorState === 'PURSUIT' && state.health <= state.maxHealth * 0.5) {
      state.behaviorState = 'ENRAGED';
      events.push({ type: 'state-changed', bossId: state.id, state: state.behaviorState });
    }
    if (state.health <= 0) {
      state.active = false;
      state.telegraph = null;
      events.push({ type: 'defeated', bossId: state.id, rewardScrap: this.config.rewardScrap });
    }
    return events;
  }

  public handleCombatHits(hits: readonly ProjectileHitEvent[]): BossSystemEvent[] {
    const state = this.state;
    if (!state?.active) return [];

    const events: BossSystemEvent[] = [];
    for (const hit of hits) {
      if (hit.targetId !== state.id) continue;

      events.push({ type: 'hit', bossId: state.id, remainingHealth: state.health });
      if (state.behaviorState === 'PURSUIT' && state.health <= state.maxHealth * 0.5) {
        state.behaviorState = 'ENRAGED';
        events.push({ type: 'state-changed', bossId: state.id, state: state.behaviorState });
      }
      if (hit.targetDefeated || state.health <= 0) {
        state.active = false;
        state.telegraph = null;
        events.push({ type: 'defeated', bossId: state.id, rewardScrap: this.config.rewardScrap });
      }
    }
    return events;
  }

  public reset(): void {
    this.state = undefined;
  }

  private moveTowardPlayer(state: BossState, context: BossTargetContext, deltaSeconds: number): void {
    const directionX = context.player.x - state.x;
    const directionY = context.player.y - state.y;
    const distance = Math.hypot(directionX, directionY);
    const stoppingDistance = state.radius + context.player.radius + 16;
    if (distance <= stoppingDistance || distance <= 0) return;

    const speed = this.config.speed * (state.behaviorState === 'ENRAGED' ? this.config.enragedSpeedMultiplier : 1);
    const step = Math.min(distance - stoppingDistance, speed * Math.max(0, deltaSeconds));
    state.x += (directionX / distance) * step;
    state.y += (directionY / distance) * step;
  }

  private resolveAreaAttack(telegraph: NonNullable<BossState['telegraph']>, context: BossTargetContext): BossSystemEvent[] {
    const events: BossSystemEvent[] = [];
    const damage = this.config.areaDamage * (this.state?.behaviorState === 'ENRAGED' ? 1.25 : 1);
    if (this.isWithinArea(telegraph, context.player.x, context.player.y, context.player.radius)) {
      events.push({ type: 'area-hit', bossId: 'RAKSASA_ALAS', targetType: 'PLAYER', targetId: 'PLAYER', damage });
    }
    for (const target of context.train) {
      if (!target.active || target.health <= 0) continue;
      if (this.isWithinArea(telegraph, target.x, target.y, target.radius)) {
        events.push({ type: 'area-hit', bossId: 'RAKSASA_ALAS', targetType: 'TRAIN', targetId: target.id, damage });
      }
    }
    return events;
  }

  private isWithinArea(telegraph: NonNullable<BossState['telegraph']>, x: number, y: number, radius: number): boolean {
    return Math.hypot(x - telegraph.x, y - telegraph.y) <= telegraph.radius + radius;
  }

  private getAreaInterval(state: BossBehaviorState): number {
    return state === 'ENRAGED' ? this.config.enragedAreaIntervalMs : this.config.areaIntervalMs;
  }
}
