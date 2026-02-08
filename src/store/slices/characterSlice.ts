import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { Character, CharacterItem, CharacterSkill } from "../../api/types";

type CharacterState = {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
};

const initialState: CharacterState = {
  characters: [],
  selectedCharacter: null,
  loading: false,
  detailLoading: false,
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
    stats: Record<string, number> | {
      baseStats?: Record<string, number>;
      growths?: Record<string, number>;
      bonusStats?: Record<string, number>;
      weaponRanks?: Record<string, string>;
    };
    ownerId?: string;
    kind?: "PLAYER" | "NPC" | "ENEMY";
    className?: string;
    level?: number;
    exp?: number;
    weaponSkills?: Array<{ weapon: string; rank: string }>;
  }) => {
    await apiFetch(`/campaigns/${payload.campaignId}/characters`, {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        stats: payload.stats,
        ownerId: payload.ownerId,
        kind: payload.kind,
        className: payload.className,
        level: payload.level,
        exp: payload.exp,
        weaponSkills: payload.weaponSkills,
      }),
    });
    const data = await apiFetch<{ characters: Character[] }>(`/campaigns/${payload.campaignId}/characters`);
    return data.characters;
  }
);

export const fetchCharacterDetail = createAsyncThunk(
  "characters/fetchDetail",
  async (characterId: string) => {
    const data = await apiFetch<{ character: Character }>(`/characters/${characterId}`);
    return data.character;
  }
);

export const addInventoryItem = createAsyncThunk(
  "characters/addInventoryItem",
  async (payload: { characterId: string; itemId: string; uses?: number | null }) => {
    const data = await apiFetch<{ inventoryItem: CharacterItem }>(`/characters/${payload.characterId}/inventory`, {
      method: "POST",
      body: JSON.stringify({ itemId: payload.itemId, uses: payload.uses ?? undefined }),
    });
    return { characterId: payload.characterId, inventoryItem: data.inventoryItem };
  }
);

export const removeInventoryItem = createAsyncThunk(
  "characters/removeInventoryItem",
  async (payload: { characterId: string; inventoryId: string }) => {
    await apiFetch(`/characters/${payload.characterId}/inventory/${payload.inventoryId}`, {
      method: "DELETE",
    });
    return payload;
  }
);

export const updateInventoryItem = createAsyncThunk(
  "characters/updateInventoryItem",
  async (payload: { characterId: string; inventoryId: string; uses?: number | null }) => {
    const data = await apiFetch<{ inventoryItem: CharacterItem }>(
      `/characters/${payload.characterId}/inventory/${payload.inventoryId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ uses: payload.uses ?? null }),
      }
    );
    return { characterId: payload.characterId, inventoryItem: data.inventoryItem };
  }
);

export const reorderInventory = createAsyncThunk(
  "characters/reorderInventory",
  async (payload: { characterId: string; orderedIds: string[] }) => {
    await apiFetch(`/characters/${payload.characterId}/inventory/order`, {
      method: "PUT",
      body: JSON.stringify({ orderedIds: payload.orderedIds }),
    });
    return payload;
  }
);

export const setEquippedWeapon = createAsyncThunk(
  "characters/setEquippedWeapon",
  async (payload: { characterId: string; inventoryId: string | null }) => {
    const data = await apiFetch<{ character: Character }>(`/characters/${payload.characterId}/equipped-weapon`, {
      method: "PUT",
      body: JSON.stringify({ inventoryId: payload.inventoryId }),
    });
    return data.character;
  }
);

export const updateCharacter = createAsyncThunk(
  "characters/update",
  async (payload: {
    characterId: string;
    name: string;
    stats: Record<string, number> | {
      baseStats?: Record<string, number>;
      growths?: Record<string, number>;
      bonusStats?: Record<string, number>;
      weaponRanks?: Record<string, string>;
    };
    ownerId?: string | null;
    kind: "PLAYER" | "NPC" | "ENEMY";
    className?: string | null;
    level: number;
    exp: number;
    weaponSkills?: Array<{ weapon: string; rank: string }>;
  }) => {
    const data = await apiFetch<{ character: Character }>(`/characters/${payload.characterId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: payload.name,
        stats: payload.stats,
        ownerId: payload.ownerId ?? null,
        kind: payload.kind,
        className: payload.className ?? null,
        level: payload.level,
        exp: payload.exp,
        weaponSkills: payload.weaponSkills ?? [],
      }),
    });
    return data.character;
  }
);

