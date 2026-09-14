import type { SurvivorDefinition, SurvivorId } from '../entities/survivor/survivor-types';

export const SURVIVOR_DEFINITIONS: readonly SurvivorDefinition[] = [
  {
    id: 'MONTIR',
    displayName: 'Mang Darsa',
    role: 'Montir',
    description: 'Repair effectiveness +25%.',
    initial: 'MD',
    portraitColor: 0xc28b55,
    passive: { type: 'REPAIR_EFFECTIVENESS', bonus: 0.25 },
  },
  {
    id: 'PEDAGANG',
    displayName: 'Mbak Sari',
    role: 'Pedagang',
    description: 'Station purchase cost -20%.',
    initial: 'MS',
    portraitColor: 0x9d7542,
    passive: { type: 'STATION_PURCHASE_DISCOUNT', discount: 0.2 },
  },
  {
    id: 'PERAWAT',
    displayName: 'Bu Nani',
    role: 'Perawat',
    description: 'Recover 2 HP/s after 3 seconds without damage.',
    initial: 'BN',
    portraitColor: 0xb7d1b4,
    passive: { type: 'PLAYER_RECOVERY', amountPerSecond: 2, delayMs: 3000 },
  },
  {
    id: 'PENJAGA',
    displayName: 'Pak Jaka',
    role: 'Penjaga',
    description: 'Defense Car effectiveness +20%.',
    initial: 'PJ',
    portraitColor: 0x6f9d76,
    passive: { type: 'TRAIN_DEFENSE', bonus: 0.2 },
  },
];

export const SURVIVOR_BY_ID: Readonly<Record<SurvivorId, SurvivorDefinition>> = Object.fromEntries(
  SURVIVOR_DEFINITIONS.map((survivor) => [survivor.id, survivor]),
) as Record<SurvivorId, SurvivorDefinition>;

export const SURVIVOR_PASSENGER_REDUCED_THRESHOLD = 0.66;
export const SURVIVOR_PASSENGER_DISABLED_THRESHOLD = 0.33;
