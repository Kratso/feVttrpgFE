import { vi } from "vitest";
import type { RootState } from "../store";

const baseState: RootState = {
  auth: {
    user: null,
    loading: false,
    error: null,
  },
  campaigns: {
    campaigns: [],
    selectedCampaignId: null,
    role: null,
    members: [],
    loading: false,
    error: null,
  },
  characters: {
    characters: [],
    loading: false,
    error: null,
  },
  maps: {
    maps: [],
    selectedMapId: null,
    map: null,
    tokens: [],
    loading: false,
    error: null,
  },
  classes: {
    classes: [],
    loading: false,
    error: null,
  },
  items: {
    items: [],
    loading: false,
    error: null,
  },
};

let state: RootState = baseState;

export const mockDispatch = vi.fn();

export const useAppDispatch = () => mockDispatch;
export const useAppSelector = <T>(selector: (state: RootState) => T) => selector(state);

export const setMockState = (overrides: Partial<RootState>) => {
  state = {
    ...baseState,
    ...overrides,
    auth: { ...baseState.auth, ...overrides.auth },
    campaigns: { ...baseState.campaigns, ...overrides.campaigns },
    characters: { ...baseState.characters, ...overrides.characters },
    maps: { ...baseState.maps, ...overrides.maps },
    classes: { ...baseState.classes, ...overrides.classes },
    items: { ...baseState.items, ...overrides.items },
  };
  mockDispatch.mockClear();
};

export const resetMockState = () => {
  state = baseState;
  mockDispatch.mockClear();
};
