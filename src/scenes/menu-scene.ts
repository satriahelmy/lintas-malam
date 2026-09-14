import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import { SessionContext } from '../core/session-context';
import { COLORS, DESIGN_VIEWPORT_HEIGHT, DESIGN_VIEWPORT_WIDTH } from '../game/game-config';
import { SceneKeys } from '../game/scene-keys';
import { createUiIcon as createFunctionalUiIcon, type UiIconKind, type UiIconOptions } from '../ui/ui-icons';

export class MenuScene extends Phaser.Scene {
  private activePanel?: 'SETTINGS' | 'CREDITS';
  private panelShade?: Phaser.GameObjects.Rectangle;
  private panel?: Phaser.GameObjects.Rectangle;
  private panelTitle?: Phaser.GameObjects.Text;
  private panelCopy?: Phaser.GameObjects.Text;
  private settingsShake?: Phaser.GameObjects.Text;
  private settingsVolume?: Phaser.GameObjects.Text;
  private settingsVolumeDown?: Phaser.GameObjects.Text;
  private settingsVolumeUp?: Phaser.GameObjects.Text;
  private panelClose?: Phaser.GameObjects.Text;
  private playIcon?: Phaser.GameObjects.Graphics;
  private settingsIcon?: Phaser.GameObjects.Graphics;
  private creditsIcon?: Phaser.GameObjects.Graphics;
  private settingsPanelIcon?: Phaser.GameObjects.Graphics;
  private creditsPanelIcon?: Phaser.GameObjects.Graphics;
  private volumeDownIcon?: Phaser.GameObjects.Graphics;
  private volumeUpIcon?: Phaser.GameObjects.Graphics;
  private readonly uiIcons: Phaser.GameObjects.Graphics[] = [];

  private readonly handleEnter = (): void => {
    if (this.activePanel) {
      this.closePanel();
      return;
    }
    this.startRun();
  };

  private readonly handleEscape = (): void => {
    if (this.activePanel) this.closePanel();
  };

  private readonly handleSettings = (): void => {
    if (!this.activePanel) this.openPanel('SETTINGS');
  };

  private readonly handleCredits = (): void => {
    if (!this.activePanel) this.openPanel('CREDITS');
  };

  private readonly handleShutdown = (): void => {
    this.input.keyboard?.off('keydown-ENTER', this.handleEnter);
    this.input.keyboard?.off('keydown-ESC', this.handleEscape);
    this.input.keyboard?.off('keydown-S', this.handleSettings);
    this.input.keyboard?.off('keydown-C', this.handleCredits);
  };

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
    this.playIcon = this.addUiIcon('PLAY', 835, 560, { color: 0xf3c777, depth: 1 });

