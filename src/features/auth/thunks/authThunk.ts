import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../services/authService";

// Login Thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await AuthService.login(data.email, data.password);
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      return await AuthService.register(data.email, data.password, data.name);
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// Google Login Thunk
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.loginWithGoogle();
    } catch (error: any) {
      return rejectWithValue(error.message || "Google sign-in failed");
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});
