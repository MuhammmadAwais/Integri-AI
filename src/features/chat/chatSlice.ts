import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";
  currentModel: string; // e.g., "gpt-4o"
  activeChatId: string | null; // Tracks which chat user is looking at
}

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  currentModel: "gpt-3.5-turbo",
  activeChatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // 1. Sidebar Controls
    toggleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setContextSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isContextSidebarOpen = action.payload;
    },
    setActiveSidebarTab: (state, action: PayloadAction<any>) => {
      state.activeSidebarTab = action.payload;
      // Auto-open sidebar when switching tabs so user sees content
      state.isContextSidebarOpen = true;
    },

    // 2. Chat Controls
    setModel: (state, action: PayloadAction<string>) => {
      state.currentModel = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  setContextSidebarOpen,
  setActiveSidebarTab,
  setModel,
  setActiveChat,
} = chatSlice.actions;

export default chatSlice.reducer;
