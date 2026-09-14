import { describe, expect, it } from 'vitest';

import { createInitialRunState } from '../../src/core/run-state';
import { SessionContext } from '../../src/core/session-context';
import { getNormalizedMovement, moveWithinBounds } from '../../src/systems/movement-system';

describe('createInitialRunState', () => {
  it('creates a deterministic, clean run with the four required train sections', () => {
    const run = createInitialRunState(42);

    expect(run.seed).toBe(42);
    expect(run.routePhase).toBe('DEPARTURE');
    expect(run.progress).toBe(0);
    expect(run.scrap).toBe(0);
    expect(run.stationIds).toEqual([]);
    expect(run.survivorIds).toEqual([]);
    expect(run.upgradeIds).toEqual([]);
    expect(run.train.map((section) => section.id)).toEqual([
      'DEFENSE',
      'WORKSHOP',
      'PASSENGER',
      'LOCOMOTIVE',
    ]);
    expect(run.train.every((section) => section.currentHp === section.maxHp)).toBe(true);
  });

  it('does not share mutable arrays between runs', () => {
    const first = createInitialRunState(1);
    const second = createInitialRunState(2);

    first.survivorIds.push('montir');
    first.upgradeIds.push('rapid-fire');
    first.stationIds.push('WANASARI');

    expect(second.survivorIds).toEqual([]);
    expect(second.upgradeIds).toEqual([]);
    expect(second.stationIds).toEqual([]);
  });
});

describe('SessionContext', () => {
  it('discards run-local state and creates a clean run again', () => {
    const session = new SessionContext();
    const firstRun = session.startNewRun(7);
    firstRun.scrap = 80;
    firstRun.survivorIds.push('montir');

    session.discardRun();
    expect(session.run).toBeNull();
    expect(session.gameState.value).toBe('MAIN_MENU');

    const secondRun = session.startNewRun(8);
    expect(secondRun.scrap).toBe(0);
    expect(secondRun.scrapCollected).toBe(0);
    expect(secondRun.scrapSpent).toBe(0);
    expect(secondRun.survivorIds).toEqual([]);
    expect(session.gameState.value).toBe('PLAYING');
  });
});

describe('movement system', () => {
  const bounds = { left: 0, right: 100, top: 0, bottom: 100 };

  it('normalizes diagonal movement', () => {
    const direction = getNormalizedMovement({ left: false, right: true, up: true, down: false });

    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
    expect(direction.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it('returns zero movement when no key is pressed', () => {
    expect(getNormalizedMovement({ left: false, right: false, up: false, down: false })).toEqual({ x: 0, y: 0 });
  });

  it('keeps the player inside the configured bounds', () => {
    expect(moveWithinBounds({ x: 1, y: 50 }, { left: true, right: false, up: false, down: false }, 240, 1, bounds).x).toBe(0);
    expect(moveWithinBounds({ x: 50, y: 99 }, { left: false, right: false, up: false, down: true }, 240, 1, bounds).y).toBe(100);
  });
});
