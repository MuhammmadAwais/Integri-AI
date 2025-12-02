import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  currentModel: string;
  isMobileMenuOpen: boolean;
}

const initialState: ChatState = {
  currentModel: "GPT-4o Mini",
  isMobileMenuOpen: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setModel: (state, action: PayloadAction<string>) => {
      state.currentModel = action.payload;
    },
    toggleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
  },
});

export const { setModel, toggleMobileMenu } = chatSlice.actions;
export default chatSlice.reducer;
