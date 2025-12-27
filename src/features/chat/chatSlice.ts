
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AVAILABLE_MODELS from "../../../Constants";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";

  newChatModel: {
    id: string;
    provider: string;
  };

  selectedAgentId: string | null;

  activeChatId: string | null;
  activeSessionConfig: {
    modelId: string;
    provider: string;
  } | null;

  // ADDED: Playground state
  playgroundModels: any[];
}

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  newChatModel: { id: "gpt-4o-mini", provider: "openai" },
  selectedAgentId: null,
  activeChatId: null,
  activeSessionConfig: null,
  // Initial models for the playground
  playgroundModels: [
    AVAILABLE_MODELS[0],
    AVAILABLE_MODELS.length > 1 ? AVAILABLE_MODELS[1] : AVAILABLE_MODELS[0],
  ],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // ... existing reducers
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
    setNewChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.newChatModel = action.payload;
      state.selectedAgentId = null;
      if (!state.activeChatId) {
        state.activeSessionConfig = {
          modelId: action.payload.id,
          provider: action.payload.provider,
        };
      }
    },
    setNewChatAgent: (state, action: PayloadAction<string | null>) => {
      state.selectedAgentId = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (action.payload === null) {
        state.activeSessionConfig = {
          modelId: state.newChatModel.id,
          provider: state.newChatModel.provider,
        };
      }
    },
    setActiveSessionConfig: (
      state,
      action: PayloadAction<{ modelId: string; provider: string }>
    ) => {
      state.activeSessionConfig = action.payload;
    },

    // ADDED: Playground Reducers
    addPlaygroundModel: (state, action: PayloadAction<any>) => {
      state.playgroundModels.push(action.payload);
    },
    removePlaygroundModel: (state, action: PayloadAction<number>) => {
      state.playgroundModels.splice(action.payload, 1);
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
  addPlaygroundModel,
  removePlaygroundModel,
} = chatSlice.actions;

export default chatSlice.reducer;
