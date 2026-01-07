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
      // Pass the derived isPremium status (from RC)
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.isPremium
      );

      console.log("Backend auth successful:", backendData);

      // 3. Return Both
      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// --- REGISTER THUNK ---
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      // 1. Register Firebase (Creates Firestore with defaults)
      const user = await AuthService.register(
        data.email,
        data.password,
        data.name
      );

      // 2. Get Token from Backend
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.isPremium
      );

      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// --- GOOGLE LOGIN THUNK ---
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Google Login (Returns isNewUser: true if Doc missing)
      const user = await AuthService.loginWithGoogle();

      // 2. Get Token from Backend
      const backendData = await getBackendToken(
        user.id,
        user.email,
        user.isPremium
      );

      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Google login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);
