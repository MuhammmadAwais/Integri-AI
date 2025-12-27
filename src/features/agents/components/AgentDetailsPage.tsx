import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Shield,
  Globe,
  Zap,
  Play,
} from "lucide-react";
import { AgentService } from "../../../api/backendApi";
import { ChatService } from "../../chat/services/chatService"; // Import ChatService
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { setNewChatAgent } from "../../chat/chatSlice";
import { cn } from "../../../lib/utils";

const AgentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const token = useAppSelector((state: any) => state.auth.accessToken);
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const [agent, setAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false); // Add loading state for button
  const [error, setError] = useState("");

  // 1. Fetch Agent Details
  useEffect(() => {
    const fetchAgent = async () => {
      if (!id || !token) return;
      try {
        setLoading(true);
        const data = await AgentService.getAgentById(token, id);
        setAgent(data);
      } catch (err) {
        console.error("Failed to load agent", err);
        setError("Failed to load agent details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, token]);

  // 2. Start Chat Handler - FIXED
  const handleStartChat = async (initialMessage?: string) => {
    if (!agent || !token || creatingSession) return;

    try {
      setCreatingSession(true);

      // A. Store Agent ID in Redux (Optional, but good for state consistency)
      dispatch(setNewChatAgent(agent.id));

      // B. Create the Session Explicitly
      // We use the agent's recommended model, or default to a standard one
      const modelToUse = agent.recommended_model || "gpt-4o-mini";

      // Call Create Chat (Token, Model, AgentID)
      const newSessionId = await ChatService.createChat(
        token,
        modelToUse,
        agent.id // Pass the Agent ID here!
      );

      // C. Navigate to the NEW Session
      if (initialMessage) {
        // If they clicked a starter, pass it to auto-send
        navigate(`/chat/${newSessionId}`, {
          state: { initialMessage: initialMessage },
        });
      } else {
        // Just open the empty chat
        navigate(`/chat/${newSessionId}`);
      }
    } catch (error) {
      console.error("Failed to start agent chat:", error);
      // Optional: Add a toast notification here
    } finally {
      setCreatingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center gap-4">
        <p className="text-red-500">{error || "Agent not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center p-4 backdrop-blur-md bg-opacity-80">
        <button
          onClick={() => navigate(-1)}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDark
              ? "hover:bg-gray-800 text-gray-400"
              : "hover:bg-gray-200 text-gray-600"
          )}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="ml-4 text-lg font-semibold opacity-90">Agent Details</h1>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-6 pb-20">
        {/* Agent Profile Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl">
            {agent.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Zap size={40} className="text-white" />
            )}
          </div>

          <h2 className="text-3xl font-bold mb-3">{agent.name}</h2>
          <p
            className={cn(
              "text-lg max-w-xl",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {agent.description}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => handleStartChat()}
              disabled={creatingSession}
              className={cn(
                "flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95",
                creatingSession && "opacity-70 cursor-wait"
              )}
            >
              {creatingSession ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <MessageSquare size={18} />
              )}
              {creatingSession ? "Creating..." : "Start Chat"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Conversation Starters Section */}
          {agent.conversation_starters &&
            agent.conversation_starters.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wider mb-4",
                    isDark ? "text-gray-500" : "text-gray-400"
                  )}
                >
                  Conversation Starters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agent.conversation_starters.map(
                    (starter: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleStartChat(starter)}
                        disabled={creatingSession}
                        className={cn(
                          "text-left p-4 rounded-xl border transition-all duration-200 group",
                          isDark
                            ? "bg-[#1a1a1a] border-gray-800 hover:border-gray-600 hover:bg-[#252525]"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium line-clamp-2">
                            {starter}
                          </span>
                          <Play
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                            fill="currentColor"
                          />
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Capabilities / Info Section (Static or Data driven) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div
              className={cn(
                "p-4 rounded-xl",
                isDark ? "bg-gray-800/30" : "bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2 mb-2 text-indigo-500">
                <Globe size={18} />
                <span className="font-semibold text-sm">Capabilities</span>
              </div>
              <p className="text-xs opacity-70">
                This agent has access to web browsing and data analysis tools to
                provide accurate responses.
              </p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark ? "bg-gray-800/30" : "bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2 mb-2 text-green-500">
                <Shield size={18} />
                <span className="font-semibold text-sm">Privacy</span>
              </div>
              <p className="text-xs opacity-70">
                Conversations with this agent are private and not used for
                training standard models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
