// src/features/subscription/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SubscriptionService } from "../services/SubscriptionService";

// Thunk to handle the async purchase
export const purchaseSubscription = createAsyncThunk(
  "subscription/purchase",
  async (
    { userId, planId }: { userId: string; planId: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await SubscriptionService.purchaseSubscription(
        userId,
        planId
      );
      return result; // Returns the planId
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to purchase subscription"
      );
    }
  }
);

interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SubscriptionState = {
  isLoading: false,
  error: null,
  successMessage: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(purchaseSubscription.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = "Subscription upgraded successfully!";
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscriptionMessages } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
