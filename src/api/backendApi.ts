import axios from "axios";
import type { SubscriptionTier } from "../../Constants";

const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "https://integri.cloud";

const backendApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH ---


export const getBackendToken = async (
  userId: any,
  email: any,
  subscriptionTier: SubscriptionTier
) => {
  try {
    const response = await backendApi.post("/api/v1/auth/token", {
      user_id: userId,
      email: email,
      // Map the internal tier to what the backend expects
      user_type: subscriptionTier === 'free' ? "freemium" : subscriptionTier,
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

  

  // FIX 1: Added custom_gpt_id support for Agent Chatting
  createSession: async (
    token: string,
    model: string,
    provider: string,
    custom_gpt_id?: string | null, // Added optional param
    isVoice: boolean = false
  ) => {
    try {
      const payload = {
        model,
        provider,
        // If custom_gpt_id is provided, send it; otherwise null
        custom_gpt_id: custom_gpt_id || null,
        is_voice_session: isVoice,
      };
      console.log(payload)
      const response = await backendApi.post("/api/v1/sessions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // FIX 2: Updated URL to match screenshot: /sessions/{id}/messages/{id}
  deleteMessage: async (
    token: string,
    sessionId: string,
    messageId: string
  ) => {
    try {
      const response = await backendApi.delete(
        `/api/v1/sessions/${sessionId}/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to delete message", error);
      throw error;
    }
  },

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
      conversation_starters?: string[];
      recommended_model: string;
      recommended_provider: string;
    }
  ) => {
    try {
      const payload = {
        name: agentData.name,
        description: agentData.description,
        instructions: agentData.instructions,
        conversation_starters:
          agentData.conversation_starters?.length
            ? agentData.conversation_starters
            : [agentData.name],
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
        agentData,
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

  // --- NEW: KNOWLEDGE DOCUMENTS ---

  getAgentDocuments: async (token: string, gpt_id: string) => {
    try {
      const response = await backendApi.get(
        `/api/v1/custom-gpts/${gpt_id}/knowledge`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const document_responce = response.data;
      console.log("Document responce:", document_responce.documents);
      return Array.isArray(document_responce.documents)
        ? document_responce.documents
        : [];
    } catch (error) {
      console.error("❌ [API] Failed to fetch agent documents", error);
      throw error;
    }
  },

  uploadAgentDocuments: async (
    token: string,
    gpt_id: string,
    files: File[]
  ) => {
    try {
      const formData = new FormData();
      // Documentation shows 'files' as an array
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await backendApi.post(
        `/api/v1/custom-gpts/${gpt_id}/knowledge`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [API] Failed to upload agent documents", error);
      throw error;
    }
  },

  deleteAgentDocument: async (
    token: string,
    gpt_id: string,
    document_id: string
  ) => {
    try {
      await backendApi.delete(
        `/api/v1/custom-gpts/${gpt_id}/knowledge/${document_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return true;
    } catch (error) {
      console.error("❌ [API] Failed to delete agent document", error);
      throw error;
    }
  },

  clearAgentKnowledge: async (token: string, gpt_id: string) => {
    try {
      await backendApi.post(
        `/api/v1/custom-gpts/${gpt_id}/knowledge/clear`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return true;
    } catch (error) {
      console.error("❌ [API] Failed to clear agent knowledge", error);
      throw error;
    }
  },
};

// --- MEMORY AND PREFERENCES ---
export interface MemoryStats {
  user_id: string;
  has_memory: boolean;
  version: number;
  created_at: string;
  last_updated: string;
  memory_size_bytes: number;
  notable_facts_count: number;
  topics_count: number;
  domains_count: number;
  has_preferences: boolean;
  has_context: boolean;
  llm_usage: Record<string, unknown>;
}

export interface MemoryDataPayload {
  user_id: string;
  memory_data: Record<string, unknown>;
  updated_at: string;
  version: number;
}

export interface UserPreferencesPayload {
  disable_memory_extraction?: boolean;
  theme?: string;
  language?: string;
}

export const MemoryService = {
  /**
   * GET /api/v1/users/memory
   * Retrieves the global memory for the authenticated user (no user_id required).
   */
  getMemory: async (token: string): Promise<MemoryDataPayload> => {
    const url = "/api/v1/users/memory";
    console.log(`🧠 [MemoryService] GET ${url}`);
    try {
      const response = await backendApi.get<MemoryDataPayload>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [MemoryService] GET ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },

  /**
   * GET /api/v1/users/{user_id}/memory/stats
   * Retrieves memory stats for a specific user. Requires userId path param.
   */
  getMemoryStats: async (token: string, userId: string): Promise<MemoryStats> => {
    const url = `/api/v1/users/${userId}/memory/stats`;
    console.log(`🧠 [MemoryService] GET ${url}`);
    try {
      const response = await backendApi.get<MemoryStats>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [MemoryService] GET ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },

  /**
   * DELETE /api/v1/users/{user_id}/memory
   * Deletes all memory for a specific user. Requires userId path param.
   */
  deleteMemory: async (token: string, userId: string): Promise<void> => {
    const url = `/api/v1/users/${userId}/memory`;
    console.log(`🧠 [MemoryService] DELETE ${url}`);
    try {
      const response = await backendApi.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [MemoryService] DELETE ${url} succeeded`, response.data);
    } catch (error: any) {
      console.error(
        `❌ [MemoryService] DELETE ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },

  /**
   * GET /api/v1/users/me/preferences
   * Retrieves preferences for the currently authenticated user.
   */
  getPreferences: async (token: string): Promise<UserPreferencesPayload> => {
    const url = "/api/v1/users/me/preferences";
    console.log(`🧠 [MemoryService] GET ${url}`);
    try {
      const response = await backendApi.get<UserPreferencesPayload>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [MemoryService] GET ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },

  /**
   * PATCH /api/v1/users/me/preferences
   * Updates preferences for the currently authenticated user.
   */
  updatePreferences: async (
    token: string,
    preferences: UserPreferencesPayload
  ): Promise<UserPreferencesPayload> => {
    const url = "/api/v1/users/me/preferences";
    console.log(`🧠 [MemoryService] PATCH ${url}`, preferences);
    try {
      const response = await backendApi.patch<UserPreferencesPayload>(url, preferences, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [MemoryService] PATCH ${url} succeeded`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [MemoryService] PATCH ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },
};

// --- USER LIMITS ---

export interface UserLimits {
  tier: string;
  is_ads_enabled: boolean;
  daily_messages_used: number;
  daily_message_limit: number;
  daily_messages_remaining: number;
  daily_limit_resets_at: string;
  is_daily_limit_reached: boolean;
  voice_minutes_used: number;
  voice_limit_minutes: number;
  images_generated_this_month: number;
  image_generation_limit: number;
  can_use_pdf_chat: boolean;
  can_use_google_ocr: boolean;
  max_agents: number;
  current_agents_count: number;
  allowed_models: string[];
}

export const LimitsService = {
  getLimits: async (token: string): Promise<UserLimits> => {
    const url = "/api/v1/me/limits";
    console.log(`🔒 [LimitsService] GET ${url}`);
    try {
      const response = await backendApi.get<UserLimits>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [LimitsService] GET ${url} succeeded`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [LimitsService] GET ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },

  getApiStats: async (token: string): Promise<string> => {
    const url = "/api/v1/me/api-stats";
    console.log(`🔒 [LimitsService] GET ${url}`);
    try {
      const response = await backendApi.get<string>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ [LimitsService] GET ${url} succeeded`);
      return response.data;
    } catch (error: any) {
      console.error(
        `❌ [LimitsService] GET ${url} failed — status: ${error?.response?.status}`,
        error?.response?.data ?? error
      );
      throw error;
    }
  },
};

export default backendApi;
