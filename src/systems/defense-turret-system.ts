interface TurretPoint {
  x: number;
  y: number;
}

export interface TurretTarget {
  id: string;
  x: number;
  y: number;
  health: number;
  active: boolean;
}

export interface TurretShot {
  targetId: string;
  damage: number;
  origin: TurretPoint;
  target: TurretPoint;
}

export class DefenseTurretSystem {
  private level = 0;
  private elapsedMs = 0;

  public setLevel(level: number): void {
    this.level = Math.max(0, Math.floor(level));
  }

  public getLevel(): number {
    return this.level;
  }

  public getIntervalMs(): number {
    return Math.max(550, 1400 - Math.max(0, this.level - 1) * 150);
  }

  public update(deltaSeconds: number, origin: TurretPoint, targets: readonly TurretTarget[]): TurretShot | null {
    if (this.level <= 0) return null;
    this.elapsedMs += Math.max(0, deltaSeconds) * 1000;
    const intervalMs = this.getIntervalMs();
    if (this.elapsedMs < intervalMs) return null;

    const target = targets
      .filter((candidate) => candidate.active && candidate.health > 0)
      .reduce<TurretTarget | undefined>((nearest, candidate) => {
        if (!nearest) return candidate;
        return this.distance(origin, candidate) < this.distance(origin, nearest) ? candidate : nearest;
      }, undefined);
    if (!target) return null;

    this.elapsedMs -= intervalMs;
    return {
      targetId: target.id,
      damage: 6 * this.level,
      origin: { ...origin },
      target: { x: target.x, y: target.y },
    };
  }

  public reset(): void {
    this.level = 0;
    this.elapsedMs = 0;
  }

  private distance(a: TurretPoint, b: TurretPoint): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
