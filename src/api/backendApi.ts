// src/api/backendApi.ts
import axios from "axios";

// axios instance custom backend
const backendApi = axios.create({
  baseURL:
    import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "https://integri.cloud",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Auth API
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

// 2. Session Service (This was missing!)
export const SessionService = {
  // Get all chat sessions for the sidebar
  getSessions: async (token: string) => {
    const response = await backendApi.get("/api/v1/sessions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Create a new chat session
  createSession: async (token: string, model: string = "gpt-4o") => {
    const response = await backendApi.post(
      "/api/v1/sessions",
      { model, provider: "openai" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get message history for a specific session
  getSessionMessages: async (token: string, sessionId: string) => {
    const response = await backendApi.get(
      `/api/v1/sessions/${sessionId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete a session
  deleteSession: async (token: string, sessionId: string) => {
    const response = await backendApi.delete(`/api/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default backendApi;
