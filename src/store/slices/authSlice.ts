import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";
import type { User } from "../../api/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const data = await apiFetch<{ user: User | null }>("/auth/me", {
    skipUnauthorizedHandling: true,
  });
  return data.user ?? null;
});

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    await apiFetch("/auth/login", {
      method: "POST",
      skipUnauthorizedHandling: true,
      body: JSON.stringify(payload),
    });
    const data = await apiFetch<{ user: User | null }>("/auth/me");
    return data.user ?? null;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string; displayName: string }) => {
    await apiFetch("/auth/register", {
      method: "POST",
      skipUnauthorizedHandling: true,
      body: JSON.stringify(payload),
    });
    const data = await apiFetch<{ user: User | null }>("/auth/me");
    return data.user ?? null;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await apiFetch("/auth/logout", { method: "POST" });
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.error.message ?? "Failed to load session";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error.message ?? "Registration failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
