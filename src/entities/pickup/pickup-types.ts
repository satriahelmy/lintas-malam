import type { EnemyArchetype } from '../enemy/enemy-types';

export type ScrapRewardSource = 'ENEMY_DROP' | 'ENCOUNTER_REWARD' | 'STATION_REWARD';

export interface ScrapDropRequest {
  enemyId: string;
  archetype: EnemyArchetype;
  value: number;
  x: number;
  y: number;
}

export interface ScrapPickup {
  id: string;
  x: number;
  y: number;
  value: number;
  radius: number;
  remainingLifetimeMs: number;
  bobPhase: number;
  active: boolean;
  source: ScrapRewardSource;
}

export type ScrapSystemEvent =
  | { type: 'collected'; pickupId: string; value: number; x: number; y: number }
  | { type: 'expired'; pickupId: string; value: number };
