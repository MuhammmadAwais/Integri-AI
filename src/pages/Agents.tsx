import React, { useEffect, useState } from "react";
import { Plus, Box, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  fetchAgents,
  fetchPublicAgents,
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
import ParticleBackground from "../Components/ui/ParticleBackground";
import SystemToolCard from "../features/agents/components/SystemToolCard";
import LoginModal from "../features/auth/components/LoginModal";

const Agents: React.FC = () => {
  const dispatch = useAppDispatch();

  // Retrieve 'editingAgent' and agents from the store
  const {
    items,
    publicItems,
    isLoading,
    isPublicLoading,
    error,
    publicError,
    isModalOpen,
    editingAgent,
  } = useAppSelector((state: any) => state.agents);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const user = useAppSelector((state: any) => state.auth.user);

  const [activeTab, setActiveTab] = useState<"my" | "public" | "system">("my");

  // Initial fetch of user's own agents if they aren't loaded yet
  useEffect(() => {
    if (token && items.length === 0 && !isLoading) {
      dispatch(fetchAgents(token));
    }
  }, [dispatch, token, items.length, isLoading]);

  // Initial fetch of public agents if they aren't loaded yet
  useEffect(() => {
    if (token && publicItems.length === 0 && !isPublicLoading) {
      dispatch(fetchPublicAgents(token));
    }
  }, [dispatch, token, publicItems.length, isPublicLoading]);

  const handleDelete = (gpt_id: string) => {
    // Map 'gpt_id' to 'id' because the deleteAgent thunk expects { token, id }
    if (token) dispatch(deleteAgent({ token, id: gpt_id }));
  };

  // Callback to refresh the list after a successful Create or Edit action
  const handleSuccess = () => {
    if (token) {
      dispatch(fetchAgents(token));
    }
  };

  const handleRefresh = () => {
    if (token) {
      dispatch(fetchAgents(token));
      dispatch(fetchPublicAgents(token));
    }
  };

  const handleopenCreateModal = () => {
    if (!user?.id) {
      setShowLoginModal(true);
    } else {
      dispatch(openCreateModal());
    }
  };

  const handleTabChange = (tab: "my" | "public" | "system") => {
    if (!user?.id) {
      setShowLoginModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-6 lg:p-10",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <ParticleBackground />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1
            className={cn(
              "text-3xl font-bold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {activeTab === "my" ? "My Alex Agents" : activeTab === "system" ? "System Tools" : "Public Agents"}
          </h1>
          <p className={cn("mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
            {activeTab === "my"
              ? "Create and manage custom AI assistants tailored to your needs."
              : activeTab === "system"
              ? "Access native system utilities and advanced processing tools."
              : "Discover and chat with pre-built AI assistants."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div
            className={cn(
              "flex p-1 border rounded-md",
              isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-100"
            )}
          >
            <button
              onClick={() => handleTabChange("my")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer rounded-sm",
                activeTab === "my"
                  ? isDark
                    ? "bg-zinc-800 text-white font-bold"
                    : "bg-white text-zinc-900 shadow-sm font-bold"
                  : isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              My Agents
            </button>
            <button
              onClick={() => handleTabChange("public")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer rounded-sm",
                activeTab === "public"
                  ? isDark
                    ? "bg-zinc-800 text-white font-bold"
                    : "bg-white text-zinc-900 shadow-sm font-bold"
                  : isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Public Agents
            </button>
            <button
              onClick={() => handleTabChange("system")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer rounded-sm",
                activeTab === "system"
                  ? isDark
                    ? "bg-zinc-800 text-white font-bold"
                    : "bg-white text-zinc-900 shadow-sm font-bold"
                  : isDark
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              System Tools
            </button>
          </div>

          <Button
            className={cn(
              " bg-transparent ",
              isDark
                ? "text-white hover:bg-gray-800"
                : "text-gray-900 hover:bg-blue-50"
            )}
            onClick={() => handleopenCreateModal()}
          >
            <Plus
              size={20}
              className={cn(
                "mr-2 bg-transparent",
                isDark ? "text-white" : "text-gray-900"
              )}
            />{" "}
            Create Agent
          </Button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className={cn(
              "p-2.5 rounded-xl border transition-all hover:cursor-pointer flex items-center justify-center shrink-0",
              isDark
                ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            )}
            title="Refresh Agents List"
          >
            <RotateCw
              size={18}
              className={cn(
                "bg-transparent",
                (isLoading || isPublicLoading) && "animate-spin"
              )}
            />
          </button>
        </div>
      </div>

      {/* Error State Display */}
      {(error || publicError) && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          Error: {error || publicError}
        </div>
      )}

      {/* Grid Content */}
      {((activeTab === "my" && isLoading && items.length === 0) ||
        (activeTab === "public" && isPublicLoading && (!publicItems || publicItems.length === 0))) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} className="h-64 w-full rounded-2xl" />
        </div>
      ) : activeTab === "my" ? (
        items.length > 0 ? (
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
          /* Empty State for My Agents */
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
            <Button variant="outline" onClick={() => handleopenCreateModal()}>
              Create Your First Agent
            </Button>
          </motion.div>
        )
      ) : activeTab === "system" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemToolCard
            id="sys-email"
            title="Email Crafter"
            description="Quickly draft professional, localized emails with custom tone and context."
            model="GPT-4o-Mini"
            link="/agents/system/email"
            isDark={isDark}
          />
          <SystemToolCard
            id="sys-doc"
            title="Document Explainer"
            description="Upload complex documents and get detailed, structured explanations and recommendations."
            model="GPT-4.1"
            link="/agents/system/document-explainer"
            isDark={isDark}
          />
          <SystemToolCard
            id="sys-cost"
            title="Cost of Living Comparator"
            description="Compare the cost of living between two cities globally using precise economic data."
            model="GPT-4.1"
            link="/agents/system/cost-of-living"
            isDark={isDark}
          />
        </div>
      ) : (
        /* activeTab === "public" */
        publicItems && publicItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicItems.map((agent: any) => (
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
          /* Empty State for Public Agents */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center opacity-60"
          >
            <Box size={64} className="mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Public Agents Available</h3>
            <p className="max-w-sm mx-auto mb-6">
              There are no built-in or public agents available at this moment.
            </p>
          </motion.div>
        )
      )}

      {/* Pass the 'editingAgent' prop to the modal so it can pre-fill data */}
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
