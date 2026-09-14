import type { UpgradeDefinition, UpgradeId } from '../entities/upgrade/upgrade-types';

export const UPGRADE_DEFINITIONS: readonly UpgradeDefinition[] = [
  {
    id: 'RAPID_FIRE',
    name: 'Rapid Fire',
    description: 'Fire rate +20%.',
    maxLevel: 3,
    effect: { type: 'PLAYER_FIRE_RATE', multiplier: 1.2 },
  },
  {
    id: 'HEAVY_ROUND',
    name: 'Heavy Round',
    description: 'Damage +25%.',
    maxLevel: 3,
    effect: { type: 'PLAYER_DAMAGE', multiplier: 1.25 },
  },
  {
    id: 'LONG_BARREL',
    name: 'Long Barrel',
    description: 'Projectile range +20%.',
    maxLevel: 3,
    effect: { type: 'PLAYER_RANGE', multiplier: 1.2 },
  },
  {
    id: 'REINFORCED_CARRIAGE',
    name: 'Reinforced Carriage',
    description: 'All train section max HP +15%; damaged HP rises by the same amount.',
    maxLevel: 2,
    effect: { type: 'TRAIN_MAX_HP', multiplier: 1.15 },
  },
  {
    id: 'EMERGENCY_REPAIR',
    name: 'Emergency Repair',
    description: 'Restore up to 25 HP to the most damaged train section.',
    maxLevel: 3,
    effect: { type: 'TRAIN_REPAIR', amount: 25 },
  },
  {
    id: 'DEFENSE_TURRET',
    name: 'Defense Turret',
    description: 'Defense Car fires a passive shot at the nearest enemy.',
    maxLevel: 3,
    effect: { type: 'DEFENSE_TURRET', damage: 6, intervalMs: 1400 },
  },
];

export const UPGRADE_BY_ID: Readonly<Record<UpgradeId, UpgradeDefinition>> = Object.fromEntries(
  UPGRADE_DEFINITIONS.map((definition) => [definition.id, definition]),
) as Record<UpgradeId, UpgradeDefinition>;

export const UPGRADE_OFFER_ENEMY_MILESTONE = 3;
