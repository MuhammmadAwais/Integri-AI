// src/features/auth/slices/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type UserData } from "../services/authService";
import {
  loginUser,
  registerUser,
  logoutUser,
  loginWithGoogle,
} from "../thunks/authThunk";
// Import the subscription action to listen for it
import { purchaseSubscription } from "../../subscriptions/slices/subscriptionSlice";

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  error: null,
  isNewUser: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (
      state,
      action: PayloadAction<{
        user: UserData | null;
        accessToken: string | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isLoading = false;
    },
    completeOnboarding: (state) => {
      state.isNewUser = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- LOGIN ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isNewUser = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- REGISTER ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isNewUser = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- GOOGLE ---
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isNewUser = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- LOGOUT ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isLoading = false;
      })

      // --- SUBSCRIPTION INTEGRATION ---
      // When subscription is successful, update the local user state immediately
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isPremium = true;
          state.user.planId = action.payload; // payload contains the planId
        }
      });
  },
});

export const { setAuthUser, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
