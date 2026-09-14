import type { TrainSectionId } from '../../core/run-state';
import type { CombatTarget } from '../combat/combat-types';

export type BossBehaviorState = 'PURSUIT' | 'ENRAGED';

export interface BossConfig {
  id: 'RAKSASA_ALAS';
  name: string;
  maxHealth: number;
  rewardScrap: number;
  radius: number;
  speed: number;
  enragedSpeedMultiplier: number;
  contactDamage: number;
  contactIntervalMs: number;
  areaDamage: number;
  areaRadius: number;
  areaIntervalMs: number;
  enragedAreaIntervalMs: number;
  telegraphDurationMs: number;
  spawnPosition: { x: number; y: number };
}

export interface BossTelegraph {
  x: number;
  y: number;
  radius: number;
  resolveAtMs: number;
}

export interface BossState extends CombatTarget {
  id: 'RAKSASA_ALAS';
  name: string;
  behaviorState: BossBehaviorState;
  nextContactAtMs: number;
  nextAreaAtMs: number;
  telegraph: BossTelegraph | null;
}

export interface BossTargetSnapshot {
  id: 'PLAYER' | TrainSectionId;
  type: 'PLAYER' | 'TRAIN';
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  active: boolean;
}

export interface BossTargetContext {
  nowMs: number;
  player: BossTargetSnapshot;
  train: readonly BossTargetSnapshot[];
}

export type BossSystemEvent =
  | { type: 'hit'; bossId: 'RAKSASA_ALAS'; remainingHealth: number }
  | { type: 'state-changed'; bossId: 'RAKSASA_ALAS'; state: BossBehaviorState }
  | {
      type: 'attacked';
      bossId: 'RAKSASA_ALAS';
      targetType: 'PLAYER';
      targetId: 'PLAYER';
      damage: number;
    }
  | {
      type: 'area-telegraph';
      bossId: 'RAKSASA_ALAS';
      x: number;
      y: number;
      radius: number;
      resolveAtMs: number;
    }
  | {
      type: 'area-hit';
      bossId: 'RAKSASA_ALAS';
      targetType: 'PLAYER' | 'TRAIN';
      targetId: 'PLAYER' | TrainSectionId;
      damage: number;
    }
  | { type: 'defeated'; bossId: 'RAKSASA_ALAS'; rewardScrap: number };
