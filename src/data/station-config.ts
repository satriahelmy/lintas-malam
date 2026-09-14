import type { StationDefinition, StationId } from '../entities/station/station-types';
import { ROUTE_STATION_PROGRESS } from './route-config';

export const STATION_DEFINITIONS: readonly StationDefinition[] = [
  {
    id: 'WANASARI',
    name: 'Stasiun Wanasari',
    arrivalProgress: ROUTE_STATION_PROGRESS.WANASARI,
    nextRoutePhase: 'BIOME_2',
    repairCost: 10,
    repairAmount: 30,
    upgradeCost: 15,
    canRescueSurvivor: true,
    rescueOptions: ['MONTIR', 'PERAWAT'],
  },
  {
    id: 'CIBIRU',
    name: 'Stasiun Cibiru',
    arrivalProgress: ROUTE_STATION_PROGRESS.CIBIRU,
    nextRoutePhase: 'BIOME_3',
    repairCost: 12,
    repairAmount: 35,
    upgradeCost: 20,
    canRescueSurvivor: true,
    rescueOptions: ['PEDAGANG', 'PENJAGA'],
  },
];

export const STATION_BY_ID: Readonly<Record<StationId, StationDefinition>> = Object.fromEntries(
  STATION_DEFINITIONS.map((station) => [station.id, station]),
) as Record<StationId, StationDefinition>;
