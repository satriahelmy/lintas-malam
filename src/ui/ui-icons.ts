import Phaser from 'phaser';

export const UI_ICON_KINDS = [
  'PLAYER',
  'TRAIN',
  'JOURNEY',
  'SCRAP',
  'SURVIVOR',
  'WEAPON',
  'STATION',
  'REPAIR',
  'UPGRADE',
  'RESCUE',
  'DEPART',
  'PLAY',
  'SETTINGS',
  'CREDITS',
  'PAUSE',
  'RETRY',
  'MENU',
  'MINUS',
  'PLUS',
] as const;

export type UiIconKind = typeof UI_ICON_KINDS[number];

export interface UiIconOptions {
  color?: number;
  accentColor?: number;
  alpha?: number;
  depth?: number;
  scale?: number;
}

const DEFAULT_ICON_COLOR = 0xeee8d5;
const DEFAULT_ACCENT_COLOR = 0xd6a65f;

function configure(graphics: Phaser.GameObjects.Graphics, color: number, alpha: number): void {
  graphics.lineStyle(2, color, alpha);
  graphics.fillStyle(color, alpha);
}

function drawIcon(
  graphics: Phaser.GameObjects.Graphics,
  kind: UiIconKind,
  color: number,
  accentColor: number,
  alpha: number,
): void {
  configure(graphics, color, alpha);

  switch (kind) {
    case 'PLAYER':
      graphics.fillCircle(0, -7, 4);
      graphics.lineBetween(-7, 10, 0, -1);
      graphics.lineBetween(7, 10, 0, -1);
      graphics.lineBetween(-6, 3, 6, 3);
      break;
    case 'TRAIN':
      graphics.fillStyle(color, 0.14 * alpha);
      graphics.fillRect(-13, -8, 26, 16);
      graphics.strokeRect(-13, -8, 26, 16);
      graphics.lineBetween(0, -8, 0, 8);
      graphics.fillStyle(accentColor, alpha);
      graphics.fillCircle(-7, 10, 3);
      graphics.fillCircle(7, 10, 3);
      graphics.lineBetween(13, -2, 17, -2);
      break;
    case 'JOURNEY':
      graphics.lineBetween(-13, 0, 13, 0);
      graphics.fillCircle(-11, 0, 3);
      graphics.fillCircle(0, 0, 3);
      graphics.fillCircle(11, 0, 3);
      graphics.fillTriangle(7, -5, 15, 0, 7, 5);
      break;
    case 'SCRAP':
      graphics.fillStyle(accentColor, 0.2 * alpha);
      graphics.fillTriangle(0, -12, 10, 0, 0, 12);
      graphics.fillTriangle(0, -12, -10, 0, 0, 12);
      graphics.lineStyle(2, accentColor, alpha);
      graphics.lineBetween(-2, -5, 3, -1);
      graphics.lineBetween(3, -1, -2, 5);
      break;
    case 'SURVIVOR':
      graphics.fillCircle(0, -6, 4);
      graphics.fillEllipse(0, 6, 20, 13);
      graphics.strokeCircle(0, -6, 4);
      graphics.lineBetween(-8, 10, 8, 10);
      break;
    case 'WEAPON':
      graphics.strokeCircle(-4, 2, 8);
      graphics.lineBetween(-15, 2, 7, 2);
      graphics.lineBetween(3, -2, 8, -7);
      graphics.lineBetween(3, 6, 8, 11);
      graphics.lineBetween(-4, -11, -4, 15);
      break;
    case 'STATION':
      graphics.fillStyle(color, 0.15 * alpha);
      graphics.fillTriangle(-14, -2, 0, -13, 14, -2);
      graphics.strokeRect(-11, -2, 22, 14);
      graphics.lineBetween(-5, 12, -5, 3);
      graphics.lineBetween(5, 12, 5, 3);
      graphics.fillStyle(accentColor, alpha);
      graphics.fillCircle(0, -7, 2);
      break;
    case 'REPAIR':
      graphics.lineStyle(3, accentColor, alpha);
      graphics.lineBetween(-9, 9, 6, -6);
      graphics.strokeCircle(8, -8, 5);
      graphics.fillStyle(color, alpha);
      graphics.fillTriangle(3, -12, 10, -13, 12, -8);
      graphics.strokeCircle(-10, 10, 3);
      break;
    case 'UPGRADE':
      graphics.strokeRect(-10, -10, 20, 20);
      graphics.lineBetween(0, 8, 0, -7);
      graphics.lineBetween(-6, -1, 0, -7);
      graphics.lineBetween(6, -1, 0, -7);
      graphics.fillStyle(accentColor, alpha);
      graphics.fillCircle(0, 8, 2);
      break;
    case 'RESCUE':
      graphics.strokeCircle(0, 0, 11);
      graphics.lineStyle(3, accentColor, alpha);
      graphics.lineBetween(-6, 0, 6, 0);
      graphics.lineBetween(0, -6, 0, 6);
      break;
    case 'DEPART':
      graphics.lineBetween(-13, -7, -13, 7);
      graphics.lineBetween(-5, -7, -5, 7);
      graphics.lineBetween(-13, 7, 13, 7);
      graphics.lineBetween(0, -8, 12, 0);
      graphics.lineBetween(12, 0, 0, 8);
      break;
    case 'PLAY':
      graphics.fillTriangle(-5, -11, 10, 0, -5, 11);
      break;
    case 'SETTINGS':
      graphics.strokeCircle(0, 0, 7);
      graphics.fillCircle(0, 0, 2);
      for (let index = 0; index < 8; index += 1) {
        const angle = (Math.PI * 2 * index) / 8;
        graphics.lineBetween(Math.cos(angle) * 9, Math.sin(angle) * 9, Math.cos(angle) * 13, Math.sin(angle) * 13);
      }
      break;
    case 'CREDITS':
      graphics.strokeCircle(0, 0, 11);
      graphics.fillCircle(0, -5, 1.5);
      graphics.lineBetween(0, -1, 0, 7);
      break;
    case 'PAUSE':
      graphics.fillRect(-8, -10, 5, 20);
      graphics.fillRect(3, -10, 5, 20);
      break;
    case 'RETRY':
      graphics.strokeCircle(0, 0, 10);
      graphics.fillTriangle(0, -13, 7, -7, -1, -6);
      graphics.lineStyle(2, accentColor, alpha);
      graphics.lineBetween(-6, 8, 5, 8);
      break;
    case 'MENU':
      graphics.lineBetween(-11, -7, 11, -7);
      graphics.lineBetween(-11, 0, 11, 0);
      graphics.lineBetween(-11, 7, 11, 7);
      break;
    case 'MINUS':
      graphics.lineStyle(3, accentColor, alpha);
      graphics.lineBetween(-8, 0, 8, 0);
      break;
    case 'PLUS':
      graphics.lineStyle(3, accentColor, alpha);
      graphics.lineBetween(-8, 0, 8, 0);
      graphics.lineBetween(0, -8, 0, 8);
      break;
    default:
      break;
  }
}

export function createUiIcon(
  scene: Phaser.Scene,
  kind: UiIconKind,
  x: number,
  y: number,
  options: UiIconOptions = {},
): Phaser.GameObjects.Graphics {
  const color = options.color ?? DEFAULT_ICON_COLOR;
  const accentColor = options.accentColor ?? DEFAULT_ACCENT_COLOR;
  const alpha = options.alpha ?? 1;
  const graphics = scene.add.graphics()
    .setPosition(x, y)
    .setDepth(options.depth ?? 8)
    .setScale(options.scale ?? 1)
    .setAlpha(alpha)
    .setName(`ui-icon-${kind.toLowerCase()}`);
  drawIcon(graphics, kind, color, accentColor, alpha);
  return graphics;
}
