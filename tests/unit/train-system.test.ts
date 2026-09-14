import { describe, expect, it } from 'vitest';

import { GameEventBus } from '../../src/core/events';
import { createInitialRunState } from '../../src/core/run-state';
import { getTrainCondition, TrainSystem } from '../../src/entities/train/train-system';

describe('TrainSystem', () => {
  it('supports independent damage on every required section', () => {
    const run = createInitialRunState(9);
    const train = new TrainSystem(run);

    for (const sectionId of ['DEFENSE', 'WORKSHOP', 'PASSENGER', 'LOCOMOTIVE'] as const) {
      train.damage(sectionId, 1);
      expect(train.getSection(sectionId).currentHp).toBe(99);
    }

    train.damage('DEFENSE', 66);
    expect(getTrainCondition(train.getSection('DEFENSE'))).toBe('CRITICAL');
  });

  it('keeps section damage independent and reports condition thresholds', () => {
    const run = createInitialRunState(10);
    const train = new TrainSystem(run);

    train.damage('PASSENGER', 35);
    expect(train.getSection('PASSENGER').currentHp).toBe(65);
    expect(getTrainCondition(train.getSection('PASSENGER'))).toBe('DAMAGED');
    expect(train.getSection('LOCOMOTIVE').currentHp).toBe(100);
  });

  it('clamps damage at zero and emits locomotive failure once', () => {
    const run = createInitialRunState(11);
    const events = new GameEventBus();
    const failures: string[] = [];
    events.on('locomotive-failed', ({ sectionId }) => failures.push(sectionId));
    const train = new TrainSystem(run, events);

    const first = train.damage('LOCOMOTIVE', 150);
    const second = train.damage('LOCOMOTIVE', 20);

    expect(first.currentHp).toBe(0);
    expect(first.condition).toBe('DESTROYED');
    expect(second.currentHp).toBe(0);
    expect(failures).toEqual(['LOCOMOTIVE']);
  });

  it('repairs only the selected section and clamps at max HP', () => {
    const run = createInitialRunState(12);
    const train = new TrainSystem(run);

    train.damage('WORKSHOP', 60);
    expect(train.repair('WORKSHOP', 100)).toBe(60);
    expect(train.getSection('WORKSHOP').currentHp).toBe(100);
    expect(train.getSection('DEFENSE').currentHp).toBe(100);
  });

  it('does not revive a terminally failed locomotive', () => {
    const run = createInitialRunState(14);
    const train = new TrainSystem(run);

    train.damage('LOCOMOTIVE', 100);

    expect(train.repair('LOCOMOTIVE', 100)).toBe(0);
    expect(train.getSection('LOCOMOTIVE').currentHp).toBe(0);
  });

  it('exposes bounded support modifier hooks for Workshop and Defense', () => {
    const train = new TrainSystem(createInitialRunState(15));

    expect(train.getSupportModifiers(0.25, 0.1)).toEqual({
      repairEffectiveness: 1.25,
      defenseEffectiveness: 1.1,
    });
    expect(train.getSupportModifiers(-1, -1)).toEqual({
      repairEffectiveness: 1,
      defenseEffectiveness: 1,
    });
  });

  it('supports stop and resume hooks without duplicate movement events', () => {
    const run = createInitialRunState(13);
    const events = new GameEventBus();
    const states: boolean[] = [];
    events.on('train-movement-changed', ({ moving }) => states.push(moving));
    const train = new TrainSystem(run, events);

    train.stop();
    train.stop();
    train.resume();
    train.resume();

    expect(train.isMoving()).toBe(true);
    expect(states).toEqual([false, true]);
  });
});
