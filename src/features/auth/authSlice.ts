import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
// Check localStorage for persisting login across refreshes
const savedToken = localStorage.getItem("auth_token");
const savedUser = localStorage.getItem("auth_user");
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
  },
});
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export type { User, AuthState };
