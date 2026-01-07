import { SessionService } from "../../../api/backendApi";
import AVAILABLE_MODELS from "../../../../Constants";
import { triggerChatUpdate } from "../hooks/useChat";

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
      const provider = selectedModel ? selectedModel.provider : "openai";

      // Pass token, model, provider AND custom_gpt_id to backendApi
      const response = await SessionService.createSession(
        token,
        modelId,
        provider,
        custom_gpt_id
      );

      // --- REACTIVE UPDATE ---
      // Broadcast the full new session object immediately.
      // This allows the Sidebar to update without waiting for a re-fetch.
      triggerChatUpdate(response);

      return response.session_id;
    } catch (error) {
      console.error("Backend: Failed to create chat", error);
      throw error;
    }
  },

  deleteChat: async (token: string, chatId: string) => {
    try {
      await SessionService.deleteSession(token, chatId);
      // Trigger update without payload to force a refresh if needed
      // (Though useChatList optimistic delete handles this locally usually)
      triggerChatUpdate();
    } catch (error) {
      console.error("Backend: Failed to delete chat", error);
      throw error;
    }
  },
};
