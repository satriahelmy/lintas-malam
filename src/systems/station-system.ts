import type { RunState, TrainSectionId } from '../core/run-state';
import { STATION_BY_ID, STATION_DEFINITIONS } from '../data/station-config';
import { getRoutePhaseDefinition } from '../data/route-config';
import type { StationDefinition, StationId, StationRepairQuote } from '../entities/station/station-types';

export class StationSystem {
  public getDefinition(id: StationId): StationDefinition {
    return STATION_BY_ID[id];
  }

  public getNextStation(run: RunState): StationDefinition | undefined {
    return STATION_DEFINITIONS.find((station) => !run.stationIds.includes(station.id) && run.progress >= station.arrivalProgress);
  }

  public markArrived(run: RunState, id: StationId): StationDefinition {
    const definition = this.getDefinition(id);
    if (!run.stationIds.includes(id)) run.stationIds.push(id);
    run.routePhase = id === 'WANASARI' ? 'STATION_1' : 'STATION_2';
    return definition;
  }

  public markDeparted(run: RunState, id: StationId): void {
    const nextRoutePhase = this.getDefinition(id).nextRoutePhase;
    run.routePhase = nextRoutePhase;
    run.progress = Math.max(run.progress, getRoutePhaseDefinition(nextRoutePhase).startProgress);
  }

  public getRepairQuote(run: RunState, sectionId: TrainSectionId, id: StationId): StationRepairQuote {
    const section = run.train.find((candidate) => candidate.id === sectionId);
    const definition = this.getDefinition(id);
    const canRepair = Boolean(section && section.currentHp < section.maxHp && section.currentHp > 0);
    return {
      sectionId,
      cost: definition.repairCost,
      repairAmount: definition.repairAmount,
      canRepair,
    };
  }
}
