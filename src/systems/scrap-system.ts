import type { RunState } from '../core/run-state';
import { SCRAP_ATTRACTION_RADIUS, SCRAP_ATTRACTION_SPEED, SCRAP_DROP_CONFIGS, SCRAP_PICKUP_LIFETIME_MS, SCRAP_PICKUP_RADIUS, SCRAP_PLAYER_COLLECTION_RADIUS } from '../data/scrap-config';
import type { ScrapDropRequest, ScrapPickup, ScrapRewardSource, ScrapSystemEvent } from '../entities/pickup/pickup-types';

interface Point {
  x: number;
  y: number;
}

export class ScrapSystem {
  private readonly pickups = new Map<string, ScrapPickup>();
  private readonly handledEnemyDrops = new Set<string>();
  private nextPickupId = 1;

  public constructor(private readonly run: RunState) {}

  public getPickups(): readonly ScrapPickup[] {
    return [...this.pickups.values()];
  }

  public getBalance(): number {
    return this.run.scrap;
  }

  public handleEnemyDrop(request: ScrapDropRequest, nowMs: number, randomValue = Math.random): ScrapPickup | null {
    if (this.handledEnemyDrops.has(request.enemyId)) return null;
    this.handledEnemyDrops.add(request.enemyId);

    const config = SCRAP_DROP_CONFIGS[request.archetype];
    if (randomValue() > config.dropChance) return null;
    return this.spawnPickup(config.value || request.value, { x: request.x, y: request.y }, nowMs, 'ENEMY_DROP');
  }

  public spawnRewardPickup(value: number, position: Point, nowMs: number, source: Exclude<ScrapRewardSource, 'ENEMY_DROP'>): ScrapPickup | null {
    const normalizedValue = this.normalizeAmount(value);
    if (normalizedValue <= 0) return null;
    return this.spawnPickup(normalizedValue, position, nowMs, source);
  }

  public grantEncounterReward(value: number): number {
    return this.addScrap(value);
  }

  public grantStationReward(value: number): number {
    return this.addScrap(value);
  }

  public update(deltaSeconds: number, playerPosition: Point, playerRadius = 24): ScrapSystemEvent[] {
    const events: ScrapSystemEvent[] = [];
    const deltaMs = Math.max(0, deltaSeconds) * 1000;
    for (const pickup of this.pickups.values()) {
      if (!pickup.active) continue;
      pickup.remainingLifetimeMs -= deltaMs;
      pickup.bobPhase += deltaSeconds * 4;

      const distance = Math.hypot(playerPosition.x - pickup.x, playerPosition.y - pickup.y);
      if (distance <= SCRAP_ATTRACTION_RADIUS && distance > 0) {
        const step = Math.min(distance, SCRAP_ATTRACTION_SPEED * Math.max(0, deltaSeconds));
        pickup.x += ((playerPosition.x - pickup.x) / distance) * step;
        pickup.y += ((playerPosition.y - pickup.y) / distance) * step;
      }

      const collectionDistance = playerRadius + SCRAP_PLAYER_COLLECTION_RADIUS;
      if (Math.hypot(playerPosition.x - pickup.x, playerPosition.y - pickup.y) <= collectionDistance) {
        pickup.active = false;
        this.pickups.delete(pickup.id);
        this.addScrap(pickup.value);
        events.push({ type: 'collected', pickupId: pickup.id, value: pickup.value, x: pickup.x, y: pickup.y });
      } else if (pickup.remainingLifetimeMs <= 0) {
        pickup.active = false;
        this.pickups.delete(pickup.id);
        events.push({ type: 'expired', pickupId: pickup.id, value: pickup.value });
      }
    }
    return events;
  }

  public spend(value: number): boolean {
    if (!Number.isFinite(value) || value <= 0) return false;
    const amount = this.normalizeAmount(value);
    if (amount <= 0 || amount > this.run.scrap) return false;
    this.run.scrap -= amount;
    this.run.scrapSpent += amount;
    return true;
  }

  public refund(value: number): number {
    return this.addScrap(value, false);
  }

  public resetRunEconomy(): void {
    this.run.scrap = 0;
    this.run.scrapCollected = 0;
    this.run.scrapSpent = 0;
    this.pickups.clear();
    this.handledEnemyDrops.clear();
    this.nextPickupId = 1;
  }

  private spawnPickup(value: number, position: Point, nowMs: number, source: ScrapRewardSource): ScrapPickup {
    const pickup: ScrapPickup = {
      id: `scrap-${this.nextPickupId}`,
      x: position.x,
      y: position.y,
      value,
      radius: SCRAP_PICKUP_RADIUS,
      remainingLifetimeMs: SCRAP_PICKUP_LIFETIME_MS,
      bobPhase: nowMs / 1000,
      active: true,
      source,
    };
    this.nextPickupId += 1;
    this.pickups.set(pickup.id, pickup);
    return pickup;
  }

  private addScrap(value: number, countAsCollected = true): number {
    const amount = this.normalizeAmount(value);
    if (amount <= 0) return 0;
    this.run.scrap += amount;
    if (countAsCollected) this.run.scrapCollected += amount;
    return amount;
  }

  private normalizeAmount(value: number): number {
    return Math.max(0, Math.floor(value));
  }
}
