import type { RunState } from '../core/run-state';
import {
  SURVIVOR_BY_ID,
  SURVIVOR_DEFINITIONS,
  SURVIVOR_PASSENGER_DISABLED_THRESHOLD,
  SURVIVOR_PASSENGER_REDUCED_THRESHOLD,
} from '../data/survivor-config';
import type {
  SurvivorBenefitState,
  SurvivorDefinition,
  SurvivorId,
  SurvivorPassiveModifiers,
  SurvivorRescueResult,
} from '../entities/survivor/survivor-types';

export class SurvivorSystem {
  public getDefinition(id: SurvivorId): SurvivorDefinition | undefined {
    return Object.prototype.hasOwnProperty.call(SURVIVOR_BY_ID, id) ? SURVIVOR_BY_ID[id] : undefined;
  }

  public getAvailable(run: RunState): readonly SurvivorDefinition[] {
    return SURVIVOR_DEFINITIONS.filter((survivor) => !run.survivorIds.includes(survivor.id));
  }

  public has(run: RunState, id: SurvivorId): boolean {
    return run.survivorIds.includes(id);
  }

  public rescue(run: RunState, id: SurvivorId): SurvivorRescueResult {
    if (!this.getDefinition(id)) return { rescued: false, id, reason: 'INVALID', run };
    if (this.has(run, id)) return { rescued: false, id, reason: 'DUPLICATE', run };
    run.survivorIds.push(id);
    return { rescued: true, id, reason: 'RESCUED', run };
  }

  public getBenefitState(run: RunState): SurvivorBenefitState {
    const multiplier = this.getPassengerBenefitMultiplier(run);
    if (multiplier <= 0) return 'DISABLED';
    if (multiplier < 1) return 'REDUCED';
    return 'FULL';
  }

  public getPassiveModifiers(run: RunState): SurvivorPassiveModifiers {
    const benefitMultiplier = this.getPassengerBenefitMultiplier(run);
    let repairEffectivenessBonus = 0;
    let stationPurchaseDiscount = 0;
    let playerRecoveryPerSecond = 0;
    let playerRecoveryDelayMs = Number.POSITIVE_INFINITY;
    let defenseEffectivenessBonus = 0;

    for (const survivorId of run.survivorIds) {
      const survivor = this.getDefinition(survivorId as SurvivorId);
      if (!survivor) continue;
      switch (survivor.passive.type) {
        case 'REPAIR_EFFECTIVENESS':
          repairEffectivenessBonus += survivor.passive.bonus * benefitMultiplier;
          break;
        case 'STATION_PURCHASE_DISCOUNT':
          stationPurchaseDiscount += survivor.passive.discount * benefitMultiplier;
          break;
        case 'PLAYER_RECOVERY':
          playerRecoveryPerSecond += survivor.passive.amountPerSecond * benefitMultiplier;
          playerRecoveryDelayMs = Math.min(playerRecoveryDelayMs, survivor.passive.delayMs);
          break;
        case 'TRAIN_DEFENSE':
          defenseEffectivenessBonus += survivor.passive.bonus * benefitMultiplier;
          break;
      }
    }

    return {
      repairEffectivenessBonus,
      stationPurchaseDiscount: Math.min(1, Math.max(0, stationPurchaseDiscount)),
      playerRecoveryPerSecond,
      playerRecoveryDelayMs,
      defenseEffectivenessBonus,
      benefitMultiplier,
    };
  }

  public getStationCost(run: RunState, baseCost: number): number {
    const normalizedCost = Math.max(0, Math.floor(baseCost));
    const discount = this.getPassiveModifiers(run).stationPurchaseDiscount;
    return Math.max(0, Math.floor(normalizedCost * (1 - discount)));
  }

  public recoverPlayer(run: RunState, deltaSeconds: number, nowMs: number, lastDamageAtMs: number): number {
    const player = run.player;
    if (player.health <= 0 || player.health >= player.maxHealth) return 0;
    const modifiers = this.getPassiveModifiers(run);
    if (modifiers.playerRecoveryPerSecond <= 0 || nowMs - lastDamageAtMs < modifiers.playerRecoveryDelayMs) return 0;

    const beforeHealth = player.health;
    player.health = Math.min(
      player.maxHealth,
      player.health + modifiers.playerRecoveryPerSecond * Math.max(0, deltaSeconds),
    );
    return player.health - beforeHealth;
  }

  public getPassengerBenefitMultiplier(run: RunState): number {
    const passenger = run.train.find((section) => section.id === 'PASSENGER');
    if (!passenger || passenger.maxHp <= 0) return 0;
    const ratio = passenger.currentHp / passenger.maxHp;
    if (ratio <= SURVIVOR_PASSENGER_DISABLED_THRESHOLD) return 0;
    if (ratio <= SURVIVOR_PASSENGER_REDUCED_THRESHOLD) return 0.5;
    return 1;
  }
}
