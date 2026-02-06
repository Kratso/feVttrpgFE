import type { Character } from "../api/types";

type StatRecord = Record<string, number>;

type ComplexStats = {
  baseStats?: StatRecord;
  growths?: StatRecord;
  bonusStats?: StatRecord;
  weaponRanks?: Record<string, string>;
};

export function getDisplayStats(stats: Character["stats"]): StatRecord {
  if (!stats || typeof stats !== "object") {
    return {};
  }

  if (typeof (stats as ComplexStats).baseStats === "object") {
    return (stats as ComplexStats).baseStats ?? {};
  }

  return stats as StatRecord;
}
