import type { Character, Item } from "../api/types";
import { getItemRangeLabel } from "./item";

type StatRecord = Record<string, number>;

export type CombatStatEntry = {
  label: string;
  value: string | number;
};

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

export function getCombatStats(
  displayStats: StatRecord,
  weapon: Item | null
): CombatStatEntry[] {
  const str = displayStats.strength ?? 0;
  const mag = displayStats.intelligence ?? 0;
  const skl = displayStats.ability ?? displayStats.skill ?? 0;
  const spd = displayStats.agility ?? 0;
  const lck = displayStats.luck ?? 0;

  const weight = weapon?.weight ?? 0;
  const might = weapon?.might ?? 0;
  const weaponHit = weapon?.hit ?? (weapon ? 0 : 30);
  const weaponCrit = weapon?.crit ?? 0;
  const speedPenalty = Math.max(0, weight - str);
  const attackSpeed = spd - speedPenalty;

  const isMagic = weapon?.damageType === "MAGICAL";
  const atk = weapon ? (isMagic ? mag + might : str + might) : str;
  const hit = weaponHit + skl * 2 + lck;
  const avo = attackSpeed * 2 + lck;
  const crit = weaponCrit + Math.floor(skl / 2);
  const ddg = lck;
  const range = weapon ? getItemRangeLabel(weapon, { mag, fallback: "-" }) ?? "-" : "-";

  return [
    { label: "Atk", value: atk },
    { label: "Hit", value: hit },
    { label: "Crit", value: crit },
    { label: "AS", value: attackSpeed },
    { label: "Avo", value: avo },
    { label: "Ddg", value: ddg },
    { label: "Rng", value: range },
    { label: "Effect", value: "-" },
  ];
}
