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

export default backendApi;
