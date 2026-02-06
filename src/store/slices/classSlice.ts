import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { GameClass } from "../../api/types";

type ClassState = {
  classes: GameClass[];
  loading: boolean;
  error: string | null;
};

const initialState: ClassState = {
  classes: [],
  loading: false,
  error: null,
};

export const fetchClasses = createAsyncThunk("classes/fetchAll", async () => {
  const data = await apiFetch<{ classes: GameClass[] }>("/classes");
  return data.classes;
});

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load classes";
      });
  },
});

export default classSlice.reducer;
