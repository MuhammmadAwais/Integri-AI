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
  date: string;
  messages: Message[];
  model: string; // Track model per chat
}
interface ChatState {
  isMobileMenuOpen: boolean;
  isContextSidebarOpen: boolean;
  activeSidebarTab: "home" | "history" | "library" | "settings";
  currentModel: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
}
// Load safely from LocalStorage
const loadSessions = (): ChatSession[] => {
  try {
    const saved = localStorage.getItem("integri-chats");
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    // Validation check to ensure it's an array
    if (!Array.isArray(parsed)) {
      console.warn("Storage corrupted, resetting.");
      return [];
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load chats:", e);
    return [];
  }
};

const initialState: ChatState = {
  isMobileMenuOpen: false,
  isContextSidebarOpen: true,
  activeSidebarTab: "home",
  currentModel: "GPT-4o",
  sessions: loadSessions(),
  activeSessionId: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // --- UI State ---
    toggleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setContextSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isContextSidebarOpen = action.payload;
    },
    setActiveSidebarTab: (state, action: PayloadAction<any>) => {
      state.activeSidebarTab = action.payload;
      // If switching tabs, ensure sidebar opens to show content
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
      // Prevent Duplicates
      if (state.sessions.some((s) => s.id === action.payload.id)) return;

      const newSession: ChatSession = {
        id: action.payload.id,
        title: action.payload.title,
        date: new Date().toISOString(),
        messages: [],
        model: state.currentModel,
      };
      state.sessions.unshift(newSession);
      state.activeSessionId = action.payload.id;
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

        // Smart Retitling: If title is default, update it using the user's first message
        if (
          session.title === "New Conversation" &&
          action.payload.message.role === "user"
        ) {
          const text = action.payload.message.content;
          session.title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        }
        localStorage.setItem("integri-chats", JSON.stringify(state.sessions));
      }
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      const index = state.sessions.findIndex((s) => s.id === action.payload);
      if (index !== -1) {
        // If deleting the CURRENTLY active chat, figure out where to go next
        if (state.activeSessionId === action.payload) {
          const nextSession =
            state.sessions[index + 1] || state.sessions[index - 1];
          state.activeSessionId = nextSession ? nextSession.id : null;
        }
        // Remove
        state.sessions.splice(index, 1);
        localStorage.setItem("integri-chats", JSON.stringify(state.sessions));
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
