import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import { OPTIONAL_IMAGE_ASSETS } from '../data/asset-config';
import { SceneKeys } from '../game/scene-keys';

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.PRELOAD);
  }

  public preload(): void {
    for (const asset of Object.values(OPTIONAL_IMAGE_ASSETS)) {
      this.load.image(asset.key, asset.url);
    }
  }

  public create(): void {
    setAppStatus('Main Menu', 'main-menu');
    this.scene.start(SceneKeys.MENU);
  }
}
