export interface OptionalImageAsset {
  key: string;
  url: string;
}

// Keep URLs relative so the static build works at the domain root and in a PHP-hosted subfolder.
export const OPTIONAL_IMAGE_ASSETS = {
  playerIdle: {
    key: 'art-player-idle',
    url: 'assets/characters/player/player_idle.png',
  },
  trainDefense: {
    key: 'art-train-defense',
    url: 'assets/train/carriage_defense.png',
  },
  trainWorkshop: {
    key: 'art-train-workshop',
    url: 'assets/train/carriage_workshop.png',
  },
  trainPassenger: {
    key: 'art-train-passenger',
    url: 'assets/train/carriage_passenger.png',
  },
  trainLocomotive: {
    key: 'art-train-locomotive',
    url: 'assets/train/locomotive.png',
  },
  enemyMist: {
    key: 'art-enemy-mist',
    url: 'assets/enemies/mist/mist_idle.png',
  },
  enemyShadow: {
    key: 'art-enemy-shadow',
    url: 'assets/enemies/shadow/shadow_idle.png',
  },
  enemyKeeper: {
    key: 'art-enemy-keeper',
    url: 'assets/enemies/keeper/keeper_idle.png',
  },
  bossIdle: {
    key: 'art-boss-idle',
    url: 'assets/boss/boss_idle.png',
  },
  survivorMontir: {
    key: 'art-survivor-montir',
    url: 'assets/characters/survivors/montir/montir_idle.png',
  },
  survivorPedagang: {
    key: 'art-survivor-pedagang',
    url: 'assets/characters/survivors/pedagang/pedagang_idle.png',
  },
  survivorPerawat: {
    key: 'art-survivor-perawat',
    url: 'assets/characters/survivors/perawat/perawat_idle.png',
  },
  survivorPenjaga: {
    key: 'art-survivor-penjaga',
    url: 'assets/characters/survivors/penjaga/penjaga_idle.png',
  },
} as const satisfies Record<string, OptionalImageAsset>;

export const TRAIN_IMAGE_ASSETS = {
  DEFENSE: OPTIONAL_IMAGE_ASSETS.trainDefense,
  WORKSHOP: OPTIONAL_IMAGE_ASSETS.trainWorkshop,
  PASSENGER: OPTIONAL_IMAGE_ASSETS.trainPassenger,
  LOCOMOTIVE: OPTIONAL_IMAGE_ASSETS.trainLocomotive,
} as const;

export const ENEMY_IMAGE_ASSETS = {
  MIST: OPTIONAL_IMAGE_ASSETS.enemyMist,
  SHADOW: OPTIONAL_IMAGE_ASSETS.enemyShadow,
  KEEPER: OPTIONAL_IMAGE_ASSETS.enemyKeeper,
} as const;

export const BOSS_IMAGE_ASSET = OPTIONAL_IMAGE_ASSETS.bossIdle;

export const SURVIVOR_IMAGE_ASSETS = {
  MONTIR: OPTIONAL_IMAGE_ASSETS.survivorMontir,
  PEDAGANG: OPTIONAL_IMAGE_ASSETS.survivorPedagang,
  PERAWAT: OPTIONAL_IMAGE_ASSETS.survivorPerawat,
  PENJAGA: OPTIONAL_IMAGE_ASSETS.survivorPenjaga,
} as const;
