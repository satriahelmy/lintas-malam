import type { BossConfig } from '../entities/boss/boss-types';

export const RAKSASA_ALAS_CONFIG: BossConfig = {
  id: 'RAKSASA_ALAS',
  name: 'Raksasa Alas',
  maxHealth: 900,
  rewardScrap: 100,
  radius: 52,
  speed: 58,
  enragedSpeedMultiplier: 1.35,
  contactDamage: 18,
  contactIntervalMs: 1500,
  areaDamage: 28,
  areaRadius: 130,
  areaIntervalMs: 6200,
  enragedAreaIntervalMs: 4000,
  telegraphDurationMs: 1200,
  spawnPosition: { x: 1740, y: 490 },
};
