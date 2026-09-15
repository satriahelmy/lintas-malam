import { describe, expect, it } from 'vitest';

import {
  createOptionalAssetStatus,
  formatOptionalAssetStatus,
  listOptionalAssetFallbacks,
  OPTIONAL_IMAGE_ASSETS,
} from '../../src/data/asset-config';

describe('M15.11 optional asset contract', () => {
  it('starts every optional asset in the safe fallback state', () => {
    const status = createOptionalAssetStatus();

    expect(Object.keys(status)).toHaveLength(Object.keys(OPTIONAL_IMAGE_ASSETS).length);
    expect(listOptionalAssetFallbacks(status)).toHaveLength(Object.keys(OPTIONAL_IMAGE_ASSETS).length);
  });

  it('tracks one rejected asset without changing unrelated asset states', () => {
    const status = createOptionalAssetStatus();
    status[OPTIONAL_IMAGE_ASSETS.enemyMist.key] = 'fallback';
    status[OPTIONAL_IMAGE_ASSETS.enemyShadow.key] = 'loaded';
    status[OPTIONAL_IMAGE_ASSETS.trainLocomotive.key] = 'loaded';

    expect(listOptionalAssetFallbacks(status)).toContain(OPTIONAL_IMAGE_ASSETS.enemyMist.key);
    expect(status[OPTIONAL_IMAGE_ASSETS.enemyShadow.key]).toBe('loaded');
    expect(status[OPTIONAL_IMAGE_ASSETS.trainLocomotive.key]).toBe('loaded');
  });

  it('formats a deterministic diagnostic string in catalog order', () => {
    const status = createOptionalAssetStatus();
    status[OPTIONAL_IMAGE_ASSETS.playerIdle.key] = 'loaded';

    expect(formatOptionalAssetStatus(status).split(',')[0]).toBe('art-player-idle:loaded');
    expect(formatOptionalAssetStatus(status)).toContain('art-train-defense:fallback');
  });
});
