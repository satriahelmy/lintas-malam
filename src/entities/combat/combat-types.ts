export interface WeaponStats {
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  range: number;
  projectileRadius: number;
}

export interface CombatTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  active: boolean;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  damage: number;
  remainingRange: number;
  active: boolean;
}

export interface ProjectileHitEvent {
  projectileId: number;
  targetId: string;
  x: number;
  y: number;
  damage: number;
  targetHealth: number;
  targetDefeated: boolean;
}

export interface PlayerDamageResult {
  appliedDamage: number;
  health: number;
  invulnerableUntilMs: number;
  defeated: boolean;
}
