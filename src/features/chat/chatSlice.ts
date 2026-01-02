import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AVAILABLE_MODELS, { VOICE_MODELS } from "../../../Constants";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";

  newChatModel: {
    id: string;
    provider: string;
  };

  voiceChatModel: {
    id: string;
    provider: string;
  };

  // --- NEW: Toggle for Voice Captions ---
  voiceShowCaptions: boolean;

  selectedAgentId: string | null;

  activeChatId: string | null;
  activeSessionConfig: {
    modelId: string;
    provider: string;
  } | null;

  playgroundModels: any[];
}

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  newChatModel: { id: "integri", provider: "openai" },
  voiceChatModel: {
    id: VOICE_MODELS[0].id,
    provider: VOICE_MODELS[0].provider,
  },
  // Default to hidden or visible as you prefer
  voiceShowCaptions: false,
  selectedAgentId: null,
  activeChatId: null,
  activeSessionConfig: null,
  playgroundModels: [AVAILABLE_MODELS[0], AVAILABLE_MODELS[1]],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setContextSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isContextSidebarOpen = action.payload;
    },
    setActiveSidebarTab: (
      state,
      action: PayloadAction<"home" | "history" | "library" | "settings">
    ) => {
      state.activeSidebarTab = action.payload;
    },
    setNewChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.newChatModel = action.payload;
    },
    setVoiceChatModel: (
      state,
      action: PayloadAction<{ id: string; provider: string }>
    ) => {
      state.voiceChatModel = action.payload;
    },
    // --- NEW: Action to Toggle Captions ---
    setVoiceShowCaptions: (state, action: PayloadAction<boolean>) => {
      state.voiceShowCaptions = action.payload;
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
  setVoiceChatModel,
  setVoiceShowCaptions, // Export new action
  setNewChatAgent,
  setActiveChat,
  setActiveSessionConfig,
  addPlaygroundModel,
  removePlaygroundModel,
} = chatSlice.actions;

export default chatSlice.reducer;
