import { GameEventBus } from '../../core/events';
import { RunState, TrainSectionId, TrainSectionRunState } from '../../core/run-state';
import { TrainCondition } from './train-types';

export interface TrainSectionChange {
  sectionId: TrainSectionId;
  requestedAmount: number;
  appliedAmount: number;
  currentHp: number;
  maxHp: number;
  condition: TrainCondition;
  locomotiveFailed: boolean;
}

export interface TrainSupportModifiers {
  repairEffectiveness: number;
  defenseEffectiveness: number;
}

export function getTrainCondition(section: TrainSectionRunState): TrainCondition {
  if (section.currentHp <= 0) return 'DESTROYED';

  const ratio = section.currentHp / section.maxHp;
  if (ratio <= 0.33) return 'CRITICAL';
  if (ratio <= 0.66) return 'DAMAGED';
  return 'HEALTHY';
}

export class TrainSystem {
  private locomotiveFailureEmitted = false;
  private moving = true;

  public constructor(
    private readonly run: RunState,
    private readonly events = new GameEventBus(),
  ) {}

  public getSection(sectionId: TrainSectionId): TrainSectionRunState {
    const section = this.run.train.find((candidate) => candidate.id === sectionId);
    if (!section) throw new Error(`Unknown train section: ${sectionId}`);
    return section;
  }

  public damage(sectionId: TrainSectionId, amount: number): TrainSectionChange {
    const section = this.getSection(sectionId);
    const requestedAmount = Math.max(0, amount);
    const beforeHp = section.currentHp;
    section.currentHp = Math.max(0, section.currentHp - requestedAmount);
    const appliedAmount = beforeHp - section.currentHp;
    const condition = getTrainCondition(section);
    const locomotiveFailed = sectionId === 'LOCOMOTIVE' && section.currentHp === 0 && beforeHp > 0;

    this.events.emit('train-section-damaged', {
      sectionId,
      amount: appliedAmount,
      currentHp: section.currentHp,
      maxHp: section.maxHp,
      condition,
    });

    if (locomotiveFailed && !this.locomotiveFailureEmitted) {
      this.locomotiveFailureEmitted = true;
      this.events.emit('locomotive-failed', { sectionId: 'LOCOMOTIVE' });
    }

    return { sectionId, requestedAmount, appliedAmount, currentHp: section.currentHp, maxHp: section.maxHp, condition, locomotiveFailed };
  }

  public repair(sectionId: TrainSectionId, amount: number, effectiveness = 1): number {
    if (sectionId === 'LOCOMOTIVE' && this.locomotiveFailureEmitted) return 0;

    const section = this.getSection(sectionId);
    const repairAmount = Math.max(0, amount) * Math.max(0, effectiveness);
    const beforeHp = section.currentHp;
    section.currentHp = Math.min(section.maxHp, section.currentHp + repairAmount);
    return section.currentHp - beforeHp;
  }

  public getSupportModifiers(workshopBonus = 0, defenseBonus = 0): TrainSupportModifiers {
    return {
      repairEffectiveness: 1 + Math.max(0, workshopBonus),
      defenseEffectiveness: 1 + Math.max(0, defenseBonus),
    };
  }

  public stop(): void {
    if (!this.moving) return;
    this.moving = false;
    this.events.emit('train-movement-changed', { moving: false });
  }

  public resume(): void {
    if (this.moving) return;
    this.moving = true;
    this.events.emit('train-movement-changed', { moving: true });
  }

  public isMoving(): boolean {
    return this.moving;
  }
}
