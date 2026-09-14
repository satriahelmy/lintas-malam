import type { RunState, TrainSectionId } from '../core/run-state';
import { UPGRADE_BY_ID, UPGRADE_DEFINITIONS, UPGRADE_OFFER_ENEMY_MILESTONE } from '../data/upgrade-config';
import type { UpgradeApplicationResult, UpgradeDefinition, UpgradeId } from '../entities/upgrade/upgrade-types';
import { TrainSystem } from '../entities/train/train-system';

export class UpgradeSystem {
  public getLevel(run: RunState, id: UpgradeId): number {
    return run.upgradeIds.filter((upgradeId) => upgradeId === id).length;
  }

  public getDefinition(id: UpgradeId): UpgradeDefinition {
    return UPGRADE_BY_ID[id];
  }

  public getAvailable(run: RunState): readonly UpgradeDefinition[] {
    return UPGRADE_DEFINITIONS.filter((definition) => this.getLevel(run, definition.id) < definition.maxLevel);
  }

  public createOffer(run: RunState, randomValue = Math.random): readonly UpgradeDefinition[] {
    const pool = [...this.getAvailable(run)];
    const offer: UpgradeDefinition[] = [];
    while (pool.length > 0 && offer.length < 3) {
      const index = Math.floor(Math.max(0, Math.min(0.999999, randomValue())) * pool.length);
      offer.push(pool.splice(index, 1)[0]);
    }
    return offer;
  }

  public applyUpgrade(run: RunState, trainSystem: TrainSystem, id: UpgradeId): UpgradeApplicationResult {
    const definition = UPGRADE_BY_ID[id];
    const currentLevel = this.getLevel(run, id);
    if (!definition || currentLevel >= definition.maxLevel) return { applied: false, id, level: currentLevel };

    run.upgradeIds.push(id);
    const level = currentLevel + 1;
    switch (definition.effect.type) {
      case 'PLAYER_FIRE_RATE':
        run.player.fireRate = this.roundStat(run.player.fireRate * definition.effect.multiplier);
        break;
      case 'PLAYER_DAMAGE':
        run.player.damage = this.roundStat(run.player.damage * definition.effect.multiplier);
        break;
      case 'PLAYER_RANGE':
        run.player.weaponRange = this.roundStat(run.player.weaponRange * definition.effect.multiplier);
        break;
      case 'TRAIN_MAX_HP':
        this.reinforceTrain(run, definition.effect.multiplier);
        break;
      case 'TRAIN_REPAIR': {
        const section = this.getMostDamagedSection(run);
        if (!section) return { applied: true, id, level };
        const repairedAmount = trainSystem.repair(section.id, definition.effect.amount);
        return { applied: true, id, level, repairedSection: section.id, repairedAmount };
      }
      case 'DEFENSE_TURRET':
        break;
    }
    return { applied: true, id, level };
  }

  private reinforceTrain(run: RunState, multiplier: number): void {
    for (const section of run.train) {
      const previousMaxHp = section.maxHp;
      section.maxHp = this.roundStat(previousMaxHp * multiplier);
      const maxHpIncrease = section.maxHp - previousMaxHp;
      section.currentHp = Math.min(section.maxHp, section.currentHp + maxHpIncrease);
    }
  }

  private getMostDamagedSection(run: RunState): { id: TrainSectionId; currentHp: number; maxHp: number } | undefined {
    return run.train.reduce<typeof run.train[number] | undefined>((mostDamaged, section) => {
      if (!mostDamaged) return section;
      const sectionRatio = section.maxHp > 0 ? section.currentHp / section.maxHp : 0;
      const damagedRatio = mostDamaged.maxHp > 0 ? mostDamaged.currentHp / mostDamaged.maxHp : 0;
      return sectionRatio < damagedRatio ? section : mostDamaged;
    }, undefined);
  }

  private roundStat(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

export class UpgradeOfferDirector {
  private nextEnemyMilestone = UPGRADE_OFFER_ENEMY_MILESTONE;

  public shouldOffer(run: RunState): boolean {
    return run.enemiesDefeated >= this.nextEnemyMilestone;
  }

  public markOfferShown(): void {
    this.nextEnemyMilestone += UPGRADE_OFFER_ENEMY_MILESTONE;
  }

  public reset(): void {
    this.nextEnemyMilestone = UPGRADE_OFFER_ENEMY_MILESTONE;
  }
}
