import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../services/authService";
import { getBackendToken } from "../../../api/backendApi";

// --- LOGIN THUNK ---
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 1. Ask Firebase 
      const user = await AuthService.login(data.email, data.password);

      // 2. Ask Backend 
      // We send the ID we just got from Firebase
      const backendData = await getBackendToken(user.id, user.email);
      console.log("Backend auth successful:", backendData);
      // 3. Return BOTH (The User + The Token)
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
      // 1. Register with Firebase
      const user = await AuthService.register(
        data.email,
        data.password,
        data.name
      );

      // 2. Get Token from Backend
      const backendData = await getBackendToken(user.id, user.email);

      // 3. Return Both
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
      // Login with Google
      const user = await AuthService.loginWithGoogle();

      // Get Token from Backend
      const backendData = await getBackendToken(user.id, user.email);

      // Return Both
      return {
        user: user,
        accessToken: backendData.access_token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Google login failed");
    }
  }
);

// --- LOGOUT THUNK ---
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});
