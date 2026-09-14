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
  biomeFarmlandFar: {
    key: 'art-biome-farmland-far',
    url: 'assets/environment/biome_farmland/far_strip.png',
  },
  biomeFarmlandMid: {
    key: 'art-biome-farmland-mid',
    url: 'assets/environment/biome_farmland/mid_strip.png',
  },
  biomeFarmlandForeground: {
    key: 'art-biome-farmland-foreground',
    url: 'assets/environment/biome_farmland/foreground_strip.png',
  },
  biomePlantationFar: {
    key: 'art-biome-plantation-far',
    url: 'assets/environment/biome_plantation_forest/far_strip.png',
  },
  biomePlantationMid: {
    key: 'art-biome-plantation-mid',
    url: 'assets/environment/biome_plantation_forest/mid_strip.png',
  },
  biomePlantationForeground: {
    key: 'art-biome-plantation-foreground',
    url: 'assets/environment/biome_plantation_forest/foreground_strip.png',
  },
  biomeHighlandFar: {
    key: 'art-biome-highland-far',
    url: 'assets/environment/biome_highland/far_strip.png',
  },
  biomeHighlandMid: {
    key: 'art-biome-highland-mid',
    url: 'assets/environment/biome_highland/mid_strip.png',
  },
  biomeHighlandForeground: {
    key: 'art-biome-highland-foreground',
    url: 'assets/environment/biome_highland/foreground_strip.png',
  },
  stationWanasari: {
    key: 'art-station-wanasari',
    url: 'assets/stations/wanasari_station.png',
  },
  stationCibiru: {
    key: 'art-station-cibiru',
    url: 'assets/stations/cibiru_station.png',
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

export const BIOME_IMAGE_ASSETS = {
  FARMLAND: {
    FAR: OPTIONAL_IMAGE_ASSETS.biomeFarmlandFar,
    MID: OPTIONAL_IMAGE_ASSETS.biomeFarmlandMid,
    FOREGROUND: OPTIONAL_IMAGE_ASSETS.biomeFarmlandForeground,
  },
  PLANTATION_FOREST: {
    FAR: OPTIONAL_IMAGE_ASSETS.biomePlantationFar,
    MID: OPTIONAL_IMAGE_ASSETS.biomePlantationMid,
    FOREGROUND: OPTIONAL_IMAGE_ASSETS.biomePlantationForeground,
  },
  HIGHLAND_NIGHT: {
    FAR: OPTIONAL_IMAGE_ASSETS.biomeHighlandFar,
    MID: OPTIONAL_IMAGE_ASSETS.biomeHighlandMid,
    FOREGROUND: OPTIONAL_IMAGE_ASSETS.biomeHighlandForeground,
  },
} as const;

export const STATION_IMAGE_ASSETS = {
  WANASARI: OPTIONAL_IMAGE_ASSETS.stationWanasari,
  CIBIRU: OPTIONAL_IMAGE_ASSETS.stationCibiru,
} as const;
