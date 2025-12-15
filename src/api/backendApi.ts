import axios from "axios";

// Custom Backend URL
const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL ;

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
    console.error("Backend auth failed:", error);
    throw error;
  }
};

// --- SESSIONS (CHATS) ---
export const SessionService = {
  // Get list of chats
  getSessions: async (token: string) => {
    const response = await backendApi.get("/api/v1/sessions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Handle { items: [] } or [] response format
    return response.data;
  },

  // Create new chat
  createSession: async (token: string, model: string = "gpt-4o") => {
    const response = await backendApi.post(
      "/api/v1/sessions",
      { model, provider: "openai", is_voice_session: false },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
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
};

export default backendApi;
