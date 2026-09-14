import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import { SessionContext } from '../core/session-context';
import { COLORS, DESIGN_VIEWPORT_HEIGHT, DESIGN_VIEWPORT_WIDTH } from '../game/game-config';
import { SceneKeys } from '../game/scene-keys';

export class MenuScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.MENU);
  }

  public create(): void {
    setAppStatus('Main Menu', 'main-menu');
    this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, COLORS.world).setOrigin(0);
    this.add.rectangle(0, 650, DESIGN_VIEWPORT_WIDTH, 430, COLORS.worldMid).setOrigin(0);

    this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 290, 'LINTAS MALAM', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
      letterSpacing: 10,
    }).setOrigin(0.5);

    this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 385, 'KEEP THE TRAIN MOVING', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      letterSpacing: 4,
    }).setOrigin(0.5);

    const playButton = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 560, '[ PLAY ]', {
      color: '#d6a65f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerover', () => playButton.setColor('#f3c777'));
    playButton.on('pointerout', () => playButton.setColor('#d6a65f'));
    playButton.on('pointerdown', () => this.startRun());

    this.input.keyboard?.on('keydown-ENTER', () => this.startRun());

    this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 875, 'M1 PROTOTYPE SHELL — PLACEHOLDER VISUALS', {
      color: '#65746f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private startRun(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    session?.startNewRun(1);
    this.scene.start(SceneKeys.GAMEPLAY);
  }
}
