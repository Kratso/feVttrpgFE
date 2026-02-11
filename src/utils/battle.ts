import type { Item } from "../api/types";
import type { BattleModifiers } from "./skills";

export type StatRecord = Record<string, number>;

export type BattleSide = {
  stats: StatRecord;
  weapon: Item | null;
  modifiers?: BattleModifiers;
};

export type BattleSummary = {
  atk: number;
  hit: number;
  crit: number;
  attackSpeed: number;
  avoid: number;
  dodge: number;
  battleHit: number;
  battleCrit: number;
  damage: number;
  critDamage: number;
  doubles: boolean;
};

const advantageMap = new Map<string, string>([
  ["sword", "axe"],
  ["axe", "lance"],
  ["lance", "sword"],
  ["anima", "light"],
  ["light", "dark"],
  ["dark", "anima"],
]);

export const getWeaponTriangleBonus = (attackerType?: string | null, defenderType?: string | null) => {
  const attacker = attackerType?.toLowerCase() ?? "";
  const defender = defenderType?.toLowerCase() ?? "";
  if (!attacker || !defender) {
    return { damage: 0, hit: 0 };
  }
  if (advantageMap.get(attacker) === defender) {
    return { damage: 1, hit: 10 };
  }
  if (advantageMap.get(defender) === attacker) {
    return { damage: -1, hit: -10 };
  }
  return { damage: 0, hit: 0 };
};

const getEffectivenessMultiplier = (weapon: Item | null) => {
  if (!weapon?.effectiveness || typeof weapon.effectiveness !== "object") return 1;
  const value = (weapon.effectiveness as Record<string, unknown>).multiplier;
  return typeof value === "number" ? value : 1;
};

const getAttackSpeed = (stats: StatRecord, weapon: Item | null, mod: BattleModifiers | undefined) => {
  const str = stats.strength ?? 0;
  const spd = stats.agility ?? 0;
  const weight = weapon?.weight ?? 0;
  const speedPenalty = Math.max(0, weight - str);
  return spd - speedPenalty + (mod?.attackSpeed ?? 0);
};

const buildBaseStats = (stats: StatRecord, weapon: Item | null, mod: BattleModifiers | undefined) => {
  const str = stats.strength ?? 0;
  const mag = stats.intelligence ?? 0;
  const skl = stats.ability ?? stats.skill ?? 0;
  const lck = stats.luck ?? 0;
  const might = weapon?.might ?? 0;
  const weaponHit = weapon?.hit ?? (weapon ? 0 : 30);
  const weaponCrit = weapon?.crit ?? 0;

  const attackSpeed = getAttackSpeed(stats, weapon, mod);
  const isMagic = weapon?.damageType === "MAGICAL";
  const atk = weapon ? (isMagic ? mag + might : str + might) : str;
  const hit = weaponHit + skl * 2 + lck + (mod?.hit ?? 0);
  const crit = weaponCrit + Math.floor(skl / 2) + (mod?.crit ?? 0);
  const avoid = attackSpeed * 2 + lck + (mod?.avoid ?? 0);
  const dodge = lck + (mod?.dodge ?? 0);

  return { atk, hit, crit, avoid, dodge, attackSpeed };
};

export const buildBattleSummary = (attacker: BattleSide, defender: BattleSide): BattleSummary => {
  const attackBase = buildBaseStats(attacker.stats, attacker.weapon, attacker.modifiers);
  const defendBase = buildBaseStats(defender.stats, defender.weapon, defender.modifiers);
  const triangle = getWeaponTriangleBonus(attacker.weapon?.type, defender.weapon?.type);

  const targetDefense = attacker.weapon?.damageType === "MAGICAL"
    ? defender.stats.wisdom ?? 0
    : defender.stats.constitution ?? 0;

  const damageBonus = attacker.modifiers?.damage ?? 0;
  const rawDamage = attackBase.atk - targetDefense + triangle.damage + damageBonus;
  const effectiveness = getEffectivenessMultiplier(attacker.weapon);
  const damage = Math.max(0, Math.round(rawDamage * effectiveness));

  const battleHit = attackBase.hit - defendBase.avoid + triangle.hit;
  const battleCrit = attackBase.crit - defendBase.dodge;
  const critDamage = damage * 2;
  const doubles = attackBase.attackSpeed - defendBase.attackSpeed >= 3;

  return {
    atk: attackBase.atk,
    hit: attackBase.hit,
    crit: attackBase.crit,
    attackSpeed: attackBase.attackSpeed,
    avoid: defendBase.avoid,
    dodge: defendBase.dodge,
    battleHit,
    battleCrit,
    damage,
    critDamage,
    doubles,
  };
};
