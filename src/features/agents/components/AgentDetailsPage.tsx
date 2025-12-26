import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, MessageSquare, Tag, Sparkles } from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux"; // Adjust path if needed based on file location
import { cn } from "../../../lib/utils";
import { AgentService } from "../../../api/backendApi";
import { ChatService } from "../../chat/services/chatService";
import Button from "../../../Components/ui/Button";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";

const AgentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const loadAgent = async () => {
      if (!id || !token) return;
      try {
        const data = await AgentService.getAgentById(token, id);
        setAgent(data);
      } catch (err) {
        console.error("Failed to load agent", err);
      } finally {
        setLoading(false);
      }
    };
    loadAgent();
  }, [id, token]);

  const handleStartChat = async () => {
    if (!token || !agent) return;
    setStartingChat(true);
    try {
      // Create a chat session with this agent's model
      const sessionId = await ChatService.createChat(
        token,
        agent.model,
      );
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      console.error("Failed to start chat", error);
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("h-full p-8", isDark ? "bg-[#09090b]" : "bg-gray-50")}>
        <div className="max-w-3xl mx-auto space-y-6">
          <SkeletonLoader className="h-8 w-1/3" />
          <SkeletonLoader className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return <div className="p-10 text-center">Agent not found</div>;
  }

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-6 lg:p-12",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <button
          onClick={() => navigate("/agents")}
          className={cn(
            "mb-8 flex items-center gap-2 text-sm font-medium transition-colors",
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-black"
          )}
        >
          <ArrowLeft size={16} /> Back to Agents
        </button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div
            className={cn(
              "w-32 h-32 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl",
              isDark
                ? "bg-linear-to-br from-blue-600 to-purple-600 text-white"
                : "bg-linear-to-br from-blue-500 to-cyan-400 text-white"
            )}
          >
            <Bot size={64} />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              {agent.name}
            </h1>
            <p
              className={cn(
                "text-lg mb-6 leading-relaxed",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {agent.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleStartChat}
                disabled={startingChat}
                className="px-8 py-6 text-lg rounded-xl"
              >
                <MessageSquare className="mr-2" />
                {startingChat ? "Starting..." : "Chat with Agent"}
              </Button>

              <div
                className={cn(
                  "px-4 py-2 rounded-xl border flex items-center gap-2",
                  isDark
                    ? "border-[#333] bg-[#1a1a1a]"
                    : "border-gray-200 bg-white"
                )}
              >
                <Tag size={16} className="text-blue-500" />
                <span className="text-sm font-mono">{agent.model}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Preview (Read Only) */}
        <div
          className={cn(
            "rounded-2xl border p-8",
            isDark
              ? "bg-[#18181b] border-[#27272a]"
              : "bg-white border-gray-200 shadow-sm"
          )}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" />
            System Instructions
          </h2>
          <div
            className={cn(
              "p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto",
              isDark ? "bg-black/30 text-gray-300" : "bg-gray-50 text-gray-700"
            )}
          >
            {agent.instructions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPage;
