import Phaser from 'phaser';

import { setAppStatus } from '../core/dom-status';
import { SessionContext } from '../core/session-context';
import { COLORS, DESIGN_VIEWPORT_HEIGHT, DESIGN_VIEWPORT_WIDTH } from '../game/game-config';
import { SceneKeys } from '../game/scene-keys';
import { PLAYER_START_POSITION, TRAIN_COMBAT_BOUNDS, TRAIN_SECTION_LAYOUT } from '../data/train-config';
import { CameraSystem } from '../systems/camera-system';
import { MovementInput, moveWithinBounds } from '../systems/movement-system';

interface ParallaxLayer {
  objects: Phaser.GameObjects.Rectangle[];
  speed: number;
  segmentWidth: number;
  totalWidth: number;
}

export class GameplayScene extends Phaser.Scene {
  private debugEnabled = false;
  private debugOverlay?: Phaser.GameObjects.Graphics;
  private debugText?: Phaser.GameObjects.Text;
  private pauseShade?: Phaser.GameObjects.Rectangle;
  private pauseText?: Phaser.GameObjects.Text;
  private aimLine?: Phaser.GameObjects.Graphics;
  private aimCrosshair?: Phaser.GameObjects.Graphics;
  private playerMarker?: Phaser.GameObjects.Arc;
  private playerShadow?: Phaser.GameObjects.Rectangle;
  private playerPosition: { x: number; y: number } = { ...PLAYER_START_POSITION };
  private pointerPosition: { x: number; y: number } = { x: PLAYER_START_POSITION.x + 160, y: PLAYER_START_POSITION.y };
  private movementKeys?: Record<'left' | 'right' | 'up' | 'down', Phaser.Input.Keyboard.Key>;
  private readonly parallaxLayers: ParallaxLayer[] = [];
  private readonly onboarding = { moved: false, aimed: false, attacked: false };
  private cameraSystem?: CameraSystem;

  public constructor() {
    super(SceneKeys.GAMEPLAY);
  }

  public create(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run) session?.startNewRun(1);

    setAppStatus('Gameplay Prototype', 'gameplay');
    document.querySelector<HTMLElement>('#app-status')?.setAttribute('data-debug', 'false');
    this.cameraSystem = new CameraSystem(this.cameras.main);

