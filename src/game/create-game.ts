import Phaser from 'phaser';

import { DESIGN_VIEWPORT_HEIGHT, DESIGN_VIEWPORT_WIDTH } from './game-config';
import { BootScene } from '../scenes/boot-scene';
import { GameplayScene } from '../scenes/gameplay-scene';
import { MenuScene } from '../scenes/menu-scene';
import { PreloadScene } from '../scenes/preload-scene';

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
    width: DESIGN_VIEWPORT_WIDTH,
    height: DESIGN_VIEWPORT_HEIGHT,
    backgroundColor: '#071018',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DESIGN_VIEWPORT_WIDTH,
      height: DESIGN_VIEWPORT_HEIGHT,
    },
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
    },
    fps: {
      target: 60,
    },
    scene: [BootScene, PreloadScene, MenuScene, GameplayScene],
  });
}
