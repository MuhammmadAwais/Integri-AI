import axios from "axios";

// Custom Backend URL
const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "https://integri.cloud";

console.log("🌐 [API] Base URL configured as:", API_URL);

const backendApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH ---
export const getBackendToken = async (userId: any, email: any) => {
  console.log("🔐 [API] Requesting Backend Token for:", email);
  try {
    const response = await backendApi.post("/api/v1/auth/token", {
      user_id: userId,
      email: email,
    });
    console.log("✅ [API] Token Received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ [API] Auth Failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// --- SESSIONS (CHATS) ---
export const SessionService = {
  // Get list of chats
  getSessions: async (token: string) => {
    try {
      const response = await backendApi.get("/api/v1/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data)
        ? response.data
        : response.data.items || [];
    } catch (error) {
      console.error("❌ [API] Failed to get sessions", error);
      throw error;
    }
  },

  // Create new chat (UPDATED)
  createSession: async (token: string, model: string, provider: string) => {
    console.log(
      `✨ [API] Creating New Session. Model: ${model}, Provider: ${provider}`
    );
    try {
      const response = await backendApi.post(
        "/api/v1/sessions",
        {
          model,
          provider: provider, // Now dynamic
          is_voice_session: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to create session", error);
      throw error;
    }
  },

  // Rename Session
  updateSession: async (token: string, sessionId: string, title: string) => {
    try {
      await backendApi.patch(
        `/api/v1/sessions/${sessionId}`,
        { title: title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error("Failed to update session title", e);
    }
  },

  // Get message history
  getSessionMessages: async (token: string, sessionId: string) => {
    const response = await backendApi.get(
      `/api/v1/sessions/${sessionId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete chat
  deleteSession: async (token: string, sessionId: string) => {
    const response = await backendApi.delete(`/api/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Delete Message
  deleteMessage: async (token: string, messageId: string) => {
    const response = await backendApi.delete(`/api/v1/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default backendApi;
