import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { ROUTE_STATION_PROGRESS } from '../../src/data/route-config';
import { StationSystem } from '../../src/systems/station-system';

describe('StationSystem', () => {
  it('returns stations in order at their configured progress thresholds', () => {
    const run = createInitialRunState();
    const stations = new StationSystem();

    run.progress = ROUTE_STATION_PROGRESS.WANASARI - 0.01;
    expect(stations.getNextStation(run)).toBeUndefined();
    run.progress = ROUTE_STATION_PROGRESS.WANASARI;
    expect(stations.getNextStation(run)?.id).toBe('WANASARI');
    stations.markArrived(run, 'WANASARI');
    expect(run.routePhase).toBe('STATION_1');
    stations.markDeparted(run, 'WANASARI');
    expect(run.routePhase).toBe('BIOME_2');

    run.progress = ROUTE_STATION_PROGRESS.CIBIRU;
    expect(stations.getNextStation(run)?.id).toBe('CIBIRU');
    stations.markArrived(run, 'CIBIRU');
    expect(run.routePhase).toBe('STATION_2');
  });

  it('does not return an already visited station', () => {
    const run = createInitialRunState();
    const stations = new StationSystem();
    run.progress = 100;
    stations.markArrived(run, 'WANASARI');
    expect(stations.getNextStation(run)?.id).toBe('CIBIRU');
    stations.markArrived(run, 'CIBIRU');
    expect(stations.getNextStation(run)).toBeUndefined();
  });

  it('returns a repair quote only for damaged, repairable sections', () => {
    const run = createInitialRunState();
    const stations = new StationSystem();
    const healthy = stations.getRepairQuote(run, 'DEFENSE', 'WANASARI');
    run.train.find((section) => section.id === 'DEFENSE')!.currentHp = 60;
    const damaged = stations.getRepairQuote(run, 'DEFENSE', 'WANASARI');
    run.train.find((section) => section.id === 'DEFENSE')!.currentHp = 0;
    const destroyed = stations.getRepairQuote(run, 'DEFENSE', 'WANASARI');

    expect(healthy).toMatchObject({ cost: 10, repairAmount: 30, canRepair: false });
    expect(damaged.canRepair).toBe(true);
    expect(destroyed.canRepair).toBe(false);
  });
});
