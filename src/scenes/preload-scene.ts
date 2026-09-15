import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import {
  createOptionalAssetStatus,
  listOptionalAssetFallbacks,
  OPTIONAL_IMAGE_ASSETS,
  type OptionalAssetStatus,
} from '../data/asset-config';
import { SceneKeys } from '../game/scene-keys';

export class PreloadScene extends Phaser.Scene {
  private readonly handleLoadError = (file: Phaser.Loader.File): void => {
    const asset = Object.values(OPTIONAL_IMAGE_ASSETS).find((candidate) => candidate.key === file.key);
    if (!asset) return;
    const status = this.registry.get('optionalAssetStatus') as OptionalAssetStatus | undefined;
    if (status) status[asset.key] = 'fallback';
  };

  public constructor() {
    super(SceneKeys.PRELOAD);
  }

  public preload(): void {
    this.registry.set('optionalAssetStatus', createOptionalAssetStatus());
    this.load.on('loaderror', this.handleLoadError);
    for (const asset of Object.values(OPTIONAL_IMAGE_ASSETS)) {
      this.load.image(asset.key, asset.url);
    }
  }

  public create(): void {
    const status = this.registry.get('optionalAssetStatus') as OptionalAssetStatus;
    for (const asset of Object.values(OPTIONAL_IMAGE_ASSETS)) {
      status[asset.key] = this.textures.exists(asset.key) ? 'loaded' : 'fallback';
    }
    this.registry.set('optionalAssetStatus', status);
    this.registry.set('optionalAssetFallbacks', listOptionalAssetFallbacks(status));
    this.load.off('loaderror', this.handleLoadError);
    setAppStatus('Main Menu', 'main-menu');
    this.scene.start(SceneKeys.MENU);
  }
}
