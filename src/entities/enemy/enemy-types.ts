import type { TrainSectionId } from '../../core/run-state';
import type { CombatTarget } from '../combat/combat-types';

export type EnemyArchetype = 'MIST' | 'SHADOW' | 'KEEPER';
export type EnemySpawnSide = 'UPPER' | 'LOWER' | 'REAR' | 'FRONT';
export type EnemyMovementProfile = 'DIRECT' | 'IRREGULAR' | 'HEAVY';
export type EnemyTargetRule = 'NEAREST_TRAIN' | 'PLAYER_OR_WEAK_TRAIN' | 'WEAKEST_TRAIN';

export type EnemyTarget =
  | { type: 'PLAYER'; id: 'PLAYER' }
  | { type: 'TRAIN'; id: TrainSectionId };

export interface EnemyConfig {
  archetype: EnemyArchetype;
  maxHealth: number;
  speed: number;
  damage: number;
  attackIntervalMs: number;
  attackRange: number;
  dropValue: number;
  size: number;
  spawnWeight: number;
  movementProfile: EnemyMovementProfile;
  targetRule: EnemyTargetRule;
  retargetIntervalMs: number;
}

export interface EnemyTargetSnapshot {
  id: 'PLAYER' | TrainSectionId;
  type: 'PLAYER' | 'TRAIN';
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  active: boolean;
}

export interface EnemyTargetContext {
  nowMs: number;
  player: EnemyTargetSnapshot;
  train: readonly EnemyTargetSnapshot[];
}

export interface EnemyState extends CombatTarget {
  archetype: EnemyArchetype;
  spawnSide: EnemySpawnSide;
  speed: number;
  damage: number;
  attackIntervalMs: number;
  attackRange: number;
  dropValue: number;
  movementProfile: EnemyMovementProfile;
  targetRule: EnemyTargetRule;
  retargetIntervalMs: number;
  target: EnemyTarget | null;
  targetLockUntilMs: number;
  nextAttackAtMs: number;
  hitFlashUntilMs: number;
  wobblePhase: number;
}

export type EnemySystemEvent =
  | {
      type: 'hit';
      enemyId: string;
      archetype: EnemyArchetype;
      remainingHealth: number;
    }
  | {
      type: 'attacked';
      enemyId: string;
      archetype: EnemyArchetype;
      targetType: 'PLAYER' | 'TRAIN';
      targetId: 'PLAYER' | TrainSectionId;
      damage: number;
    }
  | {
      type: 'defeated';
      enemyId: string;
      archetype: EnemyArchetype;
      dropValue: number;
      x: number;
      y: number;
    }
  | {
      type: 'scrap-drop';
      enemyId: string;
      archetype: EnemyArchetype;
      value: number;
      x: number;
      y: number;
    }
  | {
      type: 'removed';
      enemyId: string;
      archetype: EnemyArchetype;
      reason: 'OFFSCREEN';
    };
