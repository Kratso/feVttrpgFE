import type { GameClass } from "../api/types";

type StatRecord = Record<string, number>;

type Growths = Record<string, number> | undefined;

type GrowthOptions = {
  baseStats: StatRecord;
  growths?: Growths;
  level: number;
};

export const applyGrowths = (baseStats: StatRecord, growths: Growths, delta: number) => {
  if (!growths || delta === 0) return { ...baseStats };
  const next: StatRecord = { ...baseStats };
  Object.keys(baseStats).forEach((key) => {
    const growth = growths[key] ?? 0;
    const adjustment = Math.round((delta * growth) / 100);
    next[key] = (baseStats[key] ?? 0) + adjustment;
  });
  return next;
};

export const getStatsAtLevel = ({ baseStats, growths, level }: GrowthOptions) => {
  const delta = Math.max(0, level - 1);
  return applyGrowths(baseStats, growths, delta);
};

export const getClassStatsAtLevel = (
  gameClass: GameClass | null | undefined,
  level: number,
  fallbackBase: StatRecord
) => {
  if (!gameClass) return { ...fallbackBase };
  const baseStats = { ...fallbackBase, ...(gameClass.baseStats ?? {}) };
  return getStatsAtLevel({ baseStats, growths: gameClass.growths ?? undefined, level });
};
