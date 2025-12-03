import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string; // ISO string
  messages: Message[];
}

interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";
  currentModel: string;
  sessions: ChatSession[]; // Stores all chats
  activeSessionId: string | null;
}

// Load from localStorage if available (Persistence)
const loadChats = (): ChatSession[] => {
  const saved = localStorage.getItem("integri-chats");
  return saved ? JSON.parse(saved) : [];
};

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  currentModel: "GPT-4o",
  sessions: loadChats(),
  activeSessionId: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // --- UI Toggles ---
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
    setModel: (state, action: PayloadAction<string>) => {
      state.currentModel = action.payload;
    },

    // --- Chat Logic ---
    createNewChat: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const newSession: ChatSession = {
        id: action.payload.id,
        title: action.payload.title,
        date: new Date().toISOString(),
        messages: [],
      };
      state.sessions.unshift(newSession); // Add to top
      state.activeSessionId = action.payload.id;
      // Save to local storage
      localStorage.setItem("integri-chats", JSON.stringify(state.sessions));
    },

    addMessageToChat: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const session = state.sessions.find(
        (s) => s.id === action.payload.chatId
      );
      if (session) {
        session.messages.push(action.payload.message);
        // Auto-update title if it's the first user message and title is "New Conversation"
        if (
          session.messages.length === 1 &&
          session.title === "New Conversation" &&
          action.payload.message.role === "user"
        ) {
          session.title = action.payload.message.content.slice(0, 30) + "...";
        }
        localStorage.setItem("integri-chats", JSON.stringify(state.sessions));
      }
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
      localStorage.setItem("integri-chats", JSON.stringify(state.sessions));
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = null;
      }
    },
  },
});

export const {
  toggleMobileMenu,
  setContextSidebarOpen,
  setActiveSidebarTab,
  setModel,
  createNewChat,
  addMessageToChat,
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;
