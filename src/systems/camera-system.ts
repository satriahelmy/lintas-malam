import Phaser from 'phaser';

export class CameraSystem {
  private shakeEnabled = true;

  public constructor(private readonly camera: Phaser.Cameras.Scene2D.Camera) {}

  public setShakeEnabled(enabled: boolean): void {
    this.shakeEnabled = enabled;
  }

  public triggerShake(durationMs = 120, intensity = 0.002): void {
    if (this.shakeEnabled) this.camera.shake(durationMs, intensity);
  }
}
