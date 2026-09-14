import { WeaponStats } from '../entities/combat/combat-types';
import { PLAYER_BALANCE } from './balance-config';

export const BASE_WEAPON: WeaponStats = {
  damage: PLAYER_BALANCE.damage,
  fireRate: PLAYER_BALANCE.fireRate,
  projectileSpeed: 620,
  range: PLAYER_BALANCE.weaponRange,
  projectileRadius: 6,
};
