import { GameStateStore } from './game-state';
import { createInitialRunState, RunState } from './run-state';

export interface SessionSettings {
  screenShakeEnabled: boolean;
  audioVolume: number;
}

export class SessionContext {
  public readonly gameState = new GameStateStore();
  public readonly settings: SessionSettings = {
    screenShakeEnabled: true,
    audioVolume: 0.8,
  };
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
