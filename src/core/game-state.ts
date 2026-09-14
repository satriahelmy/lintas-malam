export type GameState =
  | 'MAIN_MENU'
  | 'PLAYING'
  | 'UPGRADE'
  | 'STATION'
  | 'BOSS'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'PAUSED';

export type GameStateListener = (next: GameState, previous: GameState) => void;

export class GameStateStore {
  private current: GameState;
  private readonly listeners = new Set<GameStateListener>();

  public constructor(initial: GameState = 'MAIN_MENU') {
    this.current = initial;
  }

  public get value(): GameState {
    return this.current;
  }

  public transition(next: GameState): void {
    if (next === this.current) return;

    const previous = this.current;
    this.current = next;
    for (const listener of this.listeners) listener(next, previous);
  }

  public subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
