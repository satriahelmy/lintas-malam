import type { EnemyArchetype, EnemyConfig, EnemySpawnSide } from '../entities/enemy/enemy-types';

export const ENEMY_CONFIGS: Readonly<Record<EnemyArchetype, EnemyConfig>> = {
  MIST: {
    archetype: 'MIST',
    maxHealth: 28,
    speed: 115,
    damage: 5,
    attackIntervalMs: 1100,
    attackRange: 34,
    dropValue: 3,
    size: 20,
    spawnWeight: 6,
    movementProfile: 'DIRECT',
    targetRule: 'NEAREST_TRAIN',
    retargetIntervalMs: 900,
  },
  SHADOW: {
    archetype: 'SHADOW',
    maxHealth: 42,
    speed: 190,
    damage: 8,
    attackIntervalMs: 850,
    attackRange: 30,
    dropValue: 5,
    size: 16,
    spawnWeight: 3,
    movementProfile: 'IRREGULAR',
    targetRule: 'PLAYER_OR_WEAK_TRAIN',
    retargetIntervalMs: 550,
  },
  KEEPER: {
    archetype: 'KEEPER',
    maxHealth: 110,
    speed: 65,
    damage: 18,
    attackIntervalMs: 1500,
    attackRange: 54,
    dropValue: 10,
    size: 34,
    spawnWeight: 1,
    movementProfile: 'HEAVY',
    targetRule: 'WEAKEST_TRAIN',
    retargetIntervalMs: 1200,
  },
};

export const ENEMY_ACTIVE_CAP = 12;
export const ENEMY_SPAWN_INTERVAL_MS = 2200;
export const ENEMY_MIN_PLAYER_SPAWN_DISTANCE = 180;

export const ENEMY_SPAWN_SIDES: readonly EnemySpawnSide[] = ['UPPER', 'LOWER', 'REAR', 'FRONT'];

export const ENEMY_CLEANUP_BOUNDS = {
  left: -220,
  right: 2140,
  top: -180,
  bottom: 1260,
} as const;
