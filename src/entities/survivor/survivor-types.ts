import type { RunState } from '../../core/run-state';

export type SurvivorId = 'MONTIR' | 'PEDAGANG' | 'PERAWAT' | 'PENJAGA';

export type SurvivorPassive =
  | { type: 'REPAIR_EFFECTIVENESS'; bonus: number }
  | { type: 'STATION_PURCHASE_DISCOUNT'; discount: number }
  | { type: 'PLAYER_RECOVERY'; amountPerSecond: number; delayMs: number }
  | { type: 'TRAIN_DEFENSE'; bonus: number };

export interface SurvivorDefinition {
  id: SurvivorId;
  displayName: string;
  role: string;
  description: string;
  initial: string;
  portraitColor: number;
  passive: SurvivorPassive;
}

export interface SurvivorPassiveModifiers {
  repairEffectivenessBonus: number;
  stationPurchaseDiscount: number;
  playerRecoveryPerSecond: number;
  playerRecoveryDelayMs: number;
  defenseEffectivenessBonus: number;
  benefitMultiplier: number;
}

export type SurvivorBenefitState = 'FULL' | 'REDUCED' | 'DISABLED';

export type SurvivorRescueResult = {
  rescued: boolean;
  id: SurvivorId;
  reason: 'RESCUED' | 'DUPLICATE' | 'INVALID';
  run: RunState;
};
