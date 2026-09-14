import type { EnemyArchetype } from '../entities/enemy/enemy-types';

export const SCRAP_DROP_CONFIGS: Readonly<Record<EnemyArchetype, { value: number; dropChance: number }>> = {
  MIST: { value: 3, dropChance: 1 },
  SHADOW: { value: 5, dropChance: 0.9 },
  KEEPER: { value: 10, dropChance: 1 },
};

export const SCRAP_PICKUP_RADIUS = 24;
export const SCRAP_PLAYER_COLLECTION_RADIUS = 32;
export const SCRAP_ATTRACTION_RADIUS = 180;
export const SCRAP_ATTRACTION_SPEED = 220;
export const SCRAP_PICKUP_LIFETIME_MS = 12000;
