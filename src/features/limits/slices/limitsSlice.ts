import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LimitsService, type UserLimits } from "../../../api/backendApi";

// ─── Async thunk ──────────────────────────────────────────────────────────────
export const fetchLimits = createAsyncThunk<
  UserLimits,
  string,
  { rejectValue: string }
>("limits/fetchLimits", async (token, { rejectWithValue }) => {
  try {
    return await LimitsService.getLimits(token);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.detail ?? err?.message ?? "Failed to fetch limits"
    );
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
interface LimitsState {
  limits: UserLimits | null;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  lastFetchedAt: number | null; // timestamp — for debouncing refetches
}

const initialState: LimitsState = {
  limits: null,
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

const limitsSlice = createSlice({
  name: "limits",
  initialState,
  reducers: {
    // Optimistic increment after image generation – keeps the count accurate
    // without a network round-trip
    incrementImageCount(state) {
      if (state.limits) {
        state.limits.images_generated_this_month += 1;
        state.limits.image_generation_limit = Math.max(
          0,
          state.limits.image_generation_limit - 1
        );
      }
    },
    // Optimistic decrement of daily messages remaining
    decrementMessages(state) {
      if (state.limits) {
        state.limits.daily_messages_used += 1;
        state.limits.daily_messages_remaining = Math.max(
          0,
          state.limits.daily_messages_remaining - 1
        );
      }
    },
    // Called after a live voice session tick to keep minutes accurate
    addVoiceSeconds(state, action: { payload: number }) {
      if (state.limits) {
        state.limits.voice_minutes_used += action.payload / 60;
      }
    },
    clearLimits(state) {
      state.limits = null;
      state.status = "idle";
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLimits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLimits.fulfilled, (state, action) => {
        state.limits = action.payload;
        state.status = "success";
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchLimits.rejected, (state, action) => {
        // Graceful degradation: keep any existing limits, just flag error
        state.status = "error";
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { incrementImageCount, decrementMessages, addVoiceSeconds, clearLimits } =
  limitsSlice.actions;

export default limitsSlice.reducer;
