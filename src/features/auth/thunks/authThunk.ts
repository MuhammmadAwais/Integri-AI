import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../services/authService";
import { getBackendToken } from "../../../api/backendApi";

// --- LOGIN THUNK ---
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 1. Firebase Login & RevenueCat Check (No Firestore Write)
      const user = await AuthService.login(data.email, data.password);

      // 2. Ask Backend
      // UPDATED: Pass subscriptionTier instead of isPremium
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.subscriptionTier,
      );

      // 3. Return Both
      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

// --- REGISTER THUNK ---
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      // 1. Register Firebase (Creates Firestore with defaults)
      const user = await AuthService.register(
        data.email,
        data.password,
        data.name,
      );

      // 2. Get Token from Backend
      // UPDATED: Pass subscriptionTier
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.subscriptionTier,
      );

      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  },
);

// --- GOOGLE LOGIN THUNK ---
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Google Login — throws NewUserBlockedError if no Firestore doc
      const user = await AuthService.loginWithGoogle();

      // 2. Get Token from Backend (only reached for existing users)
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.subscriptionTier,
      );

      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      // Distinguish new-user-blocked from generic errors
      if (error?.code === "NEW_USER_BLOCKED" || error?.name === "NewUserBlockedError") {
        return rejectWithValue("NEW_USER_BLOCKED");
      }
      return rejectWithValue(error.message || "Google login failed");
    }
  },
);

// --- LOGOUT THUNK ---
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});
