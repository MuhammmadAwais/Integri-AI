// src/features/subscription/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SubscriptionService } from "../services/subscriptionService";
import { getBackendToken } from "../../../api/backendApi";
import type { SubscriptionTier } from "../../../../Constants";

// Thunk to handle the async purchase
export const purchaseSubscription = createAsyncThunk(
  "subscription/purchase",
  async (
    { userId, planId, email }: { userId: string; planId: string; email: string | null },
    { rejectWithValue }
  ) => {
    try {
      // 1. Purchase the subscription
      const newTier = await SubscriptionService.purchaseSubscription(
        userId,
        planId
      );
      
      // 2. Refresh backend token with new subscription tier
      let accessToken: string | null = null;
      if (email) {
        try {
          const tokenData = await getBackendToken(userId, email, newTier);
          accessToken = tokenData.access_token;
        } catch (tokenError) {
          console.error("Failed to refresh backend token after purchase:", tokenError);
          // Don't fail the purchase if token refresh fails, but log it
        }
      }
      
      return { tier: newTier, accessToken }; // Returns both tier and token
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
