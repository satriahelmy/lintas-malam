/**
 * M14 tuning targets. These are design targets, not hard timers: stations and
 * player decisions can make a real run shorter or longer.
 */
export const ROUTE_BALANCE_TARGETS = {
  departureSeconds: 60,
  biomeSeconds: 180,
  stationSeconds: 30,
  bossSeconds: 120,
  totalSeconds: 780,
  acceptableMinimumSeconds: 600,
  acceptableMaximumSeconds: 900,
} as const;

export const PLAYER_BALANCE = {
  maxHealth: 100,
  movementSpeed: 240,
  damage: 10,
  fireRate: 4,
  weaponRange: 480,
  invulnerabilityMs: 350,
} as const;

export const FEEDBACK_BALANCE = {
  muzzleFlashDurationMs: 70,
  hitFlashDurationMs: 110,
  damageFlashDurationMs: 140,
  trainImpactFlashDurationMs: 160,
  pickupBobPixels: 5,
  impactShakeDurationMs: 55,
  impactShakeIntensity: 0.0018,
  heavyImpactShakeDurationMs: 75,
  heavyImpactShakeIntensity: 0.0024,
  maxConcurrentEffects: 24,
} as const;
