import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { CampaignSummary } from "../../api/types";

type CampaignState = {
  campaigns: CampaignSummary[];
  selectedCampaignId: string | null;
  role: "DM" | "PLAYER" | null;
  loading: boolean;
  error: string | null;
};

const initialState: CampaignState = {
  campaigns: [],
  selectedCampaignId: null,
  role: null,
  loading: false,
  error: null,
};

export const fetchCampaigns = createAsyncThunk("campaigns/fetchAll", async () => {
  const data = await apiFetch<{ campaigns: CampaignSummary[] }>("/campaigns");
  return data.campaigns;
});

export const createCampaign = createAsyncThunk(
  "campaigns/create",
  async (payload: { name: string }) => {
    const data = await apiFetch<{ campaign: CampaignSummary }>("/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.campaign;
  }
);

export const fetchCampaignRole = createAsyncThunk(
  "campaigns/fetchRole",
  async (campaignId: string) => {
    const data = await apiFetch<{ role: "DM" | "PLAYER" }>(`/campaigns/${campaignId}/role`);
    return { campaignId, role: data.role };
  }
);

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    selectCampaign(state, action: { payload: string | null }) {
      state.selectedCampaignId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
        if (!state.selectedCampaignId && action.payload.length > 0) {
          state.selectedCampaignId = action.payload[0].id;
        }
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load campaigns";
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns = [action.payload, ...state.campaigns];
      })
      .addCase(fetchCampaignRole.fulfilled, (state, action) => {
        state.role = action.payload.role;
      });
  },
});

export const { selectCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
