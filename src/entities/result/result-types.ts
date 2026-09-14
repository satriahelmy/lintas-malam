import type { RoutePhase, RunState } from '../../core/run-state';

export type RunOutcome = 'VICTORY' | 'GAME_OVER';
export type TerminalReason =
  | 'PLAYER_DOWN'
  | 'LOCOMOTIVE_FAILED'
  | 'PLAYER_AND_LOCOMOTIVE'
  | 'DESTINATION_REACHED';
export type TrainResultCondition = 'OPERATIONAL' | 'DAMAGED' | 'CRITICAL' | 'FAILED';

export interface TerminalStateInput {
  playerHealth: number;
  locomotiveHealth: number;
  bossDefeated: boolean;
  routePhase: RoutePhase;
  progress: number;
}

export interface RunResult {
  outcome: RunOutcome;
  reason: TerminalReason;
  progress: number;
  enemiesDefeated: number;
  scrapCollected: number;
  survivorsRescued: number;
  runTimeSeconds: number;
  trainCondition: TrainResultCondition;
  trainConditionPercent: number;
}

export function createRunResult(run: RunState, outcome: RunOutcome, reason: TerminalReason): RunResult {
  const totalMaxHp = run.train.reduce((sum, section) => sum + section.maxHp, 0);
  const totalHp = run.train.reduce((sum, section) => sum + section.currentHp, 0);
  const trainConditionPercent = totalMaxHp > 0 ? Math.round((totalHp / totalMaxHp) * 100) : 0;

  return {
    outcome,
    reason,
    progress: Math.max(0, Math.min(100, run.progress)),
    enemiesDefeated: run.enemiesDefeated,
    scrapCollected: run.scrapCollected,
    survivorsRescued: run.survivorIds.length,
    runTimeSeconds: Math.max(0, run.elapsedSeconds),
    trainCondition: getTrainResultCondition(run),
    trainConditionPercent,
  };
}

export function resolveTerminalOutcome(state: TerminalStateInput): { outcome: RunOutcome; reason: TerminalReason } | null {
  const playerDown = state.playerHealth <= 0;
  const locomotiveFailed = state.locomotiveHealth <= 0;
  if (playerDown || locomotiveFailed) {
    return {
      outcome: 'GAME_OVER',
      reason: playerDown && locomotiveFailed
        ? 'PLAYER_AND_LOCOMOTIVE'
        : playerDown
          ? 'PLAYER_DOWN'
          : 'LOCOMOTIVE_FAILED',
    };
  }

  if (state.bossDefeated && state.routePhase === 'DESTINATION' && state.progress >= 100) {
    return { outcome: 'VICTORY', reason: 'DESTINATION_REACHED' };
  }
  return null;
}

function getTrainResultCondition(run: RunState): TrainResultCondition {
  const locomotive = run.train.find((section) => section.id === 'LOCOMOTIVE');
  if (!locomotive || locomotive.currentHp <= 0) return 'FAILED';

  const totalMaxHp = run.train.reduce((sum, section) => sum + section.maxHp, 0);
  const totalHp = run.train.reduce((sum, section) => sum + section.currentHp, 0);
  const ratio = totalMaxHp > 0 ? totalHp / totalMaxHp : 0;
  if (ratio <= 0.33) return 'CRITICAL';
  if (ratio <= 0.66) return 'DAMAGED';
  return 'OPERATIONAL';
}