export const updateCharacterHp = createAsyncThunk(
  "characters/updateHp",
  async (payload: { characterId: string; currentHp: number }) => {
    const data = await apiFetch<{ character: Character }>(
      `/characters/${payload.characterId}/hp`,
      {
        method: "PATCH",
        body: JSON.stringify({ currentHp: payload.currentHp }),
      }
    );
    return data.character;
  }
);

export const addSkill = createAsyncThunk(
  "characters/addSkill",
  async (payload: { characterId: string; skillId: string }) => {
    const data = await apiFetch<{ characterSkill: CharacterSkill }>(
      `/characters/${payload.characterId}/skills`,
      {
        method: "POST",
        body: JSON.stringify({ skillId: payload.skillId }),
      }
    );
    return { characterId: payload.characterId, characterSkill: data.characterSkill };
  }
);

export const removeSkill = createAsyncThunk(
  "characters/removeSkill",
  async (payload: { characterId: string; characterSkillId: string }) => {
    await apiFetch(`/characters/${payload.characterId}/skills/${payload.characterSkillId}`, {
      method: "DELETE",
    });
    return payload;
  }
);

const sortInventory = (items: CharacterItem[]) =>
  [...items].sort((a, b) => a.sortOrder - b.sortOrder);

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
      .addCase(fetchCharacterDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCharacterDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedCharacter = action.payload;
      })
      .addCase(fetchCharacterDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message ?? "Failed to load character";
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.characters = action.payload;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        const next = [...(state.selectedCharacter.inventory ?? []), action.payload.inventoryItem];
        state.selectedCharacter.inventory = sortInventory(next);
      })
      .addCase(removeInventoryItem.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        state.selectedCharacter.inventory = (state.selectedCharacter.inventory ?? []).filter(
          (item) => item.id !== action.payload.inventoryId
        );
        if (state.selectedCharacter.equippedWeaponItemId === action.payload.inventoryId) {
          state.selectedCharacter.equippedWeaponItemId = null;
        }
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        state.selectedCharacter.inventory = (state.selectedCharacter.inventory ?? []).map((item) =>
          item.id === action.payload.inventoryItem.id ? action.payload.inventoryItem : item
        );
      })
      .addCase(reorderInventory.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        const orderIndex = new Map(action.payload.orderedIds.map((id, idx) => [id, idx]));
        state.selectedCharacter.inventory = (state.selectedCharacter.inventory ?? [])
          .map((item) => ({
            ...item,
            sortOrder: orderIndex.get(item.id) ?? item.sortOrder,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
      })
      .addCase(setEquippedWeapon.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.id) return;
        state.selectedCharacter.equippedWeaponItemId = action.payload.equippedWeaponItemId ?? null;
      })
      .addCase(updateCharacter.fulfilled, (state, action) => {
        state.selectedCharacter = action.payload;
        state.characters = state.characters.map((character) =>
          character.id === action.payload.id ? { ...character, ...action.payload } : character
        );
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        const existing = state.selectedCharacter.skills ?? [];
        state.selectedCharacter.skills = [...existing, action.payload.characterSkill];
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.characterId) return;
        state.selectedCharacter.skills = (state.selectedCharacter.skills ?? []).filter(
          (skill) => skill.id !== action.payload.characterSkillId
        );
      })
      .addCase(updateCharacterHp.fulfilled, (state, action) => {
        if (state.selectedCharacter?.id !== action.payload.id) return;
        state.selectedCharacter.currentHp = action.payload.currentHp ?? null;
        state.characters = state.characters.map((character) =>
          character.id === action.payload.id
            ? { ...character, currentHp: action.payload.currentHp ?? null }
            : character
        );
      });
  },
});

export default characterSlice.reducer;
