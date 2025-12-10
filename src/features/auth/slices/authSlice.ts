import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type UserData } from "../services/authService";
import { loginUser, registerUser, logoutUser } from "../thunks/authThunk";

// --- STATE ---
interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean; // <--- The secret ingredient for your redirect flow
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isNewUser: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called by App.tsx when the page refreshes
    setAuthUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    // Called when user clicks "Get Started"
    completeOnboarding: (state) => {
      state.isNewUser = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isNewUser = false; // Login = No onboarding needed
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isNewUser = true; // <--- TRIGGER THE REDIRECT TO GETTING STARTED
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setAuthUser, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
