import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Shield,
  Zap,
  Cpu,
  Terminal,
  Clock,
  ChevronRight,
  FileText,
  Upload,
  Trash2,
  Loader2,
  Database,
} from "lucide-react";
import { AgentService } from "../../../api/backendApi";
import { ChatService } from "../../chat/services/chatService";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import {
  fetchAgentDocuments,
  uploadAgentDocuments,
  deleteAgentDocument,
} from "../../agents/agentsSlice";
import {setNewChatAgent} from "../../chat/chatSlice"
import { cn } from "../../../lib/utils";
import ParticleBackground from "../../../Components/ui/ParticleBackground";

const AgentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = useAppSelector((state: any) => state.auth.accessToken);
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // Get documents from Redux store
  const { documents, isDocsLoading } = useAppSelector(
    (state: any) => state.agents
  );

  const [agent, setAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id || !token) return;
      try {
        setLoading(true);
        const data = await AgentService.getAgentById(token, id);
        setAgent(data);

        // Fetch Documents
        dispatch(fetchAgentDocuments({ token, gpt_id: id }));
      } catch (err) {
        console.error("Failed to load agent", err);
        setError("Failed to load agent details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id, token, dispatch]);

  const handleStartChat = async (specificStarter?: string) => {
    if (!agent || !token || creatingSession) return;
    try {
      setCreatingSession(true);
      let messageToSend = specificStarter;
      if (!messageToSend && agent.conversation_starters?.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * agent.conversation_starters.length
        );
        messageToSend = agent.conversation_starters[randomIndex];
      }
      dispatch(setNewChatAgent(agent.id));
      const modelToUse = agent.recommended_model || "integri";
      const newSessionId = await ChatService.createChat(
        token,
        modelToUse,
        agent.id
      );
      navigate(`/chat/${newSessionId}`, {
        state: { initialMessage: messageToSend },
      });
    } catch (error) {
      console.error("Failed to start agent chat:", error);
    } finally {
      setCreatingSession(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !id) return;

    setUploadingDocs(true);
    try {
      const files = Array.from(e.target.files);
      await dispatch(
        uploadAgentDocuments({ token, gpt_id: id, files })
      ).unwrap();
      // Refresh list
      dispatch(fetchAgentDocuments({ token, gpt_id: id }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload documents.");
    } finally {
      setUploadingDocs(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!id || !token) return;
    if (confirm("Delete this document?")) {
      try {
        await dispatch(
          deleteAgentDocument({ token, gpt_id: id, document_id: docId })
        ).unwrap();
      } catch (e) {
        console.error(e);
        alert("Failed to delete document.");
      }
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          isDark ? "bg-black" : "bg-gray-50"
        )}
      >
        <div
          className={cn(
            "h-6 w-6 animate-spin border-2 border-t-transparent",
            isDark ? "border-white" : "border-black"
          )}
        />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center gap-4">
        <p className="text-zinc-500">{error || "Agent not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-black dark:text-white underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-hidden relative flex flex-col h-full w-full overflow-y-auto custom-scrollbar",
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      )}
    >
      <ParticleBackground />

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-10 flex items-center p-6 bg-transparent ">
        <button
          title="header"
          onClick={() => navigate(-1)}
          className={cn(
            "p-2 border transition-all hover:scale-105",
            isDark
              ? "border-zinc-800 bg-black/50 text-white hover:bg-zinc-900"
              : "border-zinc-200 bg-white/50 text-black hover:bg-white"
          )}
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="relative z-0 flex-1 w-full max-w-5xl mx-auto p-6 pb-20">
        {/* --- PROFILE HERO --- */}
        <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
          {/* Avatar */}
          <div
            className={cn(
              "w-32 h-32 md:w-40 md:h-40 shrink-0 flex items-center justify-center border-2",
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200 shadow-2xl"
            )}
          >
            {agent.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.name}
                className="w-full h-full object-cover grayscale"
              />
            ) : (
              <Zap
                size={48}
                className={isDark ? "text-white" : "text-black"}
                strokeWidth={1}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
                {agent.name}
              </h1>
              <p
                className={cn(
                  "text-lg md:text-xl font-light max-w-2xl leading-relaxed",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                {agent.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleStartChat()}
                disabled={creatingSession}
                className={cn(
                  "group relative flex items-center gap-3 px-8 py-4 font-bold tracking-widest uppercase text-sm border-2 transition-all",
                  isDark
                    ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                    : "bg-black text-white border-black hover:bg-transparent hover:text-black"
                )}
              >
                {creatingSession ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <MessageSquare size={18} />
                )}
                <span>Initialize Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- SPECS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 mb-16 overflow-hidden">
          {[
            {
              label: "Model Architecture",
              value: agent.recommended_model || "integri",
              icon: Cpu,
            },
            { label: "Access Level", value: "Private / Secure", icon: Shield },
            { label: "Response Type", value: "Analytical", icon: Terminal },
            { label: "Latency", value: "Low / Real-time", icon: Clock },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={cn(
                "p-6 flex flex-col gap-2",
                isDark
                  ? "bg-black hover:bg-zinc-900"
                  : "bg-white hover:bg-zinc-50"
              )}
            >
              <stat.icon
                size={20}
                className={isDark ? "text-zinc-500" : "text-zinc-400"}
              />
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}
              >
                {stat.label}
              </span>
              <span className="font-mono text-sm">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* --- KNOWLEDGE BASE SECTION --- */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={cn(
                "h-px flex-1",
                isDark ? "bg-zinc-800" : "bg-zinc-300"
              )}
            />
            <h3
              className={cn(
                "flex items-center gap-2 font-mono text-sm uppercase tracking-widest",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}
            >
              <Database size={16} /> Knowledge Base
            </h3>
            <div
              className={cn(
                "h-px flex-1",
                isDark ? "bg-zinc-800" : "bg-zinc-300"
              )}
            />
          </div>

          <div
            className={cn(
              "p-6 border",
              isDark
                ? "bg-zinc-900/20 border-zinc-800"
                : "bg-white border-zinc-200"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4
                  className={cn(
                    "text-lg font-bold",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  Attached Documents
                </h4>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  )}
                >
                  These files provide context for the agent's responses.
                </p>
              </div>
              <div>
                <input
                title="file"
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.docx,.md"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDocs}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide border transition-all",
                    isDark
                      ? "border-zinc-700 hover:bg-white hover:text-black"
                      : "border-zinc-300 hover:bg-black hover:text-white"
                  )}
                >
                  {uploadingDocs ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload
                </button>
              </div>
            </div>

            {isDocsLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="animate-spin text-zinc-500" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm italic border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                No knowledge documents attached.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc: any) => (
                  <div
                    key={doc.file_id}
                    className={cn(
                      "flex items-center justify-between p-4 border group",
                      isDark
                        ? "bg-black border-zinc-800"
                        : "bg-gray-50 border-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={cn(
                          "p-2",
                          isDark ? "bg-zinc-900" : "bg-white"
                        )}
                      >
                        <FileText size={20} className="text-blue-500" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                          {doc.filename}
                        </span>
                        <span className="text-xs text-zinc-500 uppercase">
                          {doc.file_type} • {(doc.file_size / 1024).toFixed(0)}{" "}
                          KB
                        </span>
                      </div>
                    </div>
                    <button
                    title="delete"
                      onClick={() => handleDeleteDoc(doc.document_id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- CONVERSATION STARTERS --- */}
        {agent.conversation_starters?.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  "h-px flex-1",
                  isDark ? "bg-zinc-800" : "bg-zinc-300"
                )}
              />
              <h3
                className={cn(
                  "font-mono text-sm uppercase tracking-widest",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}
              >
                Command Protocols
              </h3>
              <div
                className={cn(
                  "h-px flex-1",
                  isDark ? "bg-zinc-800" : "bg-zinc-300"
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.conversation_starters.map(
                (starter: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleStartChat(starter)}
                    className={cn(
                      "group flex items-center justify-between p-5 text-left border transition-all duration-200",
                      isDark
                        ? "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-white hover:text-white"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-black hover:text-black hover:shadow-lg"
                    )}
                  >
                    <span className="text-sm font-medium line-clamp-1 font-mono">
                      "{starter}"
                    </span>
                    <ChevronRight
                      size={16}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetailPage;
