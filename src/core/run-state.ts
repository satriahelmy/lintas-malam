import { PLAYER_BALANCE } from '../data/balance-config';

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

export interface RunTelemetry {
  playerDamageTaken: number;
  enemyDamageToPlayer: number;
  bossDamageToPlayer: number;
  trainDamageTaken: number;
  enemyDamageToTrain: number;
  bossDamageToTrain: number;
  stationRepairs: number;
  stationUpgrades: number;
  upgradeChoices: string[];
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
  telemetry: RunTelemetry;
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
    telemetry: {
      playerDamageTaken: 0,
      enemyDamageToPlayer: 0,
      bossDamageToPlayer: 0,
      trainDamageTaken: 0,
      enemyDamageToTrain: 0,
      bossDamageToTrain: 0,
      stationRepairs: 0,
      stationUpgrades: 0,
      upgradeChoices: [],
    },
    player: {
      health: PLAYER_BALANCE.maxHealth,
      maxHealth: PLAYER_BALANCE.maxHealth,
      movementSpeed: PLAYER_BALANCE.movementSpeed,
      damage: PLAYER_BALANCE.damage,
      fireRate: PLAYER_BALANCE.fireRate,
      weaponRange: PLAYER_BALANCE.weaponRange,
    },
    train: [
      { id: 'DEFENSE', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'WORKSHOP', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'PASSENGER', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
      { id: 'LOCOMOTIVE', currentHp: INITIAL_TRAIN_HP, maxHp: INITIAL_TRAIN_HP },
    ],
  };
}
