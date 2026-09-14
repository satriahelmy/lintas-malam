import type { RoutePhase, TrainSectionId, RunState } from '../../core/run-state';

export type StationId = 'WANASARI' | 'CIBIRU';

export interface StationDefinition {
  id: StationId;
  name: string;
  arrivalProgress: number;
  nextRoutePhase: RoutePhase;
  repairCost: number;
  repairAmount: number;
  upgradeCost: number;
  canRescueSurvivor: boolean;
}

export interface StationRepairQuote {
  sectionId: TrainSectionId;
  cost: number;
  repairAmount: number;
  canRepair: boolean;
}

export interface StationState {
  definition: StationDefinition;
  selectedSectionId: TrainSectionId;
}

export type StationActionResult = {
  success: boolean;
  message: string;
  run: RunState;
};
