import { SessionService } from "../../../api/backendApi";

/**
 * REFACTORED: This service now communicates with your Custom Backend.
 * OpenAI and Firebase logic has been completely removed.
 */
export const ChatService = {
  // 1. Create a New Chat (Uses Backend API)
  createChat: async (token: string, model: string = "gpt-4o") => {
    try {
      const response = await SessionService.createSession(token, model);
      return response.session_id;
    } catch (error) {
      console.error("Backend: Failed to create chat", error);
      throw error;
    }
  },

  // 2. Delete Chat (Uses Backend API)
  deleteChat: async (token: string, chatId: string) => {
    try {
      await SessionService.deleteSession(token, chatId);
    } catch (error) {
      console.error("Backend: Failed to delete chat", error);
      throw error;
    }
  },

  // 3. Send Message -> DEPRECATED
  // Real-time messages must go through WebSocket (see useChat.ts), not a REST API service.
  sendMessage: async () => {
    console.warn(
      "⚠️ ChatService.sendMessage is deprecated. Messages are now sent via WebSocket in the useChat hook."
    );
    return null;
  },
};
