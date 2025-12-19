import axios from "axios";

const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "https://integri.cloud";

const backendApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH ---
export const getBackendToken = async (userId: any, email: any) => {
  try {
    const response = await backendApi.post("/api/v1/auth/token", {
      user_id: userId,
      email: email,
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ [API] Auth Failed:", error);
    throw error;
  }
};

// --- SESSIONS ---
export const SessionService = {
  getSessions: async (token: string) => {
    try {
      const response = await backendApi.get("/api/v1/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle both pagination { items: [] } and array []
      return Array.isArray(response.data)
        ? response.data
        : response.data.items || [];
    } catch (error) {
      console.error("❌ [API] Failed to get sessions", error);
      throw error;
    }
  },

  // Added: Get specific session to lock the model correctly
  getSession: async (token: string, sessionId: string) => {
    try {
      const response = await backendApi.get(`/api/v1/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to get single session", error);
      // Return null so we can fallback gracefully
      return null;
    }
  },

  // Fixed: Ensure PROVIDER is passed to backend
  createSession: async (token: string, model: string, provider: string) => {
    try {
      const response = await backendApi.post(
        "/api/v1/sessions",
        {
          model,
          provider,
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

  updateSession: async (token: string, sessionId: string, title: string) => {
    try {
      await backendApi.patch(
        `/api/v1/sessions/${sessionId}`,
        { title: title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error("❌ [API] Failed to rename session", e);
    }
  },

  getSessionMessages: async (token: string, sessionId: string) => {
    const response = await backendApi.get(
      `/api/v1/sessions/${sessionId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  deleteSession: async (token: string, sessionId: string) => {
    try {
      const response = await backendApi.delete(
        `/api/v1/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to delete session", error);
      throw error;
    }
  },

  deleteMessage: async (token: string, messageId: string) => {
    const response = await backendApi.delete(`/api/v1/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default backendApi;
