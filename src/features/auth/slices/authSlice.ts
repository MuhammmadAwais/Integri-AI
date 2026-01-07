import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type UserData } from "../services/authService";
import {
  loginUser,
  registerUser,
  logoutUser,
  loginWithGoogle,
} from "../thunks/authThunk";
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
      // If user exists but is marked new (missing country/lang), set flag
      if (action.payload.user?.isNewUser) {
        state.isNewUser = true;
      } else {
        state.isNewUser = false;
      }
      state.isLoading = false;
    },
    completeOnboarding: (state) => {
      state.isNewUser = false;
      if (state.user) {
        state.user.isNewUser = false;
      }
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
        state.isNewUser = !!action.payload.user.isNewUser;
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
        state.isNewUser = true; // Always true after fresh register
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
        state.isNewUser = !!action.payload.user.isNewUser;
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
        state.isNewUser = false;
      })

      // --- SUBSCRIPTION ---
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isPremium = true;
          state.user.planId = action.payload;
        }
      });
  },
});

export const { setAuthUser, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
