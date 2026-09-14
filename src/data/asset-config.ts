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
} as const satisfies Record<string, OptionalImageAsset>;

export const TRAIN_IMAGE_ASSETS = {
  DEFENSE: OPTIONAL_IMAGE_ASSETS.trainDefense,
  WORKSHOP: OPTIONAL_IMAGE_ASSETS.trainWorkshop,
  PASSENGER: OPTIONAL_IMAGE_ASSETS.trainPassenger,
  LOCOMOTIVE: OPTIONAL_IMAGE_ASSETS.trainLocomotive,
} as const;
