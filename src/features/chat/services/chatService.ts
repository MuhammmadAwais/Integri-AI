import { SessionService } from "../../../api/backendApi";
import AVAILABLE_MODELS from "../../../../Constants"; // Adjust path

export const ChatService = {
  // 1. Create a New Chat (Uses Backend API)
  createChat: async (token: string, modelId: string = "gpt-5.1") => {
    try {
      // Lookup the provider
      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
      const provider = selectedModel ? selectedModel.provider : "openai";

      // Pass token, model, AND provider to backendApi
      const response = await SessionService.createSession(
        token,
        modelId,
        provider
      );
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
  sendMessage: async () => {
    console.warn(
      "⚠️ ChatService.sendMessage is deprecated. Messages are now sent via WebSocket in the useChat hook."
    );
    return null;
  },
};
