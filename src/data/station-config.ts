import type { StationDefinition, StationId } from '../entities/station/station-types';

export const STATION_DEFINITIONS: readonly StationDefinition[] = [
  {
    id: 'WANASARI',
    name: 'Stasiun Wanasari',
    arrivalProgress: 20,
    nextRoutePhase: 'BIOME_2',
    repairCost: 10,
    repairAmount: 30,
    upgradeCost: 15,
    canRescueSurvivor: true,
  },
  {
    id: 'CIBIRU',
    name: 'Stasiun Cibiru',
    arrivalProgress: 50,
    nextRoutePhase: 'BIOME_3',
    repairCost: 12,
    repairAmount: 35,
    upgradeCost: 20,
    canRescueSurvivor: true,
  },
];

export const STATION_BY_ID: Readonly<Record<StationId, StationDefinition>> = Object.fromEntries(
  STATION_DEFINITIONS.map((station) => [station.id, station]),
) as Record<StationId, StationDefinition>;
