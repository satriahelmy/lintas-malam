import type { EnemyArchetype } from '../enemy/enemy-types';
import type { RoutePhase } from '../../core/run-state';

export type BiomeId = 'FARMLAND' | 'PLANTATION_FOREST' | 'HIGHLAND_NIGHT';
export type EncounterProfileId = 'EARLY' | 'MID' | 'LATE' | 'BOSS_PREP';

export interface BiomeDefinition {
  id: BiomeId;
  name: string;
  worldColor: number;
  skyColor: number;
  groundColor: number;
  parallaxColors: readonly [number, number, number];
}

export interface EncounterProfile {
  id: EncounterProfileId;
  spawnIntervalMs: number;
  activeCap: number;
  spawnWeights: Readonly<Record<EnemyArchetype, number>>;
  healthMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
  attackIntervalMultiplier: number;
  dropMultiplier: number;
}

export interface RoutePhaseDefinition {
  phase: RoutePhase;
  startProgress: number;
  endProgress: number;
  targetDurationSeconds: number;
  encounterProfile: EncounterProfileId;
  biomeId?: BiomeId;
}

export interface RouteMarkerState {
  progress: number;
  currentPhase: RoutePhase;
  stationProgress: readonly number[];
  visitedStations: readonly string[];
  bossProgress: number;
}

export interface RouteAdvanceResult {
  progress: number;
  phase: RoutePhase;
  enteredBiome: BiomeId | undefined;
  reachedBossGate: boolean;
}
