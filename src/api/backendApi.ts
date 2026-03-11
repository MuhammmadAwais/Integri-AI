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

  /** @deprecated Use FileService pipeline instead */
  uploadFile: async (token: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      const response = await backendApi.post("/api/v1/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response.data;
      let uploadedItem;
      if (Array.isArray(data) && data.length > 0) {
        uploadedItem = data[0];
      } else if (!Array.isArray(data)) {
        uploadedItem = data;
      }
      const fileId =
        uploadedItem?.file_id || uploadedItem?.id || uploadedItem?.data?.id;
      if (!fileId) throw new Error("No file ID returned from upload");
      return fileId.toString();
    } catch (error) {
      console.error("❌ [API] File Upload Failed:", error);
      throw error;
    }
  },
};

// --- FILE SERVICE (S3 High-Scale Pipeline) ---

export interface UploadUrlResponse {
  /** The presigned S3 PUT URL */
  url: string;
  s3_key: string;
  /** Pre-generated file_id from backend (may be returned alongside the URL) */
  file_id?: string;
}

export interface ProcessFileResponse {
  file_id: string;
}

export interface FileStatusResponse {
  file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  s3_key: string;
  /** "pending" | "processing" | "ready" | "error" */
  processing_status: string;
  uploaded_at: string;
}

export const FileService = {
  /**
   * Step 1: GET /api/v1/files/upload-url
   * Returns a presigned S3 upload URL and the s3_key.
   */
  getUploadUrl: async (
    token: string,
    filename: string,
    contentType: string
  ): Promise<UploadUrlResponse> => {
    try {
      const response = await backendApi.get<UploadUrlResponse>(
        "/api/v1/files/upload-url",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { filename, content_type: contentType },
        }
      );
      console.log("✅ [FileService] Got upload URL", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ [FileService] getUploadUrl failed", error?.response?.data ?? error);
      throw error;
    }
  },

  /**
   * Step 2: PUT file bytes directly to S3 presigned URL.
   * IMPORTANT: No Authorization header — this goes straight to AWS.
   */
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error(`S3 upload failed with status ${response.status}`);
      }
      console.log("✅ [FileService] File uploaded to S3");
    } catch (error) {
      console.error("❌ [FileService] uploadToS3 failed", error);
      throw error;
    }
  },

  /**
   * Step 3: POST /api/v1/files/process
   * Triggers background OCR. Returns file_id.
   */
  processFile: async (
    token: string,
    s3Key: string,
    filename: string,
    fileType: string,
    sessionId: string
  ): Promise<string> => {
    try {
      const response = await backendApi.post<string>(
        "/api/v1/files/process",
        { s3_key: s3Key, filename, file_type: fileType, session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ [FileService] processFile response", response.data);
      // Response is the file_id string directly per Swagger
      const fileId =
        typeof response.data === "string"
          ? response.data
          : (response.data as any)?.file_id ?? (response.data as any)?.id;
      if (!fileId) throw new Error("No file_id returned from processFile");
      return fileId.toString();
    } catch (error: any) {
      console.error("❌ [FileService] processFile failed", error?.response?.data ?? error);
      throw error;
    }
  },

  /**
   * Step 4: GET /api/v1/files/{file_id} — poll until processing_status === "ready".
   * Throws if status becomes "error" or max attempts exceeded.
   */
  pollFileStatus: async (
    token: string,
    fileId: string,
    intervalMs = 2000,
    maxAttempts = 45
  ): Promise<string> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await backendApi.get<{
          file_id: string;
          processing_status: string;
        }>(`/api/v1/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { processing_status } = response.data;
        console.log(
          `🔄 [FileService] Poll attempt ${attempt + 1}: status = ${processing_status}`
        );

        if (processing_status === "ready") {
          console.log("✅ [FileService] File is ready:", fileId);
          return fileId;
        }

        if (processing_status === "error") {
          throw new Error(`File processing failed for file_id: ${fileId}`);
        }

        // Still pending/processing — wait before next poll
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } catch (error: any) {
        // Re-throw processing errors; only retry on network errors
        if (error.message?.startsWith("File processing failed")) throw error;
        console.error(`❌ [FileService] Poll attempt ${attempt + 1} error`, error);
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    throw new Error(
      `File processing timed out after ${maxAttempts} attempts for file_id: ${fileId}`
    );
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
      // console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
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
      // console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
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
      // console.log(`✅ [MemoryService] DELETE ${url} succeeded`, response.data);
      {response}
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
      // console.log(`✅ [MemoryService] GET ${url} succeeded`, response.data);
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
      // console.log(`✅ [MemoryService] PATCH ${url} succeeded`, response.data);
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
      // console.log(`✅ [LimitsService] GET ${url} succeeded`, response.data);
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
      // console.log(`✅ [LimitsService] GET ${url} succeeded`);
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
