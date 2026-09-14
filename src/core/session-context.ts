import { GameStateStore } from './game-state';
import { createInitialRunState, RunState } from './run-state';

export class SessionContext {
  public readonly gameState = new GameStateStore();
  private currentRun: RunState | null = null;

  public startNewRun(seed = 1): RunState {
    this.currentRun = createInitialRunState(seed);
    this.gameState.transition('PLAYING');
    return this.currentRun;
  }

  public get run(): RunState | null {
    return this.currentRun;
  }

  public discardRun(): void {
    this.currentRun = null;
    this.gameState.transition('MAIN_MENU');
  }
}