    this.drawPlaceholderWorld();
    this.createPlayerAndAim();
    this.createOnboarding();
    this.createPauseOverlay();
    this.createDebugOverlay();
    this.setupInput();
  }

  public update(_time: number, delta: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session || session.gameState.value !== 'PLAYING') return;

    const deltaSeconds = Math.min(delta / 1000, 0.05);
    const input = this.getMovementInput();
    if (input.left || input.right || input.up || input.down) this.onboarding.moved = true;

    const speed = session.run?.player.movementSpeed ?? 240;
    this.playerPosition = moveWithinBounds(this.playerPosition, input, speed, deltaSeconds, TRAIN_COMBAT_BOUNDS);
    this.updatePlayerAndAim();
    this.updateDiagnostics();
    this.updateParallax(deltaSeconds);
    this.updateOnboarding();
    this.updateDebugOverlay();
  }

  private drawPlaceholderWorld(): void {
    this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, COLORS.world).setOrigin(0);
    this.add.rectangle(0, 120, DESIGN_VIEWPORT_WIDTH, 250, COLORS.worldMid).setOrigin(0);
    this.add.rectangle(0, 760, DESIGN_VIEWPORT_WIDTH, 320, COLORS.worldLight).setOrigin(0);
    this.createParallaxLayer(225, 80, 0x1a3033, 12, 360, 7);
    this.createParallaxLayer(360, 120, 0x27443f, 22, 280, 8);
    this.createParallaxLayer(810, 150, 0x345049, 34, 240, 9);

    this.add.text(96, 72, 'M2 MOVEMENT & CAMERA', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      letterSpacing: 3,
    });
    this.add.text(96, 108, 'WASD MOVE  •  MOUSE AIM  •  LEFT CLICK FIRE (NEXT MILESTONE)', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
    });

    const trackY = 680;
    this.add.rectangle(260, trackY, 1400, 6, 0x4e5b57).setOrigin(0.5);
    this.add.rectangle(260, trackY + 44, 1400, 6, 0x4e5b57).setOrigin(0.5);
    for (let x = 300; x <= 1630; x += 70) {
      this.add.rectangle(x, trackY + 22, 8, 88, 0x364744).setOrigin(0.5);
    }

    for (const section of TRAIN_SECTION_LAYOUT) {
      this.add.rectangle(section.x, section.y, section.width, section.height, section.color).setOrigin(0.5);
      this.add.text(section.x, section.y, section.label, {
        color: COLORS.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    this.add.text(96, 940, 'TRAIN HP  ██████████     PLAYER HP  ██████████     SCRAP  0     JOURNEY  0%', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
    });
    this.add.text(DESIGN_VIEWPORT_WIDTH - 96, 1010, 'ESC  PAUSE     M  MENU', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
    }).setOrigin(1, 0.5);
  }

  private createParallaxLayer(y: number, height: number, color: number, speed: number, segmentWidth: number, count: number): void {
    const objects: Phaser.GameObjects.Rectangle[] = [];
    for (let index = 0; index < count; index += 1) {
      const object = this.add.rectangle(index * segmentWidth + segmentWidth / 2, y, segmentWidth - 8, height, color)
        .setOrigin(0.5)
        .setDepth(-1);
      objects.push(object);
    }
    this.parallaxLayers.push({ objects, speed, segmentWidth, totalWidth: segmentWidth * count });
  }

  private updateParallax(deltaSeconds: number): void {
    for (const layer of this.parallaxLayers) {
      for (const object of layer.objects) {
        object.x -= layer.speed * deltaSeconds;
        if (object.x < -layer.segmentWidth / 2) object.x += layer.totalWidth;
      }
    }
  }

  private createPlayerAndAim(): void {
    this.playerShadow = this.add.rectangle(this.playerPosition.x, this.playerPosition.y + 35, 72, 5, COLORS.trainDark)
      .setOrigin(0.5)
      .setDepth(3);
    this.playerMarker = this.add.circle(this.playerPosition.x, this.playerPosition.y, 24, COLORS.player).setDepth(4);
    this.add.text(this.playerPosition.x, this.playerPosition.y - 55, 'PLAYER', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(4);
    this.aimLine = this.add.graphics().setDepth(2);
    this.aimCrosshair = this.add.graphics().setDepth(5);
    this.updatePlayerAndAim();
  }

  private updatePlayerAndAim(): void {
    this.playerMarker?.setPosition(this.playerPosition.x, this.playerPosition.y);
    this.playerShadow?.setPosition(this.playerPosition.x, this.playerPosition.y + 35);

    this.aimLine?.clear();
    this.aimLine?.lineStyle(2, 0xf3c777, 0.55);
    this.aimLine?.lineBetween(this.playerPosition.x, this.playerPosition.y, this.pointerPosition.x, this.pointerPosition.y);

    this.aimCrosshair?.clear();
    this.aimCrosshair?.lineStyle(2, 0xf3c777, 0.9);
    this.aimCrosshair?.strokeCircle(this.pointerPosition.x, this.pointerPosition.y, 12);
    this.aimCrosshair?.lineBetween(this.pointerPosition.x - 18, this.pointerPosition.y, this.pointerPosition.x + 18, this.pointerPosition.y);
    this.aimCrosshair?.lineBetween(this.pointerPosition.x, this.pointerPosition.y - 18, this.pointerPosition.x, this.pointerPosition.y + 18);
  }

  private createOnboarding(): void {
    this.add.text(1400, 105, 'ONBOARDING', {
      color: '#d6a65f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
      letterSpacing: 2,
    }).setOrigin(0.5).setName('onboarding-title');
    this.add.text(1400, 140, '', {
      color: COLORS.text,
      backgroundColor: '#11191d',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      padding: { x: 10, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setName('onboarding-copy');
    this.updateOnboarding();
  }

  private updateOnboarding(): void {
    const copy = this.children.getByName('onboarding-copy') as Phaser.GameObjects.Text | null;
    if (!copy) return;
    const prompts: string[] = [];
    if (!this.onboarding.moved) prompts.push('WASD  MOVE');
    if (!this.onboarding.aimed) prompts.push('MOUSE  AIM');
    if (!this.onboarding.attacked) prompts.push('LEFT CLICK  FIRE');
    copy.setText(prompts.join('\n'));
    copy.setVisible(prompts.length > 0);
  }

  private createPauseOverlay(): void {
    this.pauseShade = this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, 0x071018, 0.72)
      .setOrigin(0)
      .setDepth(20)
      .setVisible(false);
    this.pauseText = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, DESIGN_VIEWPORT_HEIGHT / 2, 'PAUSED\n\nESC  RESUME     M  MENU', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '32px',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5).setDepth(21).setVisible(false);
  }

  private createDebugOverlay(): void {
    this.debugOverlay = this.add.graphics().setDepth(10).setVisible(false);
    this.debugText = this.add.text(96, 300, '', {
      color: '#f3c777',
      backgroundColor: '#11191d',
      fontFamily: 'monospace',
      fontSize: '16px',
      padding: { x: 8, y: 6 },
    }).setDepth(11).setVisible(false);
  }

  private updateDebugOverlay(): void {
    if (!this.debugEnabled || !this.debugOverlay || !this.debugText) return;
    this.debugOverlay.clear();
    this.debugOverlay.lineStyle(2, 0xf3c777, 0.8);
    this.debugOverlay.strokeRect(
      TRAIN_COMBAT_BOUNDS.left,
      TRAIN_COMBAT_BOUNDS.top,
      TRAIN_COMBAT_BOUNDS.right - TRAIN_COMBAT_BOUNDS.left,
      TRAIN_COMBAT_BOUNDS.bottom - TRAIN_COMBAT_BOUNDS.top,
    );
    this.debugOverlay.strokeCircle(this.playerPosition.x, this.playerPosition.y, 30);
    this.debugOverlay.lineBetween(this.playerPosition.x, this.playerPosition.y, this.pointerPosition.x, this.pointerPosition.y);

    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    this.debugText.setText([
      `STATE: ${session?.gameState.value ?? 'UNKNOWN'}`,
      `PLAYER: placeholder-player @ (${Math.round(this.playerPosition.x)}, ${Math.round(this.playerPosition.y)})`,
      `BOUNDS: (${TRAIN_COMBAT_BOUNDS.left}, ${TRAIN_COMBAT_BOUNDS.top}) → (${TRAIN_COMBAT_BOUNDS.right}, ${TRAIN_COMBAT_BOUNDS.bottom})`,
      `RUN: ${run ? `${run.routePhase} / ${run.progress}% / seed ${run.seed}` : 'none'}`,
      'F3: toggle debug overlay',
    ]);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.movementKeys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerPosition = { x: pointer.worldX, y: pointer.worldY };
      this.onboarding.aimed = true;
      this.updateDiagnostics();
    });
    this.input.on('pointerdown', () => {
      this.onboarding.attacked = true;
    });
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-M', () => this.returnToMenu());
    this.input.keyboard.on('keydown-F3', () => {
      this.debugEnabled = !this.debugEnabled;
      document.querySelector<HTMLElement>('#app-status')?.setAttribute('data-debug', String(this.debugEnabled));
      this.debugOverlay?.setVisible(this.debugEnabled);
      this.debugText?.setVisible(this.debugEnabled);
      this.updateDebugOverlay();
    });
  }

  private getMovementInput(): MovementInput {
    const keys = this.movementKeys;
    return {
      left: Boolean(keys?.left.isDown),
      right: Boolean(keys?.right.isDown),
      up: Boolean(keys?.up.isDown),
      down: Boolean(keys?.down.isDown),
    };
  }

  private updateDiagnostics(): void {
    const status = document.querySelector<HTMLElement>('#app-status');
    if (!status) return;

    status.dataset.playerX = String(Math.round(this.playerPosition.x));
    status.dataset.playerY = String(Math.round(this.playerPosition.y));
    status.dataset.aimX = String(Math.round(this.pointerPosition.x));
    status.dataset.aimY = String(Math.round(this.pointerPosition.y));
    status.dataset.aimed = String(this.onboarding.aimed);
  }

  private togglePause(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session) return;

    if (session.gameState.value === 'PLAYING') {
      session.gameState.transition('PAUSED');
      setAppStatus('Paused', 'gameplay');
      this.pauseShade?.setVisible(true);
      this.pauseText?.setVisible(true);
    } else if (session.gameState.value === 'PAUSED') {
      session.gameState.transition('PLAYING');
      setAppStatus('Gameplay Prototype', 'gameplay');
      this.pauseShade?.setVisible(false);
      this.pauseText?.setVisible(false);
    }
  }

  private returnToMenu(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session || (session.gameState.value !== 'PLAYING' && session.gameState.value !== 'PAUSED')) return;
    session.discardRun();
    this.scene.start(SceneKeys.MENU);
  }
}
