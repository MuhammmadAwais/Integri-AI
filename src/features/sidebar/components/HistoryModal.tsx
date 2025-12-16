import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  MessageSquare,
  Calendar,
  ChevronLeft,
  User,
  Bot,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatList } from "../../chat/hooks/useChat";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { SessionService } from "../../../api/backendApi";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // LOGIC: Local state for preview messages
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const token = useAppSelector((state: any) => state.auth.accessToken);
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // LOGIC: Fetch chats from hook
  const { chats } = useChatList();

  // LOGIC: Fetch Preview Messages when a chat is clicked
  useEffect(() => {
    const fetchPreview = async () => {
      if (!selectedChatId || !token) {
        setPreviewMessages([]);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const msgs = await SessionService.getSessionMessages(
          token,
          selectedChatId
        );
        setPreviewMessages(msgs);
      } catch (err) {
        console.error("Failed to load preview", err);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [selectedChatId, token]);

  if (!isOpen) return null;

  // Filter logic
  const filteredChats = (chats || []).filter((c: any) =>
    (c.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "";
    return new Date(dateVal).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-2xl flex overflow-hidden shadow-2xl relative transition-colors",
          isDark
            ? "bg-[#090909] border-[#222] md:border"
            : "bg-white border-gray-200 md:border"
        )}
      >
        <button
          title="Close"
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} className={isDark ? "text-gray-400" : "text-gray-600"} />
        </button>

        {/* LEFT SIDE: CHAT LIST */}
        <div
          className={cn(
            "flex-col w-full md:w-[350px] shrink-0 border-r transition-all duration-300",
            isDark ? "border-[#222]" : "border-gray-200",
            selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          <div className="p-4 border-b border-transparent shrink-0">
            <h2
              className={cn(
                "text-lg font-bold mb-3 px-1",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              History
            </h2>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all",
                isDark
                  ? "bg-[#161616] border-transparent"
                  : "bg-gray-100 border-transparent"
              )}
            >
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className={cn(
                  "bg-transparent border-none outline-none text-sm w-full",
                  isDark ? "text-white" : "text-black"
                )}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredChats.map((chat: any) => (
              <button
                key={chat.session_id}
                onClick={() => setSelectedChatId(chat.session_id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors mb-1 flex items-center gap-3 group relative hover:cursor-pointer",
                  selectedChatId === chat.session_id
                    ? isDark
                      ? "bg-[#1F1F1F] text-white"
                      : "bg-gray-200 text-black"
                    : isDark
                    ? "hover:bg-[#161616] text-gray-400"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <MessageSquare
                  size={16}
                  className={cn(
                    "shrink-0",
                    selectedChatId === chat.session_id
                      ? "opacity-100"
                      : "opacity-50"
                  )}
                />
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-medium">
                    {chat.title || "New Conversation"}
                  </div>
                  <div className="text-[10px] opacity-40 truncate flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(chat.created_at)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: PREVIEW */}
        <div
          className={cn(
            "flex-col flex-1 relative transition-all duration-300",
            isDark ? "bg-black/20" : "bg-gray-50/50",
            !selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          {selectedChatId ? (
            <>
              <div
                className={cn(
                  "px-4 md:px-6 py-4 border-b flex items-center justify-between shrink-0",
                  isDark
                    ? "border-[#222] bg-[#090909]/80"
                    : "border-gray-200 bg-white/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="md:hidden"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h3
                      className={cn(
                        "font-bold text-lg",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}
                    >
                      {filteredChats.find(
                        (c: any) => c.session_id === selectedChatId
                      )?.title || "Chat Preview"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {isPreviewLoading ? (
                  <div className="space-y-4 max-w-2xl mx-auto pt-10">
                    <SkeletonLoader className="h-16 w-3/4 rounded-xl opacity-20" />
                    <SkeletonLoader className="h-24 w-full rounded-xl opacity-20" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
                    {previewMessages.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex w-full relative group",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                              msg.role === "user"
                                ? "bg-indigo-600 text-white"
                                : isDark
                                ? "bg-gray-700 text-white"
                                : "bg-black text-white"
                            )}
                          >
                            {msg.role === "user" ? (
                              <User size={14} />
                            ) : (
                              <Bot size={14} />
                            )}
                          </div>
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                              msg.role === "user"
                                ? isDark
                                  ? "bg-[#2F3336] text-gray-100"
                                  : "bg-gray-200 text-gray-900"
                                : "bg-transparent text-gray-800 dark:text-gray-200 pl-0"
                            )}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-lg font-medium">
                Select a conversation to preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
