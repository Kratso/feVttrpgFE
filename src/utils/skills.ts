import type { Character, CharacterSkill, Item } from "../api/types";
import { getDisplayStats } from "./character";

type StatRecord = Record<string, number>;

type SkillContext = {
  attacker: Character;
  defender?: Character | null;
  weapon: Item | null;
  attackerStats: StatRecord;
  defenderStats: StatRecord;
  currentHp: number;
  maxHp: number;
};

export type BattleModifiers = {
  hit?: number;
  crit?: number;
  damage?: number;
  avoid?: number;
  dodge?: number;
  attackSpeed?: number;
};

export type BattleSkillSummary = {
  id: string;
  name: string;
  description?: string | null;
  rate: number | null;
  isChanceBased: boolean;
  isActive: boolean;
  effectText?: string;
  modifiers?: BattleModifiers;
};

const normalizeSkillName = (value: string) => value.trim().toLowerCase();

const getSkillStat = (stats: StatRecord) => stats.ability ?? stats.skill ?? 0;

const buildSummary = (entry: CharacterSkill, base: Omit<BattleSkillSummary, "id" | "name">) => ({
  id: entry.skill.id,
  name: entry.skill.name,
  description: entry.skill.description ?? null,
  ...base,
});

export const getBattleSkillSummaries = (
  skills: CharacterSkill[],
  attacker: Character,
  defender: Character | null,
  weapon: Item | null
) => {
  const attackerStats = getDisplayStats(attacker.stats);
  const defenderStats = getDisplayStats(defender?.stats ?? {});
  const maxHp = attackerStats.hp ?? 0;
  const currentHp = attacker.currentHp ?? maxHp;
  const ctx: SkillContext = {
    attacker,
    defender,
    weapon,
    attackerStats,
    defenderStats,
    currentHp,
    maxHp,
  };

  return skills.map((entry) => {
    const name = normalizeSkillName(entry.skill.name);

    if (name === "ira") {
      const active = maxHp > 0 && currentHp / maxHp < 0.5;
      return buildSummary(entry, {
        rate: active ? 100 : 0,
        isChanceBased: false,
        isActive: active,
        effectText: "+50 crit under 50% HP",
        modifiers: active ? { crit: 50 } : undefined,
      });
    }

    if (name === "luna") {
      const rate = Math.floor(getSkillStat(attackerStats) / 2);
      return buildSummary(entry, {
        rate,
        isChanceBased: true,
        isActive: rate > 0,
        effectText: "Proc: doubles Str, ignores Def",
      });
    }

    if (name === "corona") {
      const rate = Math.floor(getSkillStat(attackerStats) / 2);
      return buildSummary(entry, {
        rate,
        isChanceBased: true,
        isActive: rate > 0,
        effectText: "Proc: ignores Res, -10 enemy Hit",
      });
    }

    if (name === "prodigio de las armas marciales") {
      const weaponType = weapon?.type?.toLowerCase() ?? "";
      const active = ["sword", "lance", "axe"].includes(weaponType);
      return buildSummary(entry, {
        rate: active ? 100 : 0,
        isChanceBased: false,
        isActive: active,
        effectText: "+5 damage with sword/lance/axe",
        modifiers: active ? { damage: 5 } : undefined,
      });
    }

    return buildSummary(entry, {
      rate: null,
      isChanceBased: false,
      isActive: false,
    });
  });
};

export const getDeterministicModifiers = (summaries: BattleSkillSummary[]) => {
  return summaries.reduce<BattleModifiers>((mods, entry) => {
    if (!entry.modifiers || entry.isChanceBased || !entry.isActive) return mods;
    return {
      hit: (mods.hit ?? 0) + (entry.modifiers.hit ?? 0),
      crit: (mods.crit ?? 0) + (entry.modifiers.crit ?? 0),
      damage: (mods.damage ?? 0) + (entry.modifiers.damage ?? 0),
      avoid: (mods.avoid ?? 0) + (entry.modifiers.avoid ?? 0),
      dodge: (mods.dodge ?? 0) + (entry.modifiers.dodge ?? 0),
      attackSpeed: (mods.attackSpeed ?? 0) + (entry.modifiers.attackSpeed ?? 0),
    };
  }, {});
};
