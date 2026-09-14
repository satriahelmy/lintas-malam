import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import { SceneKeys } from '../game/scene-keys';

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.PRELOAD);
  }

  public create(): void {
    // M1 intentionally has no final or external assets. The loader boundary is ready for later asset batches.
    setAppStatus('Main Menu', 'main-menu');
    this.scene.start(SceneKeys.MENU);
  }
}
