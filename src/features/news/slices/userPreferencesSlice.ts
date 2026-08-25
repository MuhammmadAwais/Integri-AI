import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserPreferencesService, type UserPreferences } from "../../../api/backendApi";

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const fetchUserPreferences = createAsyncThunk<
  UserPreferences,
  string,
  { rejectValue: string }
>("userPreferences/fetch", async (token, { rejectWithValue }) => {
  try {
    return await UserPreferencesService.getPreferences(token);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.detail ?? err?.message ?? "Failed to fetch preferences"
    );
  }
});

export const updateUserPreferences = createAsyncThunk<
  UserPreferences,
  { token: string; prefs: Partial<UserPreferences> },
  { rejectValue: string }
>("userPreferences/update", async ({ token, prefs }, { rejectWithValue }) => {
  try {
    return await UserPreferencesService.updatePreferences(token, prefs);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.detail ?? err?.message ?? "Failed to update preferences"
    );
  }
});

// ─── Slice ─────────────────────────────────────────────────────────────────────

interface UserPreferencesState {
  preferences: UserPreferences | null;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
}

const initialState: UserPreferencesState = {
  preferences: null,
  status: "idle",
  error: null,
};

const userPreferencesSlice = createSlice({
  name: "userPreferences",
  initialState,
  reducers: {
    clearPreferences(state) {
      state.preferences = null;
      state.status = "idle";
      state.error = null;
    },
    // Optimistic update for instant UI response
    setPreferencesOptimistic(state, action: { payload: Partial<UserPreferences> }) {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      } else {
        state.preferences = action.payload as UserPreferences;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.status = "success";
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { clearPreferences, setPreferencesOptimistic } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
