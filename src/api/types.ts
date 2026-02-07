export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type CampaignSummary = {
  id: string;
  name: string;
  role: "DM" | "PLAYER";
};

export type CharacterStats =
  | Record<string, number>
  | {
      baseStats?: Record<string, number>;
      growths?: Record<string, number>;
      bonusStats?: Record<string, number>;
      weaponRanks?: Record<string, string>;
    };

export type Character = {
  id: string;
  name: string;
  stats: CharacterStats;
  kind: "PLAYER" | "NPC" | "ENEMY";
  className?: string | null;
  level?: number | null;
  exp?: number | null;
  weaponSkills?: Array<{ weapon: string; rank: string }>;
  owner?: {
    id: string;
    displayName: string;
  };
};

export type CampaignMember = {
  id: string;
  role: "DM" | "PLAYER";
  user: {
    id: string;
    email: string;
    displayName: string;
  };
};

export type GameClass = {
  id: string;
  name: string;
  description?: string | null;
  baseStats?: Record<string, number>;
  growths?: Record<string, number>;
  maxStats?: Record<string, number>;
  weaponRanks?: Record<string, string>;
  promotesTo?: string[];
  skills?: string[];
  types?: string[];
  powerBonus?: number;
  expBonus?: number;
};

export type MapInfo = {
  id: string;
  name: string;
  imageUrl: string;
  gridSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
};

export type Token = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
};

export type Item = {
  id: string;
  name: string;
  type: string;
  category: "ITEM" | "WEAPON";
  damageType?: "PHYSICAL" | "MAGICAL" | null;
  weaponRank?: string | null;
  might?: number | null;
  hit?: number | null;
  crit?: number | null;
  weight?: number | null;
  minRange?: number | null;
  maxRange?: number | null;
  rangeFormula?: string | null;
  weaponExp?: number | null;
  effectiveness?: Record<string, unknown> | null;
  bonus?: Record<string, unknown> | null;
  uses?: number | null;
  price?: number | null;
  description?: string | null;
};
