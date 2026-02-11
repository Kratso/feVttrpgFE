import { describe, expect, it } from "vitest";
import type { Character, CharacterSkill, Item } from "../api/types";
import { getBattleSkillSummaries, getDeterministicModifiers } from "./skills";

const buildCharacter = (overrides: Partial<Character>): Character => ({
  id: "char-1",
  name: "Ike",
  stats: { baseStats: { hp: 20, ability: 10 } },
  kind: "PLAYER",
  currentHp: 20,
  ...overrides,
});

const buildSkill = (name: string, overrides: Partial<CharacterSkill> = {}): CharacterSkill => ({
  id: `cs-${name}`,
  skillId: `skill-${name}`,
  skill: {
    id: `skill-${name}`,
    name,
  },
  ...overrides,
});

const buildWeapon = (overrides: Partial<Item>): Item => ({
  id: "weapon-1",
  name: "Weapon",
  type: "sword",
  category: "WEAPON",
  damageType: "PHYSICAL",
  ...overrides,
});

describe("skill utils", () => {
  it("activates Ira when under 50% HP", () => {
    const attacker = buildCharacter({ currentHp: 9, stats: { baseStats: { hp: 20, ability: 10 } } });
    const skill = buildSkill("Ira");

    const summaries = getBattleSkillSummaries([skill], attacker, null, null);

    expect(summaries[0].isActive).toBe(true);
    expect(summaries[0].modifiers?.crit).toBe(50);
  });

  it("calculates chance-based rates for Luna and Corona", () => {
    const attacker = buildCharacter({ stats: { baseStats: { hp: 20, ability: 10 } } });
    const skills = [buildSkill("Luna"), buildSkill("Corona")];

    const summaries = getBattleSkillSummaries(skills, attacker, null, null);

    expect(summaries[0].rate).toBe(5);
    expect(summaries[0].isChanceBased).toBe(true);
    expect(summaries[1].rate).toBe(5);
  });

  it("applies deterministic modifiers for Prodigio de las armas marciales", () => {
    const attacker = buildCharacter({ stats: { baseStats: { hp: 20, ability: 10 } } });
    const skill = buildSkill("Prodigio de las armas marciales");
    const weapon = buildWeapon({ type: "sword" });

    const summaries = getBattleSkillSummaries([skill], attacker, null, weapon);
    const mods = getDeterministicModifiers(summaries);

    expect(mods.damage).toBe(5);
  });
});
