import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";

  // 1. User Preference (For NEW chats)
  newChatModel: {
    id: string;
    provider: string;
  };

  // 2. Active Session Data (LOCKED to the session)
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
  newChatModel: { id: "gpt-4o-mini", provider: "openai" }, // Default must exist in Constants
  activeChatId: null,
  activeSessionConfig: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
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

    // User selects model from Dropdown (Only affects future chats)
    setNewChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.newChatModel = action.payload;

      // Visual feedback: if on "New Chat" screen, update the UI immediately
      if (!state.activeChatId) {
        state.activeSessionConfig = {
          modelId: action.payload.id,
          provider: action.payload.provider,
        };
      }
    },

    // Navigate to a chat
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (action.payload === null) {
        // Reset config to user preference when clearing
        state.activeSessionConfig = {
          modelId: state.newChatModel.id,
          provider: state.newChatModel.provider,
        };
      }
    },

    // Lock the state when session details are loaded
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
