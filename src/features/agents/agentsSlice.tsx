import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AgentService } from "../../api/backendApi";

// Types
export interface Agent {
  gpt_id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  created_at?: string;
}

interface AgentsState {
  items: Agent[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingAgent: Agent | null; // If null, we are creating. If set, we are editing.
}

const initialState: AgentsState = {
  items: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  editingAgent: null,
};

// Thunks
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
    return id; // Return ID to remove from state locally
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingAgent = null;
    },
    openEditModal: (state, action: PayloadAction<Agent>) => {
      state.isModalOpen = true;
      state.editingAgent = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingAgent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
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
      // Create
      .addCase(createAgent.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add new agent to top
        state.isModalOpen = false;
      })
      // Update
      .addCase(updateAgent.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a.gpt_id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.isModalOpen = false;
        state.editingAgent = null;
      })
      // Delete
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.gpt_id !== action.payload);
      });
  },
});

export const { openCreateModal, openEditModal, closeModal } =
  agentsSlice.actions;
export default agentsSlice.reducer;
