export type RoutePhase = 'DEPARTURE' | 'BIOME_1' | 'STATION_1' | 'BIOME_2' | 'STATION_2' | 'BIOME_3' | 'BOSS' | 'DESTINATION';

export type TrainSectionId = 'LOCOMOTIVE' | 'PASSENGER' | 'WORKSHOP' | 'DEFENSE';

export interface PlayerRunState {
  health: number;
  maxHealth: number;
  movementSpeed: number;
  damage: number;
  fireRate: number;
  weaponRange: number;
}

export interface TrainSectionRunState {
  id: TrainSectionId;
  currentHp: number;
  maxHp: number;
}

export interface RunState {
  seed: number;
  routePhase: RoutePhase;
  progress: number;
  scrap: number;
  scrapCollected: number;
  scrapSpent: number;
  enemiesDefeated: number;
  elapsedSeconds: number;
  stationIds: string[];
  survivorIds: string[];
  upgradeIds: string[];
  player: PlayerRunState;
  train: TrainSectionRunState[];
}

const INITIAL_TRAIN_HP = 100;

export function createInitialRunState(seed = 1): RunState {
  return {
    seed,
    routePhase: 'DEPARTURE',
    progress: 0,
    scrap: 0,
    scrapCollected: 0,
    scrapSpent: 0,
    enemiesDefeated: 0,
    elapsedSeconds: 0,
    stationIds: [],
    survivorIds: [],
    upgradeIds: [],
    player: {
      health: 100,
      maxHealth: 100,
      movementSpeed: 240,
      damage: 10,
      fireRate: 4,
      weaponRange: 480,
    },
    train: [
      { id: 'DEFENSE', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'WORKSHOP', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'PASSENGER', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'LOCOMOTIVE', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
    ],
  };
}
