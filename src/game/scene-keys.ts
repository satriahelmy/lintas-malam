export const SceneKeys = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAMEPLAY: 'GameplayScene',
  UPGRADE: 'UpgradeScene',
  STATION: 'StationScene',
  RESULTS: 'ResultScene',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
