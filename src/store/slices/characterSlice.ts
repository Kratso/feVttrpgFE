import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { Character } from "../../api/types";

type CharacterState = {
  characters: Character[];
  loading: boolean;
  error: string | null;
};

const initialState: CharacterState = {
  characters: [],
  loading: false,
  error: null,
};

export const fetchCharacters = createAsyncThunk(
  "characters/fetch",
  async (campaignId: string) => {
    const data = await apiFetch<{ characters: Character[] }>(`/campaigns/${campaignId}/characters`);
    return data.characters;
  }
);

export const createCharacter = createAsyncThunk(
  "characters/create",
  async (payload: {
    campaignId: string;
    name: string;
    stats: Record<string, number>;
    ownerId?: string;
    kind?: "PLAYER" | "NPC" | "ENEMY";
  }) => {
    await apiFetch(`/campaigns/${payload.campaignId}/characters`, {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        stats: payload.stats,
        ownerId: payload.ownerId,
        kind: payload.kind,
      }),
    });
    const data = await apiFetch<{ characters: Character[] }>(`/campaigns/${payload.campaignId}/characters`);
    return data.characters;
  }
);

const characterSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load characters";
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.characters = action.payload;
      });
  },
});

export default characterSlice.reducer;
