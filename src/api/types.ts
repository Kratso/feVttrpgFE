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
  currentHp?: number | null;
  weaponSkills?: Array<{ weapon: string; rank: string }>;
  equippedWeaponItemId?: string | null;
  equippedWeaponItem?: CharacterItem | null;
  inventory?: CharacterItem[];
  skills?: CharacterSkill[];
  owner?: {
    id: string;
    displayName: string;
  };
};

export type CharacterItem = {
  id: string;
  itemId: string;
  uses?: number | null;
  sortOrder: number;
  item: Item;
};

export type Skill = {
  id: string;
  name: string;
  description?: string | null;
  activation?: string | null;
  bonusStats?: Record<string, number> | null;
  bonusDerived?: Record<string, number> | null;
};

export type CharacterSkill = {
  id: string;
  skillId: string;
  skill: Skill;
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
  imageUrl?: string | null;
  gridSizeX: number;
  gridSizeY: number;
  gridOffsetX: number;
  gridOffsetY: number;
  tileCountX?: number;
  tileCountY?: number;
  tileGrid?: Array<Array<string | null>> | null;
};

export type Token = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  character?: {
    id: string;
    name: string;
    stats?: CharacterStats;
    level?: number | null;
    currentHp?: number | null;
    equippedWeaponItem?: CharacterItem | null;
    owner?: {
      id: string;
      displayName: string;
    } | null;
  } | null;
};

export type Tile = {
  id: string;
  tileSetId: string;
  index: number;
  imageUrl: string;
};

export type TileSet = {
  id: string;
  name: string;
  imageUrl: string;
  tileSizeX: number;
  tileSizeY: number;
  columns: number;
  rows: number;
  tiles: Tile[];
};

export type TilePreset = {
  id: string;
  name: string;
  tileCountX: number;
  tileCountY: number;
  tileGrid: Array<Array<string | null>>;
  campaignId: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  entityType: "MAP" | "CHARACTER";
  entityId: string;
  action: string;
  before?: unknown | null;
  after?: unknown | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
  };
};

export type Item = {
  id: string;
  name: string;
  type: string;
  category: "ITEM" | "WEAPON";
  classRestriction?: string | null;
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
