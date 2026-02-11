import { describe, expect, it } from "vitest";
import { buildBattleSummary, getWeaponTriangleBonus } from "./battle";
import type { Item } from "../api/types";

const buildWeapon = (overrides: Partial<Item>): Item => ({
  id: "weapon",
  name: "Weapon",
  type: "sword",
  category: "WEAPON",
  damageType: "PHYSICAL",
  ...overrides,
});

describe("battle utils", () => {
  it("applies weapon triangle bonuses", () => {
    expect(getWeaponTriangleBonus("sword", "axe")).toEqual({ damage: 1, hit: 10 });
    expect(getWeaponTriangleBonus("axe", "sword")).toEqual({ damage: -1, hit: -10 });
    expect(getWeaponTriangleBonus("bow", "sword")).toEqual({ damage: 0, hit: 0 });
  });

  it("computes physical damage, hit, and doubles", () => {
    const attackerWeapon = buildWeapon({
      type: "sword",
      might: 5,
      hit: 70,
      weight: 0,
    });
    const defenderWeapon = buildWeapon({
      id: "def-weapon",
      type: "axe",
      might: 3,
      hit: 60,
      weight: 0,
    });

    const summary = buildBattleSummary(
      {
        stats: { strength: 10, agility: 10, ability: 10, luck: 0 },
        weapon: attackerWeapon,
      },
      {
        stats: { constitution: 5, strength: 5, agility: 5, ability: 0, luck: 0 },
        weapon: defenderWeapon,
      }
    );

    expect(summary.atk).toBe(15);
    expect(summary.battleHit).toBe(90);
    expect(summary.damage).toBe(11);
    expect(summary.doubles).toBe(true);
  });

  it("uses wisdom for magical damage and effectiveness multiplier", () => {
    const attackerWeapon = buildWeapon({
      type: "light",
      damageType: "MAGICAL",
      might: 4,
      hit: 80,
      weight: 0,
      effectiveness: { multiplier: 2 },
    });

    const summary = buildBattleSummary(
      {
        stats: { intelligence: 8, agility: 8, ability: 6, luck: 0 },
        weapon: attackerWeapon,
      },
      {
        stats: { wisdom: 6, agility: 6, strength: 4, ability: 0, luck: 0 },
        weapon: null,
      }
    );

    expect(summary.damage).toBe(12);
  });
});
