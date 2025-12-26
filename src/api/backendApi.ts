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

  getSession: async (token: string, sessionId: string) => {
    try {
      const response = await backendApi.get(`/api/v1/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to get single session", error);
      return null;
    }
  },

  createSession: async (token: string, model: string, provider: string, isVoice: boolean =false) => {
    try {
      const response = await backendApi.post(
        "/api/v1/sessions",
        {
          model,
          provider,
          is_voice_session: isVoice,
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
    try {
      const response = await backendApi.get(
        `/api/v1/sessions/${sessionId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.messages)) return data.messages;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    } catch (error) {
      console.error("❌ [API] Failed to fetch session messages", error);
      return [];
    }
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

  // FIXED: Upload File Logic matching Documentation and Dart snippet
  uploadFile: async (token: string, file: File) => {
    try {
      const formData = new FormData();
      // FIX 1: Documentation image shows param name is 'files' (plural/array)
      formData.append("files", file);

      // FIX 2: Endpoint is /api/v1/files/upload (not /api/v1/files)
      const response = await backendApi.post("/api/v1/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      console.log("File upload response data:", data);
      // FIX 3: Parse Array Response [{ "file_id": "...", ... }]
      // Logic mirrors Dart: e["file_id"] ?? e["id"]
      let uploadedItem;
      if (Array.isArray(data) && data.length > 0) {
        uploadedItem = data[0];
      } else if (!Array.isArray(data)) {
        // Fallback for single object response just in case
        uploadedItem = data;
      }

      const fileId =
        uploadedItem?.file_id || uploadedItem?.id || uploadedItem?.data?.id;

      if (!fileId) {
        throw new Error("No file ID returned from upload");
      }

      return fileId.toString();
    } catch (error) {
      console.error("❌ [API] File Upload Failed:", error);
      throw error;
    }
  },
};

// --- AGENTS  ---
export const AgentService = {
  getAgents: async (token: string) => {
    try {
      const response = await backendApi.get("/api/v1/custom-gpts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data)
        ? response.data
        : response.data.items || [];
    } catch (error) {
      console.error("❌ [API] Failed to fetch agents", error);
      throw error;
    }
  },

  getAgentById: async (token: string, agentId: string) => {
    try {
      const response = await backendApi.get(`/api/v1/custom-gpts/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to fetch agent details", error);
      throw error;
    }
  },

  createAgent: async (
    token: string,
    agentData: {
      name: string;
      description: string;
      instructions: string;
      conversation_starters?: string[]; // Added array of strings
      recommended_model: string;        // Renamed from 'model'
      recommended_provider: string;     // Added provider
    }
  ) => {
    try {
      // Ensure we send exactly what the API expects
      const payload = {
        name: agentData.name,
        description: agentData.description,
        instructions: agentData.instructions,
        conversation_starters: agentData.conversation_starters || [], // Default to empty array if undefined
        recommended_model: agentData.recommended_model,
        recommended_provider: agentData.recommended_provider,
      };

      const response = await backendApi.post("/api/v1/custom-gpts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to create agent", error);
      throw error;
    }
  },

  updateAgent: async (
    token: string,
    agentId: string,
    agentData: Partial<{
      name: string;
      description: string;
      instructions: string;
      conversation_starters: string[];
      recommended_model: string;
      recommended_provider: string;
    }>
  ) => {
    try {
      const response = await backendApi.patch(
        `/api/v1/custom-gpts/${agentId}`,
        agentData, // Make sure the caller passes the correct keys here too
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to update agent", error);
      throw error;
    }
  },

  deleteAgent: async (token: string, gpt_id: string) => {
    try {
      await backendApi.delete(`/api/v1/custom-gpts/${gpt_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      console.error("❌ [API] Failed to delete agent", error);
      throw error;
    }
  },
};

export default backendApi;
