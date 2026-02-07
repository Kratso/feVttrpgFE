import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.ts";
import campaignReducer from "./slices/campaignSlice.ts";
import characterReducer from "./slices/characterSlice.ts";
import mapReducer from "./slices/mapSlice.ts";
import classReducer from "./slices/classSlice.ts";
import itemReducer from "./slices/itemSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
    characters: characterReducer,
    maps: mapReducer,
    classes: classReducer,
    items: itemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
