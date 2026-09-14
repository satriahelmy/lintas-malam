import Phaser from 'phaser';

import { GameEventBus } from '../core/events';
import { setAppStatus } from '../core/dom-status';
import type { TrainSectionId } from '../core/run-state';
import { SessionContext } from '../core/session-context';
import { COLORS, DESIGN_VIEWPORT_HEIGHT, DESIGN_VIEWPORT_WIDTH } from '../game/game-config';
import { SceneKeys } from '../game/scene-keys';
import { ENEMY_SPAWN_INTERVAL_MS, ENEMY_SPAWN_SIDES } from '../data/enemy-config';
import { BASE_WEAPON } from '../data/player-config';
import { PLAYER_START_POSITION, TRAIN_COMBAT_BOUNDS, TRAIN_SECTION_LAYOUT } from '../data/train-config';
import type { CombatTarget, ProjectileHitEvent, ProjectileState } from '../entities/combat/combat-types';
import { EnemySystem } from '../entities/enemy/enemy-system';
import type { EnemyArchetype, EnemyState, EnemySystemEvent, EnemyTargetContext } from '../entities/enemy/enemy-types';
import type { UpgradeDefinition } from '../entities/upgrade/upgrade-types';
import type { StationDefinition, StationId, StationRepairQuote } from '../entities/station/station-types';
import { getTrainCondition, TrainSystem } from '../entities/train/train-system';
import type { TrainCondition } from '../entities/train/train-types';
import type { ScrapPickup, ScrapSystemEvent } from '../entities/pickup/pickup-types';
import { CameraSystem } from '../systems/camera-system';
import { applyPlayerDamage, CombatSystem } from '../systems/combat-system';
import { MovementInput, moveWithinBounds } from '../systems/movement-system';
import { ScrapSystem } from '../systems/scrap-system';
import { DefenseTurretSystem } from '../systems/defense-turret-system';
import { UpgradeOfferDirector, UpgradeSystem } from '../systems/upgrade-system';
import { StationSystem } from '../systems/station-system';

interface ParallaxLayer {
  objects: Phaser.GameObjects.Rectangle[];
  speed: number;
  segmentWidth: number;
  totalWidth: number;
}

interface TrainSectionView {
  sectionId: TrainSectionId;
  body: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  conditionText: Phaser.GameObjects.Text;
}

interface ProjectileView {
  sprite: Phaser.GameObjects.Arc;
}

interface EnemyView {
  shape: Phaser.GameObjects.Shape;
  label: Phaser.GameObjects.Text;
}

interface ScrapPickupView {
  shape: Phaser.GameObjects.Shape;
}

interface UpgradeCardView {
  panel: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  description: Phaser.GameObjects.Text;
  level: Phaser.GameObjects.Text;
}

interface StationSectionView {
  sectionId: TrainSectionId;
  panel: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  action: Phaser.GameObjects.Text;
}

const CONDITION_COLORS: Record<TrainCondition, number> = {
  HEALTHY: 0x6f9d76,
  DAMAGED: 0xd6a65f,
  CRITICAL: 0xc36a4e,
  DESTROYED: 0x4c4b4b,
};

const CONDITION_TEXT_COLORS: Record<TrainCondition, string> = {
  HEALTHY: '#b7d1b4',
  DAMAGED: '#f3c777',
  CRITICAL: '#f18b6f',
  DESTROYED: '#9b9b9b',
};

