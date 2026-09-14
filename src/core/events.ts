import { GameState } from './game-state';
import { TrainSectionId } from './run-state';
import { TrainCondition } from '../entities/train/train-types';

export interface GameEventMap {
  'game-state-changed': { next: GameState; previous: GameState };
  'run-created': { seed: number };
  'train-section-damaged': {
    sectionId: TrainSectionId;
    amount: number;
    currentHp: number;
    maxHp: number;
    condition: TrainCondition;
  };
  'locomotive-failed': { sectionId: 'LOCOMOTIVE' };
  'train-movement-changed': { moving: boolean };
}

export type GameEventName = keyof GameEventMap;
export type GameEventListener<Name extends GameEventName> = (payload: GameEventMap[Name]) => void;

export class GameEventBus {
  private readonly listeners = new Map<GameEventName, Set<(payload: never) => void>>();

  public emit<Name extends GameEventName>(name: Name, payload: GameEventMap[Name]): void {
    const listeners = this.listeners.get(name);
    if (!listeners) return;
    for (const listener of listeners) listener(payload as never);
  }

  public on<Name extends GameEventName>(name: Name, listener: GameEventListener<Name>): () => void {
    const listeners = this.listeners.get(name) ?? new Set<(payload: never) => void>();
    listeners.add(listener as (payload: never) => void);
    this.listeners.set(name, listeners);
    return () => listeners.delete(listener as (payload: never) => void);
  }
}
