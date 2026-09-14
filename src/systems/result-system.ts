import type { RunState } from '../core/run-state';
import { createRunResult, resolveTerminalOutcome } from '../entities/result/result-types';
import type { RunResult, TerminalStateInput } from '../entities/result/result-types';

export class ResultSystem {
  private result?: RunResult;

  public evaluate(run: RunState, bossDefeated: boolean): RunResult | null {
    if (this.result) return this.result;

    const locomotive = run.train.find((section) => section.id === 'LOCOMOTIVE');
    const state: TerminalStateInput = {
      playerHealth: run.player.health,
      locomotiveHealth: locomotive?.currentHp ?? 0,
      bossDefeated,
      routePhase: run.routePhase,
      progress: run.progress,
    };
    const terminal = resolveTerminalOutcome(state);
    if (!terminal) return null;

    this.result = createRunResult(run, terminal.outcome, terminal.reason);
    return this.result;
  }

  public getResult(): RunResult | undefined {
    return this.result;
  }

  public reset(): void {
    this.result = undefined;
  }
}
