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

  // ADDED: Track selected Agent for new chats
  selectedAgentId: string | null;

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
  newChatModel: { id: "gpt-4o-mini", provider: "openai" },
  selectedAgentId: null, // Default to null (Standard Chat)
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

    // User selects model from Dropdown
    setNewChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.newChatModel = action.payload;
      // Reset agent if manually picking a model
      state.selectedAgentId = null;

      if (!state.activeChatId) {
        state.activeSessionConfig = {
          modelId: action.payload.id,
          provider: action.payload.provider,
        };
      }
    },

    // ADDED: User selects an Agent to chat with
    setNewChatAgent: (state, action: PayloadAction<string | null>) => {
      state.selectedAgentId = action.payload;
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
  setNewChatAgent,
  setActiveChat,
  setActiveSessionConfig,
} = chatSlice.actions;

export default chatSlice.reducer;
