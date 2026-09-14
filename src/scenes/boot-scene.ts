import Phaser from 'phaser';

import { SessionContext } from '../core/session-context';
import { setAppStatus } from '../core/dom-status';
import { SceneKeys } from '../game/scene-keys';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.BOOT);
  }

  public create(): void {
    if (!this.registry.has('session')) {
      this.registry.set('session', new SessionContext());
    }

    setAppStatus('Booting', 'boot');
    this.scene.start(SceneKeys.PRELOAD);
  }
}
