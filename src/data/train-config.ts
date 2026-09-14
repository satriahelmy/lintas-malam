import { TrainSectionId } from '../core/run-state';

export interface TrainSectionLayout {
  id: TrainSectionId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export const TRAIN_SECTION_LAYOUT: readonly TrainSectionLayout[] = [
  { id: 'DEFENSE', label: 'DEFENSE', x: 520, y: 610, width: 250, height: 112, color: 0x596c63 },
  { id: 'WORKSHOP', label: 'WORKSHOP', x: 782, y: 610, width: 250, height: 112, color: 0x78664e },
  { id: 'PASSENGER', label: 'PASSENGER', x: 1044, y: 610, width: 250, height: 112, color: 0x9d7542 },
  { id: 'LOCOMOTIVE', label: 'LOCOMOTIVE', x: 1306, y: 610, width: 250, height: 112, color: 0x8b493d },
];

export const TRAIN_COMBAT_BOUNDS = {
  left: 360,
  right: 1580,
  top: 310,
  bottom: 865,
} as const;

export const PLAYER_START_POSITION = {
  x: 940,
  y: 475,
} as const;
