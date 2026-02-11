import type { Character, CharacterItem, GameClass, Item } from "../api/types";

export const WEAPON_RANK_ORDER = ["E", "D", "C", "B", "A", "S"] as const;

type Rank = (typeof WEAPON_RANK_ORDER)[number];

const normalizeRank = (rank: string | null | undefined): Rank | null => {
  if (!rank) return null;
  const trimmed = rank.trim().toUpperCase();
  return (WEAPON_RANK_ORDER as readonly string[]).includes(trimmed) ? (trimmed as Rank) : null;
};

const hasSufficientRank = (currentRank: string | null | undefined, requiredRank: string | null | undefined) => {
  const current = normalizeRank(currentRank);
  const required = normalizeRank(requiredRank ?? "E");
  if (!current || !required) return false;
  return WEAPON_RANK_ORDER.indexOf(current) >= WEAPON_RANK_ORDER.indexOf(required);
};

export const canEquipWeaponForCharacter = (
  character: Character | null | undefined,
  entry: CharacterItem
) => {
  if (!character?.className) return false;
  const item = entry.item;
  if (item.type?.toLowerCase() === "laguz") {
    if (item.classRestriction && item.classRestriction !== character.className) {
      return false;
    }
  }

  const currentRank = character.weaponSkills?.find(
    (skill) => skill.weapon.toLowerCase() === item.type?.toLowerCase()
  )?.rank;

  return hasSufficientRank(currentRank, item.weaponRank ?? "E");
};

export const canUseWeaponForClass = (gameClass: GameClass | null | undefined, item: Item) => {
  if (!gameClass?.weaponRanks) return false;
  if (item.classRestriction && item.classRestriction !== gameClass.name) return false;
  const weaponType = item.type?.toLowerCase() ?? "";
  const classRank = gameClass.weaponRanks?.[weaponType];
  if (!classRank || classRank === "-") return false;
  return hasSufficientRank(classRank, item.weaponRank ?? "E");
};