const ENEMY_COLORS: Record<EnemyArchetype, number> = {
  MIST: 0xb7b7ad,
  SHADOW: 0x77777c,
  KEEPER: 0x404047,
};

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
  private playerLabel?: Phaser.GameObjects.Text;
  private playerHpText?: Phaser.GameObjects.Text;
  private targetMarker?: Phaser.GameObjects.Arc;
  private targetHpText?: Phaser.GameObjects.Text;
  private scrapHudText?: Phaser.GameObjects.Text;
  private upgradeShade?: Phaser.GameObjects.Rectangle;
  private upgradeTitle?: Phaser.GameObjects.Text;
  private stationShade?: Phaser.GameObjects.Rectangle;
  private stationTitle?: Phaser.GameObjects.Text;
  private stationInfo?: Phaser.GameObjects.Text;
  private stationMessage?: Phaser.GameObjects.Text;
  private stationUpgradeButton?: Phaser.GameObjects.Text;
  private stationRescueButton?: Phaser.GameObjects.Text;
  private stationDepartButton?: Phaser.GameObjects.Text;
  private playerPosition: { x: number; y: number } = { ...PLAYER_START_POSITION };
  private pointerPosition: { x: number; y: number } = { x: PLAYER_START_POSITION.x + 160, y: PLAYER_START_POSITION.y };
  private readonly combatTargets: CombatTarget[] = [];
  private readonly projectileViews = new Map<number, ProjectileView>();
  private readonly enemyViews = new Map<string, EnemyView>();
  private readonly scrapViews = new Map<string, ScrapPickupView>();
  private readonly upgradeCards: UpgradeCardView[] = [];
  private readonly stationSectionViews: StationSectionView[] = [];
  private combatSystem?: CombatSystem;
  private enemySystem?: EnemySystem;
  private scrapSystem?: ScrapSystem;
  private upgradeSystem?: UpgradeSystem;
  private upgradeOfferDirector?: UpgradeOfferDirector;
  private defenseTurretSystem?: DefenseTurretSystem;
  private stationSystem?: StationSystem;
  private activeUpgradeOffer: readonly UpgradeDefinition[] = [];
  private activeStation?: StationDefinition;
  private stationSelectedSection: TrainSectionId = 'DEFENSE';
  private stationUpgradeMode = false;
  private playerInvulnerableUntilMs = 0;
  private elapsedMs = 0;
  private enemySpawnElapsedMs = 0;
  private enemySpawnSideIndex = 0;
  private movementKeys?: Record<'left' | 'right' | 'up' | 'down', Phaser.Input.Keyboard.Key>;
  private readonly parallaxLayers: ParallaxLayer[] = [];
  private readonly trainViews: TrainSectionView[] = [];
  private readonly onboarding = { moved: false, aimed: false, attacked: false };
  private cameraSystem?: CameraSystem;
  private trainSystem?: TrainSystem;
  private eventBus?: GameEventBus;

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    this.pointerPosition = { x: pointer.worldX, y: pointer.worldY };
    this.onboarding.aimed = true;
    this.updateDiagnostics();
  };

  private readonly handlePointerDown = (): void => {
    this.onboarding.attacked = true;
    this.fireWeapon();
  };

  private readonly handleEscape = (): void => {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (session?.gameState.value === 'UPGRADE' || (session?.gameState.value === 'STATION' && this.stationUpgradeMode)) {
      this.dismissUpgradeOffer();
      return;
    }
    this.togglePause();
  };

  private readonly handleMenuKey = (): void => {
    this.returnToMenu();
  };

  private readonly handleDebugKey = (): void => {
    this.debugEnabled = !this.debugEnabled;
    document.querySelector<HTMLElement>('#app-status')?.setAttribute('data-debug', String(this.debugEnabled));
    this.debugOverlay?.setVisible(this.debugEnabled);
    this.debugText?.setVisible(this.debugEnabled);
    this.updateDebugOverlay();
  };

  private readonly handleDebugDefenseDamage = (): void => {
    if (this.stationUpgradeMode && this.isStationOpen()) {
      this.selectUpgrade(0);
      return;
    }
    if (this.isStationOpen()) {
      this.selectStationSection('DEFENSE');
      return;
    }
    if (this.isUpgradeOpen()) {
      this.selectUpgrade(0);
      return;
    }
    this.damageDebugSection('DEFENSE');
  };

  private readonly handleDebugWorkshopDamage = (): void => {
    if (this.stationUpgradeMode && this.isStationOpen()) {
      this.selectUpgrade(1);
      return;
    }
    if (this.isStationOpen()) {
      this.selectStationSection('WORKSHOP');
      return;
    }
    if (this.isUpgradeOpen()) {
      this.selectUpgrade(1);
      return;
    }
    this.damageDebugSection('WORKSHOP');
  };

  private readonly handleDebugPassengerDamage = (): void => {
    if (this.stationUpgradeMode && this.isStationOpen()) {
      this.selectUpgrade(2);
      return;
    }
    if (this.isStationOpen()) {
      this.selectStationSection('PASSENGER');
      return;
    }
    if (this.isUpgradeOpen()) {
      this.selectUpgrade(2);
      return;
    }
    this.damageDebugSection('PASSENGER');
  };

  private readonly handleDebugLocomotiveDamage = (): void => {
    if (this.stationUpgradeMode && this.isStationOpen()) return;
    if (this.isStationOpen()) {
      this.selectStationSection('LOCOMOTIVE');
      return;
    }
    this.damageDebugSection('LOCOMOTIVE');
  };

  private readonly handleDebugPlayerDamage = (): void => {
    if (!this.debugEnabled) return;
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run) return;
    this.applyDamageToPlayer(10);
  };

  private readonly handleDebugResetTarget = (): void => {
    if (this.stationUpgradeMode && this.isStationOpen()) return;
    if (this.isStationOpen()) {
      this.repairSelectedStationSection();
      return;
    }
    if (!this.debugEnabled) return;
    const target = this.combatTargets[0];
    if (!target) return;
    target.health = target.maxHealth;
    target.active = true;
    this.updateCombatTargetView();
    this.updateDiagnostics();
  };

  private readonly handleDebugMistSpawn = (): void => {
    this.spawnDebugEnemy('MIST');
  };

  private readonly handleDebugShadowSpawn = (): void => {
    this.spawnDebugEnemy('SHADOW');
  };

  private readonly handleDebugKeeperSpawn = (): void => {
    this.spawnDebugEnemy('KEEPER');
  };

  private readonly handleDebugScrapSpawn = (): void => {
    if (!this.debugEnabled || !this.scrapSystem) return;
    this.scrapSystem.spawnRewardPickup(5, { x: this.playerPosition.x + 90, y: this.playerPosition.y }, this.elapsedMs, 'ENCOUNTER_REWARD');
    this.updateScrapViews();
    this.updateDiagnostics();
  };

  private readonly handleDebugStationOpen = (): void => {
    if (!this.debugEnabled || !this.stationSystem) return;
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!run || session.gameState.value !== 'PLAYING') return;
    const stationId: StationId = run.stationIds.includes('WANASARI') ? 'CIBIRU' : 'WANASARI';
    this.openStation(stationId);
  };

  private readonly handleDebugUpgradeOffer = (): void => {
    if (!this.debugEnabled) return;
    if (this.isStationOpen()) {
      this.openStationUpgradeOffer();
      return;
    }
    this.openUpgradeOffer();
  };

  private readonly handleStationUpgrade = (): void => {
    this.openStationUpgradeOffer();
  };

  private readonly handleStationRescue = (): void => {
    this.rescueStationSurvivor();
  };

  private readonly handleStationDepart = (): void => {
    this.departStation();
  };

  private readonly handleShutdown = (): void => {
    this.input.off('pointermove', this.handlePointerMove);
    this.input.off('pointerdown', this.handlePointerDown);
    this.input.keyboard?.off('keydown-ESC', this.handleEscape);
    this.input.keyboard?.off('keydown-M', this.handleMenuKey);
    this.input.keyboard?.off('keydown-F3', this.handleDebugKey);
    this.input.keyboard?.off('keydown-ONE', this.handleDebugDefenseDamage);
    this.input.keyboard?.off('keydown-TWO', this.handleDebugWorkshopDamage);
    this.input.keyboard?.off('keydown-THREE', this.handleDebugPassengerDamage);
    this.input.keyboard?.off('keydown-FOUR', this.handleDebugLocomotiveDamage);
    this.input.keyboard?.off('keydown-Q', this.handleDebugPlayerDamage);
    this.input.keyboard?.off('keydown-R', this.handleDebugResetTarget);
    this.input.keyboard?.off('keydown-FIVE', this.handleDebugMistSpawn);
    this.input.keyboard?.off('keydown-SIX', this.handleDebugShadowSpawn);
    this.input.keyboard?.off('keydown-SEVEN', this.handleDebugKeeperSpawn);
    this.input.keyboard?.off('keydown-EIGHT', this.handleDebugScrapSpawn);
    this.input.keyboard?.off('keydown-NINE', this.handleDebugUpgradeOffer);
    this.input.keyboard?.off('keydown-ZERO', this.handleDebugStationOpen);
    this.input.keyboard?.off('keydown-U', this.handleStationUpgrade);
    this.input.keyboard?.off('keydown-N', this.handleStationRescue);
    this.input.keyboard?.off('keydown-ENTER', this.handleStationDepart);
  };

  public constructor() {
    super(SceneKeys.GAMEPLAY);
  }

  public init(): void {
    this.debugEnabled = false;
    this.playerPosition = { ...PLAYER_START_POSITION };
    this.pointerPosition = { x: PLAYER_START_POSITION.x + 160, y: PLAYER_START_POSITION.y };
    this.playerInvulnerableUntilMs = 0;
    this.elapsedMs = 0;
    this.combatSystem = undefined;
    this.enemySystem = undefined;
    this.scrapSystem = undefined;
    this.upgradeSystem = undefined;
    this.upgradeOfferDirector = undefined;
    this.defenseTurretSystem = undefined;
    this.stationSystem = undefined;
    this.combatTargets.length = 0;
    this.projectileViews.clear();
    this.enemyViews.clear();
    this.scrapViews.clear();
    this.upgradeCards.length = 0;
    this.stationSectionViews.length = 0;
    this.scrapHudText = undefined;
    this.enemySpawnElapsedMs = 0;
    this.enemySpawnSideIndex = 0;
    this.activeUpgradeOffer = [];
    this.activeStation = undefined;
    this.stationSelectedSection = 'DEFENSE';
    this.stationUpgradeMode = false;
    this.movementKeys = undefined;
    this.cameraSystem = undefined;
    this.trainSystem = undefined;
    this.eventBus = undefined;
    this.parallaxLayers.length = 0;
    this.trainViews.length = 0;
    this.onboarding.moved = false;
    this.onboarding.aimed = false;
    this.onboarding.attacked = false;
  }

  public create(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run) session?.startNewRun(1);

    setAppStatus('Gameplay Prototype', 'gameplay');
    document.querySelector<HTMLElement>('#app-status')?.setAttribute('data-debug', 'false');
    document.querySelector<HTMLElement>('#app-status')?.setAttribute('data-survivor-hook', 'false');
    this.cameraSystem = new CameraSystem(this.cameras.main);
    this.cameraSystem.setShakeEnabled(true);
    this.combatSystem = new CombatSystem();
    this.enemySystem = new EnemySystem();
    this.upgradeSystem = new UpgradeSystem();
    this.upgradeOfferDirector = new UpgradeOfferDirector();
    this.defenseTurretSystem = new DefenseTurretSystem();
    this.stationSystem = new StationSystem();
    if (session?.run) {
      this.scrapSystem = new ScrapSystem(session.run);
      this.eventBus = new GameEventBus();
      this.trainSystem = new TrainSystem(session.run, this.eventBus);
      this.eventBus.on('locomotive-failed', () => setAppStatus('Locomotive Failed — M3 Debug', 'gameplay'));
    }
    this.spawnEnemy('MIST', 'UPPER');

    this.drawPlaceholderWorld();
    this.createPlayerAndAim();
    this.createCombatTarget();
    this.createOnboarding();
    this.createPauseOverlay();
    this.createUpgradeOverlay();
    this.createStationOverlay();
    this.createDebugOverlay();
    this.setupInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
  }

  public update(_time: number, delta: number): void {
    this.updateTrainViews();
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session || session.gameState.value !== 'PLAYING') return;

    const deltaSeconds = Math.min(delta / 1000, 0.05);
    this.elapsedMs += delta;
    this.updateRunProgress(deltaSeconds);
    const input = this.getMovementInput();
    if (input.left || input.right || input.up || input.down) this.onboarding.moved = true;

    const speed = session.run?.player.movementSpeed ?? 240;
    this.playerPosition = moveWithinBounds(this.playerPosition, input, speed, deltaSeconds, TRAIN_COMBAT_BOUNDS);
    this.updatePlayerAndAim();
    this.updateDiagnostics();
    this.updateEnemies(deltaSeconds);
    this.updateDefenseTurret(deltaSeconds);
    this.updateCombat(deltaSeconds);
    this.updateScrap(deltaSeconds);
    this.updateParallax(deltaSeconds);
    this.updateOnboarding();
    this.maybeOpenStation();
    this.maybeOpenUpgradeOffer();
    this.updateDebugOverlay();
  }

  private drawPlaceholderWorld(): void {
    this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, COLORS.world).setOrigin(0);
    this.add.rectangle(0, 120, DESIGN_VIEWPORT_WIDTH, 250, COLORS.worldMid).setOrigin(0);
    this.add.rectangle(0, 760, DESIGN_VIEWPORT_WIDTH, 320, COLORS.worldLight).setOrigin(0);
    this.createParallaxLayer(225, 80, 0x1a3033, 12, 360, 7);
    this.createParallaxLayer(360, 120, 0x27443f, 22, 280, 8);
    this.createParallaxLayer(810, 150, 0x345049, 34, 240, 9);

    this.add.text(96, 72, 'M5 ENEMY SYSTEM', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      letterSpacing: 3,
    });
    this.add.text(96, 108, 'WASD MOVE  •  MOUSE AIM  •  LEFT CLICK FIRE  •  F3 DEBUG', {
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
      const body = this.add.rectangle(section.x, section.y, section.width, section.height, section.color).setOrigin(0.5);
      const barWidth = section.width - 20;
      this.add.rectangle(section.x, section.y + 44, barWidth, 10, 0x253033).setOrigin(0.5);
      const hpFill = this.add.rectangle(section.x - barWidth / 2, section.y + 44, barWidth, 10, CONDITION_COLORS.HEALTHY).setOrigin(0, 0.5);
      this.add.text(section.x, section.y - 18, section.label, {
        color: COLORS.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      const conditionText = this.add.text(section.x, section.y + 20, '', {
        color: CONDITION_TEXT_COLORS.HEALTHY,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '14px',
      }).setOrigin(0.5);
      this.trainViews.push({ sectionId: section.id, body, hpFill, conditionText });
    }

    this.scrapHudText = this.add.text(96, 940, '', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
    });
    this.add.text(DESIGN_VIEWPORT_WIDTH - 96, 1010, 'ESC  PAUSE     M  MENU', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
    }).setOrigin(1, 0.5);
    this.updateTrainViews();
    this.updateHud();
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
    this.playerLabel = this.add.text(this.playerPosition.x, this.playerPosition.y - 55, 'PLAYER', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(4);
    this.playerHpText = this.add.text(this.playerPosition.x, this.playerPosition.y + 52, '', {
      color: '#b7d1b4',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
    }).setOrigin(0.5).setDepth(4);
    this.aimLine = this.add.graphics().setDepth(2);
    this.aimCrosshair = this.add.graphics().setDepth(5);
    this.updatePlayerAndAim();
  }

  private updatePlayerAndAim(): void {
    this.playerMarker?.setPosition(this.playerPosition.x, this.playerPosition.y);
    this.playerShadow?.setPosition(this.playerPosition.x, this.playerPosition.y + 35);
    this.playerLabel?.setPosition(this.playerPosition.x, this.playerPosition.y - 55);
    this.playerHpText?.setPosition(this.playerPosition.x, this.playerPosition.y + 52);

    const session = this.registry.get('session') as SessionContext | undefined;
    const player = session?.run?.player;
    if (player) this.playerHpText?.setText(`HP ${Math.ceil(player.health)}/${player.maxHealth}`);

    this.aimLine?.clear();
    this.aimLine?.lineStyle(2, 0xf3c777, 0.55);
    this.aimLine?.lineBetween(this.playerPosition.x, this.playerPosition.y, this.pointerPosition.x, this.pointerPosition.y);

    this.aimCrosshair?.clear();
    this.aimCrosshair?.lineStyle(2, 0xf3c777, 0.9);
    this.aimCrosshair?.strokeCircle(this.pointerPosition.x, this.pointerPosition.y, 12);
    this.aimCrosshair?.lineBetween(this.pointerPosition.x - 18, this.pointerPosition.y, this.pointerPosition.x + 18, this.pointerPosition.y);
    this.aimCrosshair?.lineBetween(this.pointerPosition.x, this.pointerPosition.y - 18, this.pointerPosition.x, this.pointerPosition.y + 18);
  }

  private createCombatTarget(): void {
    const target: CombatTarget = {
      id: 'combat-test-target',
      x: 1290,
      y: 475,
      radius: 32,
      health: 80,
      maxHealth: 80,
      active: true,
    };
    this.combatTargets.push(target);
    this.targetMarker = this.add.circle(target.x, target.y, target.radius, 0x5a6970).setDepth(3);
    this.targetHpText = this.add.text(target.x, target.y - 55, '', {
      color: '#d6a65f',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(4);
    this.updateCombatTargetView();
  }

  private fireWeapon(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const player = session?.run?.player;
    if (!session || !player || player.health <= 0 || session.gameState.value !== 'PLAYING' || !this.combatSystem) return;

    const projectile = this.combatSystem.fire(
      this.playerPosition,
      this.pointerPosition,
      this.elapsedMs,
      {
        ...BASE_WEAPON,
        damage: player.damage,
        fireRate: player.fireRate,
        range: player.weaponRange,
      },
    );
    if (!projectile) return;

    const sprite = this.add.circle(projectile.x, projectile.y, projectile.radius, 0xf3c777).setDepth(6);
    this.projectileViews.set(projectile.id, { sprite });
    this.createMuzzleFlash();
    this.updateDiagnostics();
  }

  private updateCombat(deltaSeconds: number): void {
    if (!this.combatSystem) return;

    const targets = [...this.combatTargets, ...(this.enemySystem?.getCombatTargets() ?? [])];
    const hits = this.combatSystem.update(deltaSeconds, targets);
    const projectiles = this.combatSystem.getProjectiles();
    const activeProjectileIds = new Set<number>();

    for (const projectile of projectiles) {
      activeProjectileIds.add(projectile.id);
      const view = this.projectileViews.get(projectile.id) ?? this.createProjectileView(projectile);
      view.sprite.setPosition(projectile.x, projectile.y);
    }

    for (const [id, view] of this.projectileViews) {
      if (activeProjectileIds.has(id)) continue;
      view.sprite.destroy();
      this.projectileViews.delete(id);
    }

    for (const hit of hits) this.createHitFlash(hit);
    this.processEnemyEvents(this.enemySystem?.handleCombatHits(hits, this.elapsedMs) ?? []);
    this.updateCombatTargetView();
    this.updateEnemyViews();
    this.updateDiagnostics();
  }

  private updateEnemies(deltaSeconds: number): void {
    if (!this.enemySystem) return;

    this.enemySpawnElapsedMs += deltaSeconds * 1000;
    if (this.enemySpawnElapsedMs >= ENEMY_SPAWN_INTERVAL_MS) {
      this.enemySpawnElapsedMs -= ENEMY_SPAWN_INTERVAL_MS;
      this.spawnEnemyWeighted();
    }

    const events = this.enemySystem.update(deltaSeconds, this.createEnemyTargetContext());
    this.processEnemyEvents(events);
    this.updateEnemyViews();
  }

  private updateRunProgress(deltaSeconds: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!run) return;
    run.elapsedSeconds += deltaSeconds;
    run.progress = Math.min(100, run.progress + deltaSeconds * 0.5);
    if (run.routePhase === 'DEPARTURE') run.routePhase = 'BIOME_1';
  }

  private maybeOpenStation(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    const station = run && this.stationSystem?.getNextStation(run);
    if (!session || !run || !station || session.gameState.value !== 'PLAYING') return;
    this.openStation(station.id);
  }

  private createEnemyTargetContext(): EnemyTargetContext {
    const session = this.registry.get('session') as SessionContext | undefined;
    const player = session?.run?.player;
    const train = TRAIN_SECTION_LAYOUT.flatMap((layout) => {
      const section = this.trainSystem?.getSection(layout.id);
      if (!section) return [];
      return [{
        id: layout.id,
        type: 'TRAIN' as const,
        x: layout.x,
        y: layout.y,
        radius: Math.max(layout.width, layout.height) / 2,
        health: section.currentHp,
        maxHealth: section.maxHp,
        active: section.currentHp > 0,
      }];
    });

    return {
      nowMs: this.elapsedMs,
      player: {
        id: 'PLAYER',
        type: 'PLAYER',
        x: this.playerPosition.x,
        y: this.playerPosition.y,
        radius: 24,
        health: player?.health ?? 0,
        maxHealth: player?.maxHealth ?? 0,
        active: Boolean(player && player.health > 0),
      },
      train,
    };
  }

  private spawnEnemyWeighted(): void {
    if (!this.enemySystem) return;
    const side = ENEMY_SPAWN_SIDES[this.enemySpawnSideIndex % ENEMY_SPAWN_SIDES.length];
    this.enemySpawnSideIndex += 1;
    this.enemySystem.spawnWeighted(side, this.elapsedMs, this.createEnemyTargetContext());
  }

  private spawnEnemy(archetype: EnemyArchetype, side: typeof ENEMY_SPAWN_SIDES[number]): void {
    this.enemySystem?.spawn(archetype, side, this.elapsedMs, this.createEnemyTargetContext());
  }

  private spawnDebugEnemy(archetype: EnemyArchetype): void {
    if (!this.debugEnabled) return;
    const side = ENEMY_SPAWN_SIDES[this.enemySpawnSideIndex % ENEMY_SPAWN_SIDES.length];
    this.enemySpawnSideIndex += 1;
    this.spawnEnemy(archetype, side);
    this.updateDebugOverlay();
  }

  private createEnemyView(enemy: EnemyState): EnemyView {
    const color = ENEMY_COLORS[enemy.archetype];
    let shape: Phaser.GameObjects.Shape;
    if (enemy.archetype === 'MIST') {
      shape = this.add.circle(enemy.x, enemy.y, enemy.radius, color);
    } else if (enemy.archetype === 'SHADOW') {
      shape = this.add.polygon(enemy.x, enemy.y, [
        0, -enemy.radius * 1.4,
        enemy.radius * 0.72, 0,
        0, enemy.radius * 1.4,
        -enemy.radius * 0.72, 0,
      ], color);
    } else {
      shape = this.add.rectangle(enemy.x, enemy.y, enemy.radius * 1.65, enemy.radius * 2, color);
    }
    shape.setDepth(4).setStrokeStyle(2, 0xeee8d5, 0.75);

    const label = this.add.text(enemy.x, enemy.y - enemy.radius - 20, '', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(5);
    return { shape, label };
  }

  private updateEnemyViews(): void {
    const enemies = this.enemySystem?.getActiveEnemies() ?? [];
    const activeIds = new Set<string>();
    for (const enemy of enemies) {
      activeIds.add(enemy.id);
      const view = this.enemyViews.get(enemy.id) ?? this.createEnemyView(enemy);
      const isHit = enemy.hitFlashUntilMs > this.elapsedMs;
      view.shape.setPosition(enemy.x, enemy.y);
      view.shape.setFillStyle(isHit ? 0xf18b6f : ENEMY_COLORS[enemy.archetype]);
      view.shape.setAlpha(enemy.active ? 1 : 0.5);
      view.label.setPosition(enemy.x, enemy.y - enemy.radius - 20);
      view.label.setText(`${enemy.archetype}\nHP ${Math.ceil(enemy.health)}/${enemy.maxHealth}`);
      this.enemyViews.set(enemy.id, view);
    }

    for (const [id, view] of this.enemyViews) {
      if (activeIds.has(id)) continue;
      view.shape.destroy();
      view.label.destroy();
      this.enemyViews.delete(id);
    }
  }

  private processEnemyEvents(events: readonly EnemySystemEvent[]): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    for (const event of events) {
      if (event.type === 'attacked') {
        if (event.targetType === 'PLAYER') this.applyDamageToPlayer(event.damage);
        else this.trainSystem?.damage(event.targetId as TrainSectionId, event.damage);
      } else if (event.type === 'defeated' && session?.run) {
        session.run.enemiesDefeated += 1;
      } else if (event.type === 'scrap-drop') {
        this.scrapSystem?.handleEnemyDrop(event, this.elapsedMs);
      }
    }
    this.updateTrainViews();
    this.updateDiagnostics();
  }

  private updateScrap(deltaSeconds: number): void {
    if (!this.scrapSystem) return;
    const events = this.scrapSystem.update(deltaSeconds, this.playerPosition);
    for (const event of events) {
      if (event.type === 'collected') this.createScrapCollectFlash(event);
    }
    this.updateScrapViews();
    this.updateHud();
    this.updateDiagnostics();
  }

  private createScrapView(pickup: ScrapPickup): ScrapPickupView {
    const shape = this.add.polygon(pickup.x, pickup.y, [
      0, -pickup.radius,
      pickup.radius * 0.65, -pickup.radius * 0.2,
      pickup.radius * 0.35, pickup.radius * 0.75,
      -pickup.radius * 0.45, pickup.radius * 0.55,
      -pickup.radius * 0.75, -pickup.radius * 0.25,
    ], 0xd6a65f);
    shape.setDepth(3).setStrokeStyle(2, 0xeee8d5, 0.8);
    return { shape };
  }

  private updateScrapViews(): void {
    const pickups = this.scrapSystem?.getPickups() ?? [];
    const activeIds = new Set<string>();
    for (const pickup of pickups) {
      activeIds.add(pickup.id);
      const view = this.scrapViews.get(pickup.id) ?? this.createScrapView(pickup);
      view.shape.setPosition(pickup.x, pickup.y + Math.sin(pickup.bobPhase) * 3);
      this.scrapViews.set(pickup.id, view);
    }

    for (const [id, view] of this.scrapViews) {
      if (activeIds.has(id)) continue;
      view.shape.destroy();
      this.scrapViews.delete(id);
    }
  }

  private createScrapCollectFlash(event: Extract<ScrapSystemEvent, { type: 'collected' }>): void {
    const flash = this.add.rectangle(event.x, event.y, 16, 3, 0xd6a65f).setDepth(7);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.8,
      duration: 100,
      onComplete: () => flash.destroy(),
    });
  }

  private updateHud(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!run) return;
    this.scrapHudText?.setText(
      `TRAIN HP  [SECTION STATUS ABOVE]     PLAYER HP ${Math.ceil(run.player.health)}/${run.player.maxHealth}     SCRAP  ${run.scrap}     JOURNEY  ${run.progress}%`,
    );
  }

  private updateDefenseTurret(deltaSeconds: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!run || !this.defenseTurretSystem || !this.enemySystem || !this.upgradeSystem) return;

    const level = this.upgradeSystem.getLevel(run, 'DEFENSE_TURRET');
    this.defenseTurretSystem.setLevel(level);
    const shot = this.defenseTurretSystem.update(
      deltaSeconds,
      { x: TRAIN_SECTION_LAYOUT[0].x, y: TRAIN_SECTION_LAYOUT[0].y },
      this.enemySystem.getActiveEnemies(),
    );
    if (!shot) return;

    const events = this.enemySystem.applyDamage(shot.targetId, shot.damage, this.elapsedMs);
    this.processEnemyEvents(events);
    this.createTurretShotFlash(shot);
  }

  private createTurretShotFlash(shot: { origin: { x: number; y: number }; target: { x: number; y: number } }): void {
    const tracer = this.add.graphics().setDepth(6);
    tracer.lineStyle(2, 0xd6a65f, 0.8);
    tracer.lineBetween(shot.origin.x, shot.origin.y, shot.target.x, shot.target.y);
    this.tweens.add({
      targets: tracer,
      alpha: 0,
      duration: 90,
      onComplete: () => tracer.destroy(),
    });
  }

  private maybeOpenUpgradeOffer(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run || session.gameState.value !== 'PLAYING' || !this.upgradeOfferDirector) return;
    if (this.upgradeOfferDirector.shouldOffer(session.run)) this.openUpgradeOffer();
  }

  private openUpgradeOffer(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!session || !run || session.gameState.value !== 'PLAYING' || !this.upgradeSystem) return;

    const offer = this.upgradeSystem.createOffer(run);
    if (offer.length < 3) return;
    this.stationUpgradeMode = false;
    this.activeUpgradeOffer = offer;
    this.upgradeOfferDirector?.markOfferShown();
    session.gameState.transition('UPGRADE');
    this.trainSystem?.stop();
    setAppStatus('Upgrade Selection', 'gameplay');
    this.updateUpgradeOverlay();
    this.updateDiagnostics();
  }

  private selectUpgrade(index: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const definition = this.activeUpgradeOffer[index];
    const stationPurchase = Boolean(session?.gameState.value === 'STATION' && this.stationUpgradeMode && this.activeStation);
    const regularOffer = session?.gameState.value === 'UPGRADE' && !this.stationUpgradeMode;
    if (!session?.run || (!regularOffer && !stationPurchase) || !definition || !this.upgradeSystem || !this.trainSystem) return;

    const stationCost = stationPurchase ? this.activeStation?.upgradeCost ?? 0 : 0;
    if (stationPurchase && !this.scrapSystem?.spend(stationCost)) {
      this.stationMessage?.setText(`Not enough Scrap. Upgrade requires ${stationCost}.`);
      this.updateUpgradeOverlay();
      this.updateStationOverlay();
      this.updateDiagnostics();
      return;
    }

    const result = this.upgradeSystem.applyUpgrade(session.run, this.trainSystem, definition.id);
    if (!result.applied) {
      if (stationPurchase) this.scrapSystem?.refund(stationCost);
      this.updateUpgradeOverlay();
      this.updateStationOverlay();
      this.updateDiagnostics();
      return;
    }
    this.activeUpgradeOffer = [];
    this.defenseTurretSystem?.setLevel(this.upgradeSystem.getLevel(session.run, 'DEFENSE_TURRET'));

    if (stationPurchase) {
      this.stationUpgradeMode = false;
      this.stationMessage?.setText(`${definition.name} Lv.${result.level} installed at the station.`);
      setAppStatus(`${definition.name} Lv.${result.level}`, 'gameplay');
      this.updateUpgradeOverlay();
      this.updateStationOverlay();
      this.updateTrainViews();
      this.updateHud();
      this.updateDiagnostics();
      return;
    }

    session.gameState.transition('PLAYING');
    this.trainSystem.resume();
    setAppStatus(`${definition.name} Lv.${result.level}`, 'gameplay');
    this.updateUpgradeOverlay();
    this.updateTrainViews();
    this.updateHud();
    this.updateDiagnostics();
  }

  private dismissUpgradeOffer(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const stationOffer = session?.gameState.value === 'STATION' && this.stationUpgradeMode;
    const regularOffer = session?.gameState.value === 'UPGRADE';
    if (!session || (!regularOffer && !stationOffer)) return;
    this.activeUpgradeOffer = [];
    this.stationUpgradeMode = false;
    this.updateUpgradeOverlay();
    if (stationOffer) {
      this.stationMessage?.setText('Station upgrade cancelled.');
      this.updateStationOverlay();
      this.updateDiagnostics();
      return;
    }
    session.gameState.transition('PLAYING');
    this.trainSystem?.resume();
    setAppStatus('Gameplay Prototype', 'gameplay');
    this.updateDiagnostics();
  }

  private isUpgradeOpen(): boolean {
    const session = this.registry.get('session') as SessionContext | undefined;
    return session?.gameState.value === 'UPGRADE';
  }

  private isStationOpen(): boolean {
    const session = this.registry.get('session') as SessionContext | undefined;
    return session?.gameState.value === 'STATION';
  }

  private createUpgradeOverlay(): void {
    this.upgradeShade = this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, 0x071018, 0.88)
      .setOrigin(0)
      .setDepth(30)
      .setInteractive()
      .setVisible(false);
    this.upgradeTitle = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 250, 'CHOOSE ONE UPGRADE', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(31).setVisible(false);

    this.upgradeCards.length = 0;
    const cardX = [520, 960, 1400];
    for (let index = 0; index < 3; index += 1) {
      const panel = this.add.rectangle(cardX[index], 555, 360, 310, 0x172629)
        .setDepth(31)
        .setStrokeStyle(3, 0xd6a65f, 0.85)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      panel.on('pointerdown', () => this.selectUpgrade(index));
      const title = this.add.text(cardX[index], 465, '', {
        color: '#f3c777',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '23px',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 320 },
      }).setOrigin(0.5).setDepth(32).setVisible(false);
      const description = this.add.text(cardX[index], 555, '', {
        color: COLORS.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        align: 'center',
        wordWrap: { width: 300 },
        lineSpacing: 6,
      }).setOrigin(0.5).setDepth(32).setVisible(false);
      const level = this.add.text(cardX[index], 675, '', {
        color: COLORS.mutedText,
        fontFamily: 'monospace',
        fontSize: '15px',
        align: 'center',
      }).setOrigin(0.5).setDepth(32).setVisible(false);
      this.upgradeCards.push({ panel, title, description, level });
    }
    this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 830, '1–3 SELECT     ESC DISMISS', {
      color: COLORS.mutedText,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(32).setName('upgrade-help').setVisible(false);
  }

  private updateUpgradeOverlay(): void {
    const visible = this.activeUpgradeOffer.length === 3;
    this.upgradeShade?.setVisible(visible);
    this.upgradeTitle?.setText(this.stationUpgradeMode ? 'STATION UPGRADE — SCRAP REQUIRED' : 'CHOOSE ONE UPGRADE');
    this.upgradeTitle?.setVisible(visible);
    const help = this.children.getByName('upgrade-help') as Phaser.GameObjects.Text | null;
    help?.setVisible(visible);
    for (let index = 0; index < this.upgradeCards.length; index += 1) {
      const card = this.upgradeCards[index];
      const definition = this.activeUpgradeOffer[index];
      card.panel.setVisible(visible);
      card.title.setVisible(visible);
      card.description.setVisible(visible);
      card.level.setVisible(visible);
      if (!definition) continue;
      const session = this.registry.get('session') as SessionContext | undefined;
      const currentLevel = session?.run && this.upgradeSystem ? this.upgradeSystem.getLevel(session.run, definition.id) : 0;
      card.title.setText(`${index + 1}. ${definition.name}`);
      card.description.setText(definition.description);
      card.level.setText(`LEVEL ${currentLevel} → ${currentLevel + 1} / ${definition.maxLevel}`);
    }
  }

  private createStationOverlay(): void {
    this.stationShade = this.add.rectangle(0, 0, DESIGN_VIEWPORT_WIDTH, DESIGN_VIEWPORT_HEIGHT, 0x071018, 0.86)
      .setOrigin(0)
      .setDepth(20)
      .setInteractive()
      .setVisible(false);
    this.stationTitle = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 170, '', {
      color: COLORS.text,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(21).setVisible(false);
    this.stationInfo = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 225, '', {
      color: COLORS.mutedText,
      fontFamily: 'monospace',
      fontSize: '18px',
    }).setOrigin(0.5).setDepth(21).setVisible(false);

    const sectionIds: readonly TrainSectionId[] = ['DEFENSE', 'WORKSHOP', 'PASSENGER', 'LOCOMOTIVE'];
    for (let index = 0; index < sectionIds.length; index += 1) {
      const sectionId = sectionIds[index];
      const y = 340 + index * 78;
      const panel = this.add.rectangle(960, y, 820, 60, 0x172629)
        .setDepth(21)
        .setStrokeStyle(2, 0x4e5b57, 0.9)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      panel.on('pointerdown', () => this.selectStationSection(sectionId));
      const label = this.add.text(585, y, '', {
        color: COLORS.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(22).setVisible(false);
      const action = this.add.text(1320, y, '', {
        color: '#f3c777',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true }).setVisible(false);
      action.on('pointerdown', () => {
        this.selectStationSection(sectionId);
        this.repairSelectedStationSection();
      });
      this.stationSectionViews.push({ sectionId, panel, label, action });
    }

    this.stationMessage = this.add.text(DESIGN_VIEWPORT_WIDTH / 2, 680, '', {
      color: '#f3c777',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '17px',
      align: 'center',
    }).setOrigin(0.5).setDepth(22).setVisible(false);
    this.stationUpgradeButton = this.add.text(720, 770, '', {
      color: '#f3c777',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true }).setVisible(false);
    this.stationUpgradeButton.on('pointerdown', this.handleStationUpgrade);
    this.stationRescueButton = this.add.text(1195, 770, '', {
      color: '#b7d1b4',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true }).setVisible(false);
    this.stationRescueButton.on('pointerdown', this.handleStationRescue);
    this.stationDepartButton = this.add.text(DESIGN_VIEWPORT_WIDTH - 150, 930, '[ DEPART ]', {
      color: '#f3c777',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(22).setInteractive({ useHandCursor: true }).setVisible(false);
    this.stationDepartButton.on('pointerdown', this.handleStationDepart);
  }

  private updateStationOverlay(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    const visible = Boolean(run && this.activeStation && this.isStationOpen());
    this.stationShade?.setVisible(visible);
    this.stationTitle?.setVisible(visible);
    this.stationInfo?.setVisible(visible);
    this.stationMessage?.setVisible(visible && Boolean(this.stationMessage?.text));
    this.stationUpgradeButton?.setVisible(visible);
    this.stationRescueButton?.setVisible(visible);
    this.stationDepartButton?.setVisible(visible);
    if (!visible || !run || !this.activeStation || !this.stationSystem) {
      for (const view of this.stationSectionViews) {
        view.panel.setVisible(false);
        view.label.setVisible(false);
        view.action.setVisible(false);
      }
      return;
    }

    this.stationTitle?.setText(this.activeStation.name);
    this.stationInfo?.setText(`SCRAP  ${run.scrap}     SELECTED SECTION  ${this.stationSelectedSection}`);
    this.stationUpgradeButton?.setText(`[ U ]  UPGRADE  ${this.activeStation.upgradeCost} SCRAP`);
    this.stationUpgradeButton?.setColor(run.scrap >= this.activeStation.upgradeCost ? '#f3c777' : '#7c7770');
    this.stationRescueButton?.setText(this.activeStation.canRescueSurvivor ? '[ N ]  RESCUE SURVIVOR  AVAILABLE' : 'RESCUE UNAVAILABLE');

    for (const view of this.stationSectionViews) {
      const section = run.train.find((candidate) => candidate.id === view.sectionId);
      if (!section) continue;
      const quote: StationRepairQuote = this.stationSystem.getRepairQuote(run, view.sectionId, this.activeStation.id);
      const selected = view.sectionId === this.stationSelectedSection;
      view.panel.setVisible(true).setFillStyle(selected ? 0x2b403c : 0x172629).setStrokeStyle(2, selected ? 0xd6a65f : 0x4e5b57, 0.9);
      view.label.setVisible(true).setText(`${view.sectionId}   HP ${Math.ceil(section.currentHp)}/${section.maxHp}`);
      view.action.setVisible(true);
      view.action.setText(quote.canRepair ? `REPAIR  ${quote.cost} SCRAP` : section.currentHp >= section.maxHp ? 'FULL' : 'UNAVAILABLE');
      view.action.setColor(quote.canRepair && run.scrap >= quote.cost ? '#f3c777' : '#7c7770');
    }
  }

  private openStation(id: StationId): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run || !this.stationSystem || session.gameState.value !== 'PLAYING') return;
    this.activeStation = this.stationSystem.markArrived(session.run, id);
    this.stationSelectedSection = 'DEFENSE';
    this.stationMessage?.setText('Select a damaged section, then repair, upgrade, rescue, or depart.');
    session.gameState.transition('STATION');
    this.trainSystem?.stop();
    setAppStatus(this.activeStation.name, 'gameplay');
    this.updateStationOverlay();
    this.updateDiagnostics();
  }

  private selectStationSection(sectionId: TrainSectionId): void {
    if (!this.isStationOpen()) return;
    this.stationSelectedSection = sectionId;
    this.updateStationOverlay();
    this.updateDiagnostics();
  }

  private repairSelectedStationSection(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const run = session?.run;
    if (!run || !this.activeStation || !this.stationSystem || !this.trainSystem || !this.scrapSystem || !this.isStationOpen()) return;
    const quote = this.stationSystem.getRepairQuote(run, this.stationSelectedSection, this.activeStation.id);
    if (!quote.canRepair) {
      this.stationMessage?.setText(`${this.stationSelectedSection} cannot be repaired at its current condition.`);
      this.updateStationOverlay();
      return;
    }
    if (!this.scrapSystem.spend(quote.cost)) {
      this.stationMessage?.setText(`Not enough Scrap. Repair requires ${quote.cost}.`);
      this.updateStationOverlay();
      return;
    }
    const effectiveness = this.trainSystem.getSupportModifiers(0, 0).repairEffectiveness;
    const repairedAmount = this.trainSystem.repair(this.stationSelectedSection, quote.repairAmount, effectiveness);
    if (repairedAmount <= 0) {
      this.scrapSystem.refund(quote.cost);
      this.stationMessage?.setText('Repair did not change this section. Scrap refunded.');
    } else {
      this.stationMessage?.setText(`Repaired ${this.stationSelectedSection} by ${Math.ceil(repairedAmount)} HP.`);
    }
    this.updateStationOverlay();
    this.updateTrainViews();
    this.updateHud();
    this.updateDiagnostics();
  }

  private openStationUpgradeOffer(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run || !this.activeStation || !this.upgradeSystem || !this.isStationOpen() || this.stationUpgradeMode) return;
    if (session.run.scrap < this.activeStation.upgradeCost) {
      this.stationMessage?.setText(`Not enough Scrap. Upgrade requires ${this.activeStation.upgradeCost}.`);
      this.updateStationOverlay();
      return;
    }
    const offer = this.upgradeSystem.createOffer(session.run);
    if (offer.length < 3) {
      this.stationMessage?.setText('No upgrade offers remain in this run.');
      this.updateStationOverlay();
      return;
    }
    this.activeUpgradeOffer = offer;
    this.stationUpgradeMode = true;
    this.updateUpgradeOverlay();
    this.updateDiagnostics();
  }

  private rescueStationSurvivor(): void {
    if (!this.isStationOpen() || !this.activeStation?.canRescueSurvivor) return;
    this.stationMessage?.setText('Survivor rescue hook ready for M9. No roster change is applied yet.');
    this.updateStationOverlay();
    const status = document.querySelector<HTMLElement>('#app-status');
    status?.setAttribute('data-survivor-hook', 'true');
  }

  private departStation(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session?.run || !this.activeStation || !this.stationSystem || !this.isStationOpen() || this.stationUpgradeMode) return;
    const stationId = this.activeStation.id;
    this.stationSystem.markDeparted(session.run, stationId);
    this.activeStation = undefined;
    this.stationMessage?.setText('');
    session.gameState.transition('PLAYING');
    this.trainSystem?.resume();
    setAppStatus('Gameplay Prototype', 'gameplay');
    this.updateStationOverlay();
    this.updateHud();
    this.updateDiagnostics();
  }

  private createProjectileView(projectile: ProjectileState): ProjectileView {
    const sprite = this.add.circle(projectile.x, projectile.y, projectile.radius, 0xf3c777).setDepth(6);
    const view = { sprite };
    this.projectileViews.set(projectile.id, view);
    return view;
  }

  private updateCombatTargetView(): void {
    const target = this.combatTargets[0];
    if (!target) return;

    const ratio = target.maxHealth > 0 ? target.health / target.maxHealth : 0;
    this.targetMarker?.setFillStyle(target.active ? 0x5a6970 : 0x4c4b4b);
    this.targetMarker?.setAlpha(target.active ? 1 : 0.55);
    this.targetMarker?.setScale(target.active ? 1 : 0.85);
    this.targetHpText?.setText(`TEST TARGET  HP ${Math.ceil(target.health)}/${target.maxHealth}`);
    this.targetHpText?.setColor(target.active && ratio > 0.5 ? '#d6a65f' : '#f18b6f');
  }

  private createMuzzleFlash(): void {
    const flash = this.add.circle(this.playerPosition.x, this.playerPosition.y, 16, 0xf3c777).setDepth(7);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 0.5,
      duration: 70,
      onComplete: () => flash.destroy(),
    });
  }

  private createHitFlash(hit: ProjectileHitEvent): void {
    const flash = this.add.circle(hit.x, hit.y, 18, 0xf18b6f).setDepth(7);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.35,
      duration: 110,
      onComplete: () => flash.destroy(),
    });
    this.cameraSystem?.triggerShake(55, 0.0025);
  }

  private applyDamageToPlayer(amount: number): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const player = session?.run?.player;
    if (!session || !player || session.gameState.value !== 'PLAYING') return;

    const result = applyPlayerDamage(player, amount, this.elapsedMs, this.playerInvulnerableUntilMs);
    this.playerInvulnerableUntilMs = result.invulnerableUntilMs;
    if (result.appliedDamage > 0) this.createMuzzleFlash();
    if (result.defeated) setAppStatus('Player Down — M4 Debug', 'gameplay');
    this.updatePlayerAndAim();
    this.updateDiagnostics();
  }

  private updateTrainViews(): void {
    for (const view of this.trainViews) {
      if (!this.trainSystem) continue;
      const section = this.trainSystem.getSection(view.sectionId);
      const condition = getTrainCondition(section);
      const ratio = section.maxHp > 0 ? section.currentHp / section.maxHp : 0;
      const layout = TRAIN_SECTION_LAYOUT.find((candidate) => candidate.id === view.sectionId);
      if (!layout) continue;

      view.hpFill.width = (layout.width - 20) * ratio;
      view.hpFill.setFillStyle(CONDITION_COLORS[condition]);
      view.body.setStrokeStyle(3, CONDITION_COLORS[condition]);
      view.body.setAlpha(condition === 'DESTROYED' ? 0.45 : 1);
      view.conditionText.setColor(CONDITION_TEXT_COLORS[condition]);
      view.conditionText.setText(`HP ${Math.ceil(section.currentHp)}/${section.maxHp}  •  ${condition}`);
    }
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
    const trainSummary = run?.train.map((section) => `${section.id}:${Math.ceil(section.currentHp)}`).join(' ') ?? 'none';
    this.debugText.setText([
      `STATE: ${session?.gameState.value ?? 'UNKNOWN'}`,
      `PLAYER: placeholder-player @ (${Math.round(this.playerPosition.x)}, ${Math.round(this.playerPosition.y)})`,
      `BOUNDS: (${TRAIN_COMBAT_BOUNDS.left}, ${TRAIN_COMBAT_BOUNDS.top}) → (${TRAIN_COMBAT_BOUNDS.right}, ${TRAIN_COMBAT_BOUNDS.bottom})`,
      `TRAIN HP: ${trainSummary}`,
      `ENEMIES: ${this.enemySystem?.getActiveCount() ?? 0}/${12}`,
      'F3: toggle • 0: station • 1–4: train/select • 5/6/7: spawn Mist/Shadow/Keeper • 8: scrap pickup • 9: offer • Q: player damage • R: repair/reset',
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

    this.input.on('pointermove', this.handlePointerMove);
    this.input.on('pointerdown', this.handlePointerDown);
    this.input.keyboard.on('keydown-ESC', this.handleEscape);
    this.input.keyboard.on('keydown-M', this.handleMenuKey);
    this.input.keyboard.on('keydown-F3', this.handleDebugKey);
    this.input.keyboard.on('keydown-ONE', this.handleDebugDefenseDamage);
    this.input.keyboard.on('keydown-TWO', this.handleDebugWorkshopDamage);
    this.input.keyboard.on('keydown-THREE', this.handleDebugPassengerDamage);
    this.input.keyboard.on('keydown-FOUR', this.handleDebugLocomotiveDamage);
    this.input.keyboard.on('keydown-Q', this.handleDebugPlayerDamage);
    this.input.keyboard.on('keydown-R', this.handleDebugResetTarget);
    this.input.keyboard.on('keydown-FIVE', this.handleDebugMistSpawn);
    this.input.keyboard.on('keydown-SIX', this.handleDebugShadowSpawn);
    this.input.keyboard.on('keydown-SEVEN', this.handleDebugKeeperSpawn);
    this.input.keyboard.on('keydown-EIGHT', this.handleDebugScrapSpawn);
    this.input.keyboard.on('keydown-NINE', this.handleDebugUpgradeOffer);
    this.input.keyboard.on('keydown-ZERO', this.handleDebugStationOpen);
    this.input.keyboard.on('keydown-U', this.handleStationUpgrade);
    this.input.keyboard.on('keydown-N', this.handleStationRescue);
    this.input.keyboard.on('keydown-ENTER', this.handleStationDepart);
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
    const session = this.registry.get('session') as SessionContext | undefined;
    const player = session?.run?.player;
    const target = this.combatTargets[0];
    status.dataset.playerHp = player ? String(Math.ceil(player.health)) : '0';
    status.dataset.projectiles = String(this.combatSystem?.getProjectiles().length ?? 0);
    status.dataset.targetHp = target ? String(Math.ceil(target.health)) : '0';
    status.dataset.targetActive = String(target?.active ?? false);
    status.dataset.enemies = String(this.enemySystem?.getActiveCount() ?? 0);
    status.dataset.enemiesDefeated = String(session?.run?.enemiesDefeated ?? 0);
    status.dataset.scrap = String(session?.run?.scrap ?? 0);
    status.dataset.scrapCollected = String(session?.run?.scrapCollected ?? 0);
    status.dataset.scrapSpent = String(session?.run?.scrapSpent ?? 0);
    status.dataset.pickups = String(this.scrapSystem?.getPickups().length ?? 0);
    status.dataset.upgradeOpen = String(this.isUpgradeOpen());
    status.dataset.upgradeIds = session?.run?.upgradeIds.join(',') ?? '';
    status.dataset.upgradeOffer = this.activeUpgradeOffer.map((definition) => definition.id).join(',');
    status.dataset.routePhase = session?.run?.routePhase ?? '';
    status.dataset.stationOpen = String(this.isStationOpen());
    status.dataset.stationId = this.activeStation?.id ?? '';
    status.dataset.stationVisited = session?.run?.stationIds.join(',') ?? '';
    status.dataset.stationSelected = this.stationSelectedSection;
    status.dataset.stationUpgradeMode = String(this.stationUpgradeMode);
  }

  private damageDebugSection(sectionId: TrainSectionId): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!this.debugEnabled || !this.trainSystem || session?.gameState.value !== 'PLAYING') return;
    this.trainSystem.damage(sectionId, 15);
    this.updateTrainViews();
    this.updateDebugOverlay();
  }

  private togglePause(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    if (!session) return;

    if (session.gameState.value === 'PLAYING') {
      session.gameState.transition('PAUSED');
      this.trainSystem?.stop();
      setAppStatus('Paused', 'gameplay');
      this.pauseShade?.setVisible(true);
      this.pauseText?.setVisible(true);
    } else if (session.gameState.value === 'PAUSED') {
      session.gameState.transition('PLAYING');
      this.trainSystem?.resume();
      setAppStatus('Gameplay Prototype', 'gameplay');
      this.pauseShade?.setVisible(false);
      this.pauseText?.setVisible(false);
    }
  }

  private returnToMenu(): void {
    const session = this.registry.get('session') as SessionContext | undefined;
    const canLeave = session?.gameState.value === 'PLAYING'
      || session?.gameState.value === 'PAUSED'
      || session?.gameState.value === 'STATION'
      || session?.gameState.value === 'UPGRADE';
    if (!session || !canLeave) return;
    this.activeUpgradeOffer = [];
    this.activeStation = undefined;
    this.stationUpgradeMode = false;
    this.updateUpgradeOverlay();
    this.updateStationOverlay();
    session.discardRun();
    this.scene.start(SceneKeys.MENU);
  }
}
