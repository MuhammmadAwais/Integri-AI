import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";

  // GLOBAL PREFERENCE: What model to use when starting a NEW chat
  newChatModel: {
    id: string;
    provider: string;
  };

  // ACTIVE SESSION: The locked configuration of the current chat
  activeChatId: string | null;
  activeSessionConfig: {
    modelId: string;
    provider: string;
  } | null;
}

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  newChatModel: { id: "gpt-4o-mini", provider: "openai" }, // Default
  activeChatId: null,
  activeSessionConfig: null,
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
      state.isContextSidebarOpen = true;
    },

    // 2. Chat Controls
    // Called when user selects from Dropdown
    setNewChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.newChatModel = action.payload;

      // If we are in "New Chat" mode (no ID), update the UI immediately
      if (!state.activeChatId) {
        state.activeSessionConfig = {
          modelId: action.payload.id,
          provider: action.payload.provider,
        };
      }
    },

    // Called when clicking a chat in history
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (action.payload === null) {
        // Reset to global preference if clearing chat
        state.activeSessionConfig = {
          modelId: state.newChatModel.id,
          provider: state.newChatModel.provider,
        };
      }
    },

    // Called by useChat when session details are loaded
    setActiveSessionConfig: (
      state,
      action: PayloadAction<{ modelId: string; provider: string }>
    ) => {
      state.activeSessionConfig = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  setContextSidebarOpen,
  setActiveSidebarTab,
  setNewChatModel,
  setActiveChat,
  setActiveSessionConfig,
} = chatSlice.actions;

export default chatSlice.reducer;
