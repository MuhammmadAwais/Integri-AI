import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { AgentService } from "../../api/backendApi";

// Types
export interface Agent {
  gpt_id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  created_at?: string;
  conversation_starters?: string[];
  recommended_model?: string;
}

export interface AgentDocument {
  file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  processing_status: string;
}

interface AgentsState {
  items: Agent[];
  documents: AgentDocument[]; // Current documents for the viewed/edited agent
  isLoading: boolean;
  isDocsLoading: boolean; // Loading state for documents
  error: string | null;
  isModalOpen: boolean;
  editingAgent: Agent | null;
}

const initialState: AgentsState = {
  items: [],
  documents: [],
  isLoading: false,
  isDocsLoading: false,
  error: null,
  isModalOpen: false,
  editingAgent: null,
};

// --- Thunks ---

export const fetchAgents = createAsyncThunk(
  "agents/fetch",
  async (token: string) => {
    return await AgentService.getAgents(token);
  }
);

export const createAgent = createAsyncThunk(
  "agents/create",
  async ({ token, data }: { token: string; data: any }) => {
    return await AgentService.createAgent(token, data);
  }
);

export const updateAgent = createAsyncThunk(
  "agents/update",
  async ({ token, id, data }: { token: string; id: string; data: any }) => {
    return await AgentService.updateAgent(token, id, data);
  }
);

export const deleteAgent = createAsyncThunk(
  "agents/delete",
  async ({ token, id }: { token: string; id: string }) => {
    await AgentService.deleteAgent(token, id);
    return id;
  }
);

// --- Document Thunks ---

export const fetchAgentDocuments = createAsyncThunk(
  "agents/fetchDocs",
  async ({ token, gpt_id }: { token: string; gpt_id: string }) => {
    return await AgentService.getAgentDocuments(token, gpt_id);
  }
);

export const uploadAgentDocuments = createAsyncThunk(
  "agents/uploadDocs",
  async ({
    token,
    gpt_id,
    files,
  }: {
    token: string;
    gpt_id: string;
    files: File[];
  }) => {
    const response = await AgentService.uploadAgentDocuments(
      token,
      gpt_id,
      files
    );
    // The API might return the list of uploaded files, or just a success message.
    return response;
  }
);

export const deleteAgentDocument = createAsyncThunk(
  "agents/deleteDoc",
  async ({
    token,
    gpt_id,
    document_id,
  }: {
    token: string;
    gpt_id: string;
    document_id: string;
  }) => {
    await AgentService.deleteAgentDocument(token, gpt_id, document_id);
    return document_id;
  }
);

export const clearAgentKnowledge = createAsyncThunk(
  "agents/clearDocs",
  async ({ token, gpt_id }: { token: string; gpt_id: string }) => {
    await AgentService.clearAgentKnowledge(token, gpt_id);
    return;
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingAgent = null;
      state.documents = []; // Clear docs
    },
    openEditModal: (state, action: PayloadAction<Agent>) => {
      state.isModalOpen = true;
      state.editingAgent = action.payload;
      state.documents = []; // Clear previous docs while we fetch new ones
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingAgent = null;
      state.documents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Agents
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch agents";
      })
      // Create Agent
      .addCase(createAgent.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isModalOpen = false;
      })
      // Update Agent
      .addCase(updateAgent.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (a) => a.gpt_id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.isModalOpen = false;
        state.editingAgent = null;
      })
      // Delete Agent
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.gpt_id !== action.payload);
      })

      // --- Documents ---
      .addCase(fetchAgentDocuments.pending, (state) => {
        state.isDocsLoading = true;
      })
      .addCase(fetchAgentDocuments.fulfilled, (state, action) => {
        state.isDocsLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchAgentDocuments.rejected, (state) => {
        state.isDocsLoading = false;
        // error handling if needed
      })

      // Upload Docs (Optimistic update or re-fetch handled in component)
      .addCase(uploadAgentDocuments.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.documents = [...state.documents, ...action.payload];
        }
      })

      // Delete Doc
      .addCase(deleteAgentDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(
          (d) => d.file_id !== action.payload
        );
      })

      // Clear Docs
      .addCase(clearAgentKnowledge.fulfilled, (state) => {
        state.documents = [];
      });
  },
});

export const { openCreateModal, openEditModal, closeModal } =
  agentsSlice.actions;
export default agentsSlice.reducer;
