import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AVAILABLE_MODELS, { VOICE_MODELS } from "../../../Constants";

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";

  // --- NEW: Global Sessions State ---
  sessions: any[];

  newChatModel: {
    id: string;
    provider: string;
  };

  voiceChatModel: {
    id: string;
    provider: string;
  };

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

  // Initialize empty sessions array
  sessions: [],

  newChatModel: { id: "integri", provider: "openai" },
  voiceChatModel: {
    id: VOICE_MODELS[0].id,
    provider: VOICE_MODELS[0].provider,
  },
  voiceShowCaptions: false,
  selectedAgentId: null,
  activeChatId: null,
  activeSessionConfig: null,
  playgroundModels: [AVAILABLE_MODELS[0], AVAILABLE_MODELS[5]], //INTEGRI AND GPT-4O-mini AS DEFAULT
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

    // --- NEW: Session Management Reducers ---

    // 1. Set all sessions (initial load)
    setSessions: (state, action: PayloadAction<any[]>) => {
      state.sessions = action.payload;
    },

    // 2. Add or Update Session (The "Upsert" Fix)
    addSession: (state, action: PayloadAction<any>) => {
      const newSession = action.payload;
      // Handle potential ID mismatch (backend uses session_id, frontend might use id)
      const id = newSession.session_id || newSession.id;

      // Check if session already exists
      const index = state.sessions.findIndex(
        (s) => (s.session_id || s.id) === id
      );

      if (index !== -1) {
        // UPDATE: Merge existing data with new data (fixes Title lag)
        state.sessions[index] = { ...state.sessions[index], ...newSession };
      } else {
        // INSERT: Prepend to list (fixes Duplicates)
        state.sessions.unshift(newSession);
      }
    },

    // 3. Remove Session
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(
        (s) => (s.session_id || s.id) !== action.payload
      );
    },

    // 4. Update Title Helper
    updateSessionTitle: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id, title } = action.payload;
      const index = state.sessions.findIndex(
        (s) => (s.session_id || s.id) === id
      );
      if (index !== -1) {
        state.sessions[index].title = title;
      }
    },

    // --- End Session Management ---

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
  setSessions, // Exported
  addSession, // Exported
  removeSession, // Exported
  updateSessionTitle, // Exported
  setNewChatModel,
  setVoiceChatModel,
  setVoiceShowCaptions,
  setNewChatAgent,
  setActiveChat,
  setActiveSessionConfig,
  addPlaygroundModel,
  removePlaygroundModel,
} = chatSlice.actions;

export default chatSlice.reducer;
