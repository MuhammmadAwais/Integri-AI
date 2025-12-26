import React, { useEffect } from "react";
import { Plus, Box } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  fetchAgents,
  deleteAgent,
  openCreateModal,
  openEditModal,
  closeModal,
} from "../features/agents/agentsSlice";
import { cn } from "../lib/utils";
import Button from "../Components/ui/Button";
import AgentCard from "../features/agents/components/AgentCard";
import AgentModal from "../features/agents/components/AgentModal";
import SkeletonLoader from "../Components/ui/SkeletonLoader";

const Agents: React.FC = () => {
  const dispatch = useAppDispatch();

  // FIX 1: Retrieve 'editingAgent' from the store
  const { items, isLoading, error, isModalOpen, editingAgent } = useAppSelector(
    (state: any) => state.agents
  );

  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Initial fetch of agents
  useEffect(() => {
    if (token) {
      dispatch(fetchAgents(token));
    }
  }, [dispatch, token]);

  const handleDelete = (gpt_id: string) => {
    // FIX 2: Map 'gpt_id' to 'id' because the deleteAgent thunk expects { token, id }
    if (token) dispatch(deleteAgent({ token, id: gpt_id }));
  };

  // Callback to refresh the list after a successful Create or Edit action
  const handleSuccess = () => {
    if (token) {
      dispatch(fetchAgents(token));
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-6 lg:p-10",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1
            className={cn(
              "text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            My Alex Agents
          </h1>
          <p className={cn("mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
            Create and manage custom AI assistants tailored to your needs.
          </p>
        </div>

        {/* Open Modal for Creating a New Agent */}
        <Button onClick={() => dispatch(openCreateModal())}>
          <Plus size={20} className="mr-2" /> Create Agent
        </Button>
      </div>

      {/* Error State Display */}
      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          Error: {error}
        </div>
      )}

      {/* Grid Content */}
      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} className="h-64 w-full rounded-2xl" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((agent: any) => (
            <AgentCard
              key={agent.gpt_id}
              agent={agent}
              isDark={isDark}
              onEdit={(a) => dispatch(openEditModal(a))}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center opacity-60"
        >
          <Box size={64} className="mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Agents Created Yet</h3>
          <p className="max-w-sm mx-auto mb-6">
            Start by creating your first custom agent to automate tasks or
            roleplay specific scenarios.
          </p>
          <Button variant="outline" onClick={() => dispatch(openCreateModal())}>
            Create Your First Agent
          </Button>
        </motion.div>
      )}

      {/* FIX 3: Pass the 'editingAgent' prop to the modal so it can pre-fill data */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => dispatch(closeModal())}
        onSuccess={handleSuccess}
        token={token}
        agent={editingAgent}
        isDark={isDark}
      />
    </div>
  );
};

export default Agents;
