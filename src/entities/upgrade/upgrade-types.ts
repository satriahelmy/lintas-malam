import type { TrainSectionId } from '../../core/run-state';

export type UpgradeId =
  | 'RAPID_FIRE'
  | 'HEAVY_ROUND'
  | 'LONG_BARREL'
  | 'REINFORCED_CARRIAGE'
  | 'EMERGENCY_REPAIR'
  | 'DEFENSE_TURRET';

export type UpgradeEffect =
  | { type: 'PLAYER_FIRE_RATE'; multiplier: number }
  | { type: 'PLAYER_DAMAGE'; multiplier: number }
  | { type: 'PLAYER_RANGE'; multiplier: number }
  | { type: 'TRAIN_MAX_HP'; multiplier: number }
  | { type: 'TRAIN_REPAIR'; amount: number }
  | { type: 'DEFENSE_TURRET'; damage: number; intervalMs: number };

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  effect: UpgradeEffect;
}

export interface UpgradeApplicationResult {
  applied: boolean;
  id: UpgradeId;
  level: number;
  repairedSection?: TrainSectionId;
  repairedAmount?: number;
}
