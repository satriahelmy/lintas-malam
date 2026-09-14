import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { ROUTE_STATION_PROGRESS, getRoutePhaseDefinition } from '../../src/data/route-config';
import { RouteSystem } from '../../src/systems/route-system';

describe('RouteSystem', () => {
  it('advances the route in configured order and pauses at station gates', () => {
    const run = createInitialRunState();
    const route = new RouteSystem();

    route.advance(run, 60);
    expect(run.routePhase).toBe('BIOME_1');
    expect(run.progress).toBeCloseTo(getRoutePhaseDefinition('BIOME_1').startProgress);

    route.advance(run, 180);
    expect(run.routePhase).toBe('BIOME_1');
    expect(run.progress).toBeCloseTo(ROUTE_STATION_PROGRESS.WANASARI);

    run.routePhase = 'STATION_1';
    expect(route.advance(run, 30)).toMatchObject({ phase: 'STATION_1', reachedBossGate: false });
    expect(run.progress).toBeCloseTo(ROUTE_STATION_PROGRESS.WANASARI);

    run.routePhase = 'BIOME_2';
    run.progress = getRoutePhaseDefinition('BIOME_2').startProgress;
    route.advance(run, 180);
    expect(run.progress).toBeCloseTo(ROUTE_STATION_PROGRESS.CIBIRU);

    run.routePhase = 'STATION_2';
    run.routePhase = 'BIOME_3';
    run.progress = getRoutePhaseDefinition('BIOME_3').startProgress;
    const bossGate = route.advance(run, 180);
    expect(bossGate).toMatchObject({ phase: 'BOSS', reachedBossGate: true });
    expect(run.progress).toBeCloseTo(getRoutePhaseDefinition('BOSS').startProgress);
  });

  it('keeps station and boss triggers idempotent across large time steps', () => {
    const run = createInitialRunState();
    const route = new RouteSystem();

    route.advance(run, 999);
    expect(run.routePhase).toBe('BIOME_1');
    expect(run.progress).toBeCloseTo(getRoutePhaseDefinition('BIOME_1').startProgress);

    run.progress = getRoutePhaseDefinition('BIOME_1').endProgress;
    route.advance(run, 999);
    expect(run.progress).toBeCloseTo(getRoutePhaseDefinition('BIOME_1').endProgress);

    run.routePhase = 'BOSS';
    const progressAtBoss = run.progress;
    expect(route.advance(run, 999)).toMatchObject({ phase: 'BOSS', reachedBossGate: false });
    expect(run.progress).toBe(progressAtBoss);
  });

  it('exposes biome, encounter, and marker data without a minimap', () => {
    const run = createInitialRunState();
    const route = new RouteSystem();
    run.routePhase = 'BIOME_2';

    expect(route.getBiome(run).id).toBe('PLANTATION_FOREST');
    expect(route.getEncounterProfile(run).id).toBe('MID');
    expect(route.getMarkers(run)).toMatchObject({
      currentPhase: 'BIOME_2',
      stationProgress: [ROUTE_STATION_PROGRESS.WANASARI, ROUTE_STATION_PROGRESS.CIBIRU],
      bossProgress: getRoutePhaseDefinition('BOSS').startProgress,
    });
  });
});
