import type { RunState, RoutePhase } from '../core/run-state';
import { BIOME_BY_ID, getEncounterProfile, getRoutePhaseDefinition, ROUTE_PHASE_DEFINITIONS } from '../data/route-config';
import type { BiomeDefinition, EncounterProfile, RouteAdvanceResult, RouteMarkerState } from '../entities/route/route-types';

export class RouteSystem {
  public getPhaseDefinition(phase: RoutePhase) {
    return getRoutePhaseDefinition(phase);
  }

  public getBiome(run: RunState): BiomeDefinition {
    const definition = getRoutePhaseDefinition(run.routePhase);
    return BIOME_BY_ID[definition.biomeId ?? 'FARMLAND'];
  }

  public getEncounterProfile(run: RunState): EncounterProfile {
    return getEncounterProfile(getRoutePhaseDefinition(run.routePhase).encounterProfile);
  }

  public getMarkers(run: RunState): RouteMarkerState {
    return {
      progress: run.progress,
      currentPhase: run.routePhase,
      stationProgress: ROUTE_PHASE_DEFINITIONS.filter((definition) => definition.phase === 'STATION_1' || definition.phase === 'STATION_2')
        .map((definition) => definition.startProgress),
      visitedStations: [...run.stationIds],
      bossProgress: getRoutePhaseDefinition('BOSS').startProgress,
    };
  }

  public advance(run: RunState, deltaSeconds: number): RouteAdvanceResult {
    const previousPhase = run.routePhase;
    if (deltaSeconds <= 0 || previousPhase === 'STATION_1' || previousPhase === 'STATION_2' || previousPhase === 'BOSS' || previousPhase === 'DESTINATION') {
      return { progress: run.progress, phase: run.routePhase, enteredBiome: undefined, reachedBossGate: false };
    }

    const definition = getRoutePhaseDefinition(previousPhase);
    const duration = Math.max(0.001, definition.targetDurationSeconds);
    const progressPerSecond = (definition.endProgress - definition.startProgress) / duration;
    run.elapsedSeconds += deltaSeconds;
    run.progress = Math.min(definition.endProgress, run.progress + Math.max(0, deltaSeconds) * progressPerSecond);

    if (previousPhase === 'DEPARTURE' && run.progress >= definition.endProgress) {
      run.routePhase = 'BIOME_1';
      run.progress = getRoutePhaseDefinition('BIOME_1').startProgress;
    } else if (previousPhase === 'BIOME_3' && run.progress >= definition.endProgress) {
      run.routePhase = 'BOSS';
      run.progress = getRoutePhaseDefinition('BOSS').startProgress;
    }

    return {
      progress: run.progress,
      phase: run.routePhase,
      enteredBiome: previousPhase !== run.routePhase ? this.getBiome(run).id : undefined,
      reachedBossGate: previousPhase === 'BIOME_3' && run.routePhase === 'BOSS',
    };
  }
}
