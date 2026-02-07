import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { MapInfo, Token } from "../../api/types";

type MapState = {
  maps: MapInfo[];
  selectedMapId: string | null;
  map: MapInfo | null;
  tokens: Token[];
  loading: boolean;
  error: string | null;
};

const initialState: MapState = {
  maps: [],
  selectedMapId: null,
  map: null,
  tokens: [],
  loading: false,
  error: null,
};

export const fetchMaps = createAsyncThunk("maps/fetchAll", async (campaignId: string) => {
  const data = await apiFetch<{ maps: MapInfo[] }>(`/campaigns/${campaignId}/maps`);
  return data.maps;
});

export const fetchMapDetail = createAsyncThunk("maps/fetchDetail", async (mapId: string) => {
  const data = await apiFetch<{ map: MapInfo }>(`/maps/${mapId}`);
  return data.map;
});

export const fetchTokens = createAsyncThunk("maps/fetchTokens", async (mapId: string) => {
  const data = await apiFetch<{ tokens: Token[] }>(`/maps/${mapId}/tokens`);
  return data.tokens;
});

export const createMap = createAsyncThunk(
  "maps/create",
  async (payload: {
    campaignId: string;
    name: string;
    imageUrl?: string | null;
    tileCountX?: number;
    tileCountY?: number;
    tileGrid?: Array<Array<string | null>> | null;
    gridSizeX: number;
    gridSizeY: number;
  }) => {
    await apiFetch(`/campaigns/${payload.campaignId}/maps`, {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        imageUrl: payload.imageUrl ?? undefined,
        tileCountX: payload.tileCountX,
        tileCountY: payload.tileCountY,
        tileGrid: payload.tileGrid ?? undefined,
        gridSizeX: payload.gridSizeX,
        gridSizeY: payload.gridSizeY,
      }),
    });
    const data = await apiFetch<{ maps: MapInfo[] }>(`/campaigns/${payload.campaignId}/maps`);
    return data.maps;
  }
);

export const updateMap = createAsyncThunk(
  "maps/update",
  async (payload: {
    mapId: string;
    gridSizeX?: number;
    gridSizeY?: number;
    gridOffsetX?: number;
    gridOffsetY?: number;
    tileCountX?: number;
    tileCountY?: number;
    tileGrid?: Array<Array<string | null>> | null;
  }) => {
    const data = await apiFetch<{ map: MapInfo }>(`/maps/${payload.mapId}`, {
      method: "PUT",
      body: JSON.stringify({
        gridSizeX: payload.gridSizeX,
        gridSizeY: payload.gridSizeY,
        gridOffsetX: payload.gridOffsetX,
        gridOffsetY: payload.gridOffsetY,
        tileCountX: payload.tileCountX,
        tileCountY: payload.tileCountY,
        tileGrid: payload.tileGrid ?? undefined,
      }),
    });
    return data.map;
  }
);

export const createToken = createAsyncThunk(
  "maps/createToken",
  async (payload: { mapId: string; label: string; x: number; y: number; color: string }) => {
    await apiFetch(`/maps/${payload.mapId}/tokens`, {
      method: "POST",
      body: JSON.stringify({
        label: payload.label,
        x: payload.x,
        y: payload.y,
        color: payload.color,
      }),
    });
    const data = await apiFetch<{ tokens: Token[] }>(`/maps/${payload.mapId}/tokens`);
    return data.tokens;
  }
);

const mapSlice = createSlice({
  name: "maps",
  initialState,
  reducers: {
    selectMap(state, action: { payload: string | null }) {
      state.selectedMapId = action.payload;
    },
    updateToken(state, action: { payload: Token }) {
      state.tokens = state.tokens.map((token) =>
        token.id === action.payload.id ? action.payload : token
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaps.fulfilled, (state, action) => {
        state.loading = false;
        state.maps = action.payload;
        if (!state.selectedMapId && action.payload.length > 0) {
          state.selectedMapId = action.payload[0].id;
        }
      })
      .addCase(fetchMaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load maps";
      })
      .addCase(fetchMapDetail.fulfilled, (state, action) => {
        state.map = action.payload;
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(createMap.fulfilled, (state, action) => {
        state.maps = action.payload;
      })
      .addCase(createToken.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(updateMap.fulfilled, (state, action) => {
        state.map = action.payload;
        state.maps = state.maps.map((map) => (map.id === action.payload.id ? action.payload : map));
      });
  },
});

export const { selectMap, updateToken } = mapSlice.actions;
export default mapSlice.reducer;
