import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { Skill } from "../../api/types";

type SkillState = {
  skills: Skill[];
  loading: boolean;
  error: string | null;
};

const initialState: SkillState = {
  skills: [],
  loading: false,
  error: null,
};

export const fetchSkills = createAsyncThunk("skills/fetchAll", async () => {
  const data = await apiFetch<{ skills: Skill[] }>("/skills");
  return data.skills;
});

const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load skills";
      });
  },
});

export default skillSlice.reducer;
