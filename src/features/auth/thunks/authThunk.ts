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

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});

// Logout Thunk

