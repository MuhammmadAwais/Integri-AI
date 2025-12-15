import axios from "axios";

// Custom Backend URL
const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL ;

console.log("🌐 [API] Base URL configured as:", API_URL); // DEBUG LOG

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
    // console.log("📂 [API] Fetching Sessions..."); // Optional: Uncomment if too noisy
    try {
      const response = await backendApi.get("/api/v1/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to get sessions", error);
      throw error;
    }
  },

  // Create new chat
  createSession: async (token: string, model: string = "gpt-4o") => {
    console.log("✨ [API] Creating New Session with model:", model);
    try {
      const response = await backendApi.post(
        "/api/v1/sessions",
        { model, provider: "openai", is_voice_session: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ [API] Session Created:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to create session", error);
      throw error;
    }
  },

  // Get message history
  getSessionMessages: async (token: string, sessionId: string) => {
    console.log(`📜 [API] Fetching history for ${sessionId}`);
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
