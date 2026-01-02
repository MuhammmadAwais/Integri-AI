import { SessionService } from "../../../api/backendApi";
import AVAILABLE_MODELS from "../../../../Constants";

export const ChatService = {
  // 1. Create a New Chat (Uses Backend API)
  createChat: async (
    token: string,
    modelId: string = "gpt-5.1",
    custom_gpt_id?: string
  ) => {
    try {
      // Lookup the provider
      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
      // Default to openai if not found, or use the model's defined provider
      const provider = selectedModel ? selectedModel.provider : "openai";

      // Pass token, model, provider AND custom_gpt_id to backendApi
      const response = await SessionService.createSession(
        token,
        modelId,
        provider,
        custom_gpt_id
      );
      
      return response.session_id;
    } catch (error) {
      console.error("Backend: Failed to create chat", error);
      throw error;
    }
  },

  deleteChat: async (token: string, chatId: string) => {
    try {
      await SessionService.deleteSession(token, chatId);
    } catch (error) {
      console.error("Backend: Failed to delete chat", error);
      throw error;
    }
  },
};