    const settingsButton = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 640, '[ SETTINGS ]', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      letterSpacing: 3,
    }).setOrigin(0.5);
    settingsButton.setInteractive({ useHandCursor: true });
    settingsButton.on('pointerover', () => settingsButton.setColor(COLORS.text));
    settingsButton.on('pointerout', () => settingsButton.setColor(COLORS.mutedText));
    settingsButton.on('pointerdown', this.handleSettings);
    this.settingsIcon = this.addUiIcon('SETTINGS', 835, 640, { color: 0x9ca6a0, depth: 1 });

    const creditsButton = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 700, '[ CREDITS ]', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      letterSpacing: 3,
    }).setOrigin(0.5);
    creditsButton.setInteractive({ useHandCursor: true });
    creditsButton.on('pointerover', () => creditsButton.setColor(COLORS.text));
    creditsButton.on('pointerout', () => creditsButton.setColor(COLORS.mutedText));
    creditsButton.on('pointerdown', this.handleCredits);
    this.creditsIcon = this.addUiIcon('CREDITS', 835, 700, { color: 0x9ca6a0, depth: 1 });

    this.createPanel();
    this.updateSettingsStatus();
    this.updatePanel();

    this.input.keyboard?.on('keydown-ENTER', this.handleEnter);
    this.input.keyboard?.on('keydown-ESC', this.handleEscape);
    this.input.keyboard?.on('keydown-S', this.handleSettings);
    this.input.keyboard?.on('keydown-C', this.handleCredits);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);

    this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 875, 'DESKTOP BROWSER BUILD — PLACEHOLDER VISUALS', {
      color: '#65746f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private addUiIcon(kind: UiIconKind, x: number, y: number, options: UiIconOptions = {}): Phaser.GameObjects.Graphics {
    const icon = createFunctionalUiIcon(this, kind, x, y, options);
    this.uiIcons.push(icon);
    return icon;
  }

  private startRun(): void {
    if (this.activePanel) {
      this.closePanel();
      return;
    }
    const session = this.registry.get('session') as SessionContext | undefined;
    session?.startNewRun(1);
    this.scene.start(SceneKeys.GAMEPLAY);
  }

  private createPanel(): void {
    this.panelShade = this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, 0x020507)
      .setOrigin(0)
      .setAlpha(0.88)
      .setDepth(10);
    this.panel = this.add.rectangle(DESIGN_VIEWPORT_WIDTH / 2, 540, 720, 460, COLORS.world)
      .setStrokeStyle(3, COLORS.trainLight, 0.9)
      .setDepth(11);
    this.panelTitle = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 365, '', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(11);
    this.settingsPanelIcon = this.addUiIcon('SETTINGS', 820, 365, { color: 0xeee8d5, depth: 12 }).setVisible(false);
    this.creditsPanelIcon = this.addUiIcon('CREDITS', 820, 365, { color: 0xeee8d5, depth: 12 }).setVisible(false);
    this.panelCopy = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 430, '', {
      color: COLORS.mutedText,
      fontFamily: 'monospace',
      fontSize: '16px',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 600 },
    }).setOrigin(0.5, 0).setDepth(11);

    this.settingsShake = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 535, '', {
      color: COLORS.text,
      fontFamily: 'monospace',
      fontSize: '18px',
      align: 'center',
    }).setOrigin(0.5).setDepth(11);
    this.settingsShake.setInteractive({ useHandCursor: true });
    this.settingsShake.on('pointerdown', () => this.toggleScreenShake());

    this.settingsVolume = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 600, '', {
      color: COLORS.text,
      fontFamily: 'monospace',
      fontSize: '18px',
      align: 'center',
    }).setOrigin(0.5).setDepth(11);
    this.settingsVolumeDown = this.add.text(DESIGN_VIEWPORT_WIDTH / 2 - 160, 600, '', {
      color: '#d6a65f',
      fontFamily: 'monospace',
      fontSize: '22px',
    }).setOrigin(0.5).setDepth(11);
    this.settingsVolumeDown.setInteractive({ useHandCursor: true });
    this.settingsVolumeDown.on('pointerdown', () => this.adjustVolume(-0.1));
    this.settingsVolumeUp = this.add.text(DESIGN_VIEWPORT_WIDTH / 2 + 160, 600, '', {
      color: '#d6a65f',
      fontFamily: 'monospace',
      fontSize: '22px',
    }).setOrigin(0.5).setDepth(11);
    this.settingsVolumeUp.setInteractive({ useHandCursor: true });
    this.settingsVolumeUp.on('pointerdown', () => this.adjustVolume(0.1));
    this.volumeDownIcon = this.addUiIcon('MINUS', DESIGN_VIEWPORT_WIDTH / 2 - 160, 600, {
      color: 0xeee8d5,
      accentColor: 0xf3c777,
      depth: 12,
    });
    this.volumeDownIcon.setInteractive({ useHandCursor: true });
    this.volumeDownIcon.on('pointerdown', () => this.adjustVolume(-0.1));
    this.volumeUpIcon = this.addUiIcon('PLUS', DESIGN_VIEWPORT_WIDTH / 2 + 160, 600, {
      color: 0xeee8d5,
      accentColor: 0xf3c777,
      depth: 12,
    });
    this.volumeUpIcon.setInteractive({ useHandCursor: true });
    this.volumeUpIcon.on('pointerdown', () => this.adjustVolume(0.1));

    this.panelClose = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 715, '[ BACK ]', {
      color: '#d6a65f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(11);
    this.panelClose.setInteractive({ useHandCursor: true });
    this.panelClose.on('pointerdown', () => this.closePanel());
  }

  private openPanel(panel: 'SETTINGS' | 'CREDITS'): void {
    this.activePanel = panel;
    setAppStatus(panel === 'SETTINGS' ? 'Settings' : 'Credits', 'main-menu');
    this.updatePanel();
  }

  private closePanel(): void {
    this.activePanel = undefined;
    setAppStatus('Main Menu', 'main-menu');
    this.updatePanel();
  }

  private updatePanel(): void {
    const visible = Boolean(this.activePanel);
    this.panelShade?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.panelTitle?.setVisible(visible).setText(this.activePanel ?? '');
    this.settingsPanelIcon?.setVisible(this.activePanel === 'SETTINGS');
    this.creditsPanelIcon?.setVisible(this.activePanel === 'CREDITS');
    this.panelCopy?.setVisible(visible).setText(this.activePanel === 'CREDITS'
      ? 'LINTAS MALAM V1\nA desktop browser survival journey by the night train team.\n\nPlaceholder credits — final contributors and asset credits will be added before release.'
      : 'SESSION SETTINGS\nThese controls apply to this browser session only.');
    const settingsVisible = this.activePanel === 'SETTINGS';
    this.settingsShake?.setVisible(settingsVisible);
    this.settingsVolume?.setVisible(settingsVisible);
    this.settingsVolumeDown?.setVisible(settingsVisible);
    this.settingsVolumeUp?.setVisible(settingsVisible);
    this.volumeDownIcon?.setVisible(settingsVisible);
    this.volumeUpIcon?.setVisible(settingsVisible);
    this.panelClose?.setVisible(visible);
    if (settingsVisible) this.updateSettingsPanel();
  }

  private updateSettingsPanel(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const settings = session?.settings;
    if (!settings) return;
    this.settingsShake?.setText(`SCREEN SHAKE  ${settings.screenShakeEnabled ? 'ON' : 'REDUCED'}\n(click to toggle)`);
    this.settingsVolume?.setText(`AUDIO VOLUME  ${Math.round(settings.audioVolume * 100)}%\n(session only)`);
    this.updateSettingsStatus();
  }

  private updateSettingsStatus(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const status = document.querySelector<HTMLElement>('#app-status');
    if (!status || !session) return;
    status.dataset.uiIcons = String(this.uiIcons.length);
    status.dataset.uiIconStyle = 'railway-code-native';
    status.dataset.screenShake = String(session.settings.screenShakeEnabled);
    status.dataset.audioVolume = String(Math.round(session.settings.audioVolume * 100));
  }

  private toggleScreenShake(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session) return;
    session.settings.screenShakeEnabled = !session.settings.screenShakeEnabled;
    this.updateSettingsPanel();
  }

  private adjustVolume(amount: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session) return;
    session.settings.audioVolume = Math.max(0, Math.min(1, Math.round((session.settings.audioVolume + amount) * 10) / 10));
    this.updateSettingsPanel();
  }
}
