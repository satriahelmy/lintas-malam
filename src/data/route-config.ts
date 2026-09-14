import type { RoutePhase } from '../core/run-state';
import { ROUTE_BALANCE_TARGETS } from './balance-config';
import type { BiomeDefinition, EncounterProfile, EncounterProfileId, RoutePhaseDefinition } from '../entities/route/route-types';

export const BIOME_DEFINITIONS: readonly BiomeDefinition[] = [
  {
    id: 'FARMLAND',
    name: 'Farmland',
    worldColor: 0x142c2f,
    skyColor: 0x25484a,
    groundColor: 0x3b5b4f,
    parallaxColors: [0x1a3033, 0x27443f, 0x345049],
  },
  {
    id: 'PLANTATION_FOREST',
    name: 'Plantation & Forest',
    worldColor: 0x101e24,
    skyColor: 0x1c3338,
    groundColor: 0x2d4a43,
    parallaxColors: [0x15272b, 0x203a35, 0x2c4941],
  },
  {
    id: 'HIGHLAND_NIGHT',
    name: 'Highland Night',
    worldColor: 0x0b141d,
    skyColor: 0x172432,
    groundColor: 0x263a42,
    parallaxColors: [0x101d2a, 0x1a2c37, 0x243d43],
  },
];

export const ENCOUNTER_PROFILES: Readonly<Record<EncounterProfileId, EncounterProfile>> = {
  EARLY: {
    id: 'EARLY',
    spawnIntervalMs: 2600,
    activeCap: 8,
    spawnWeights: { MIST: 8, SHADOW: 1, KEEPER: 0 },
    healthMultiplier: 1,
    damageMultiplier: 1,
    speedMultiplier: 1,
    attackIntervalMultiplier: 1,
    dropMultiplier: 1,
  },
  MID: {
    id: 'MID',
    spawnIntervalMs: 2200,
    activeCap: 10,
    spawnWeights: { MIST: 5, SHADOW: 3, KEEPER: 1 },
    healthMultiplier: 1.05,
    damageMultiplier: 1.05,
    speedMultiplier: 1.05,
    attackIntervalMultiplier: 0.96,
    dropMultiplier: 1,
  },
  LATE: {
    id: 'LATE',
    spawnIntervalMs: 1850,
    activeCap: 12,
    spawnWeights: { MIST: 3, SHADOW: 4, KEEPER: 2 },
    healthMultiplier: 1.12,
    damageMultiplier: 1.12,
    speedMultiplier: 1.08,
    attackIntervalMultiplier: 0.92,
    dropMultiplier: 1.1,
  },
  BOSS_PREP: {
    id: 'BOSS_PREP',
    spawnIntervalMs: 1600,
    activeCap: 12,
    spawnWeights: { MIST: 2, SHADOW: 3, KEEPER: 4 },
    healthMultiplier: 1.18,
    damageMultiplier: 1.18,
    speedMultiplier: 1.1,
    attackIntervalMultiplier: 0.88,
    dropMultiplier: 1.15,
  },
};

export const ROUTE_PHASE_DEFINITIONS: readonly RoutePhaseDefinition[] = [
  { phase: 'DEPARTURE', startProgress: 0, endProgress: 8.33, targetDurationSeconds: ROUTE_BALANCE_TARGETS.departureSeconds, encounterProfile: 'EARLY', biomeId: 'FARMLAND' },
  { phase: 'BIOME_1', startProgress: 8.33, endProgress: 33.33, targetDurationSeconds: ROUTE_BALANCE_TARGETS.biomeSeconds, encounterProfile: 'EARLY', biomeId: 'FARMLAND' },
  { phase: 'STATION_1', startProgress: 33.33, endProgress: 37.5, targetDurationSeconds: ROUTE_BALANCE_TARGETS.stationSeconds, encounterProfile: 'EARLY', biomeId: 'FARMLAND' },
  { phase: 'BIOME_2', startProgress: 37.5, endProgress: 62.5, targetDurationSeconds: ROUTE_BALANCE_TARGETS.biomeSeconds, encounterProfile: 'MID', biomeId: 'PLANTATION_FOREST' },
  { phase: 'STATION_2', startProgress: 62.5, endProgress: 66.67, targetDurationSeconds: ROUTE_BALANCE_TARGETS.stationSeconds, encounterProfile: 'MID', biomeId: 'PLANTATION_FOREST' },
  { phase: 'BIOME_3', startProgress: 66.67, endProgress: 91.67, targetDurationSeconds: ROUTE_BALANCE_TARGETS.biomeSeconds, encounterProfile: 'LATE', biomeId: 'HIGHLAND_NIGHT' },
  { phase: 'BOSS', startProgress: 91.67, endProgress: 100, targetDurationSeconds: ROUTE_BALANCE_TARGETS.bossSeconds, encounterProfile: 'BOSS_PREP', biomeId: 'HIGHLAND_NIGHT' },
  { phase: 'DESTINATION', startProgress: 100, endProgress: 100, targetDurationSeconds: 0, encounterProfile: 'BOSS_PREP', biomeId: 'HIGHLAND_NIGHT' },
];

export const ROUTE_TOTAL_TARGET_SECONDS = ROUTE_BALANCE_TARGETS.totalSeconds;
export const ROUTE_STATION_PROGRESS = {
  WANASARI: 33.33,
  CIBIRU: 62.5,
} as const;

export const BIOME_BY_ID: Readonly<Record<BiomeDefinition['id'], BiomeDefinition>> = Object.fromEntries(
  BIOME_DEFINITIONS.map((biome) => [biome.id, biome]),
) as Record<BiomeDefinition['id'], BiomeDefinition>;

export const ROUTE_PHASE_BY_ID: Readonly<Record<RoutePhase, RoutePhaseDefinition>> = Object.fromEntries(
  ROUTE_PHASE_DEFINITIONS.map((definition) => [definition.phase, definition]),
) as Record<RoutePhase, RoutePhaseDefinition>;

export function getEncounterProfile(id: EncounterProfileId): EncounterProfile {
  return ENCOUNTER_PROFILES[id];
}

export function getRoutePhaseDefinition(phase: RoutePhase): RoutePhaseDefinition {
  return ROUTE_PHASE_BY_ID[phase];
}
