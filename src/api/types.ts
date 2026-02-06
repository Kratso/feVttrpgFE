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

export type Character = {
  id: string;
  name: string;
  stats: Record<string, number>;
  owner?: {
    id: string;
    displayName: string;
  };
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
