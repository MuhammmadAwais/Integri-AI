import React, { useState } from "react";
import { X, Search, MessageSquare, Calendar, ChevronLeft } from "lucide-react";
import { useChatList, useMessages } from "../../chat/hooks/useChat";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const user = useAppSelector((state: any) => state.auth.user);
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // 1. Fetch All Chats
  const { chats = [] } = useChatList(user?.id);

  // 2. Fetch Messages for Preview
  const { messages: previewMessages = [], loading: isPreviewLoading } =
    useMessages(user?.id, selectedChatId || undefined);

  if (!isOpen) return null;

  const filteredChats = chats.filter((c) =>
    (c.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200"
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
        {/* Close Button */}
        <button
          title="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} className={isDark ? "text-gray-400" : "text-gray-600"} />
        </button>

        {/* ================= LEFT SIDE: CHAT LIST ================= */}
        <div
          className={cn(
            "flex-col w-full md:w-[350px] shrink-0 border-r transition-all duration-300",
            isDark ? "border-[#222]" : "border-gray-200",
            selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header */}
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
                  ? "bg-[#161616] border-transparent focus-within:bg-black focus-within:border-[#333]"
                  : "bg-gray-100 border-transparent focus-within:bg-white focus-within:border-gray-300"
              )}
            >
              <Search size={16} className="text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className={cn(
                  "bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-500",
                  isDark ? "text-white" : "text-black"
                )}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-1">
              Recent
            </div>

            {filteredChats.length === 0 ? (
              <div className="px-4 text-sm text-gray-500 mt-4">
                No results found.
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors mb-1 flex items-center gap-3 group relative",
                    selectedChatId === chat.id
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
                      selectedChatId === chat.id ? "opacity-100" : "opacity-50"
                    )}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">
                      {chat.title || "New Conversation"}
                    </div>
                    <div className="text-[10px] opacity-40 truncate">
                      {chat.updatedAt
                        ? new Date(
                            chat.updatedAt.seconds * 1000
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </div>
                  </div>
                  <div className="md:hidden text-gray-500">
                    <ChevronLeft size={16} className="rotate-180" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ================= RIGHT SIDE: PREVIEW ================= */}
        <div
          className={cn(
            "flex-col flex-1 relative transition-all duration-300",
            isDark ? "bg-black/20" : "bg-gray-50/50",
            !selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          {selectedChatId ? (
            <>
              {/* Preview Header */}
              <div
                className={cn(
                  "px-4 md:px-6 py-4 border-b flex items-center justify-between shrink-0 pr-12 ",
                  isDark ? "border-[#222]" : "border-gray-200"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    title="Back to Chat List"
                    onClick={handleBackToList}
                    className={cn(
                      "md:hidden p-1.5 rounded-full mr-1 transition-colors",
                      isDark
                        ? "hover:bg-[#333] text-gray-300"
                        : "hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="overflow-hidden">
                    <h3
                      className={cn(
                        "font-bold text-lg truncate",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}
                    >
                      {filteredChats.find((c) => c.id === selectedChatId)
                        ?.title || "Chat Preview"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      <span>
                        Started{" "}
                        {(() => {
                          const c = filteredChats.find(
                            (c) => c.id === selectedChatId
                          );
                          return c?.updatedAt
                            ? new Date(
                                c.updatedAt.seconds * 1000
                              ).toLocaleDateString()
                            : "N/A";
                        })()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {isPreviewLoading ? (
                  <div className="space-y-4 max-w-2xl mx-auto pt-10">
                    <SkeletonLoader className="h-16 w-3/4 rounded-xl opacity-20" />
                    <SkeletonLoader className="h-24 w-full rounded-xl opacity-20" />
                    <SkeletonLoader className="h-16 w-2/3 rounded-xl opacity-20" />
                  </div>
                ) : previewMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    No messages yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                    {previewMessages.slice(0, 10).map((msg: any) => (
                      <div key={msg.id} className="flex gap-4">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-1",
                            msg.role === "user"
                              ? "bg-gray-600 text-white"
                              : "bg-white text-black border border-gray-300"
                          )}
                        >
                          {msg.role === "user" ? "U" : "G"}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-bold text-xs opacity-50 uppercase tracking-wide">
                            {msg.role}
                          </div>
                          <div
                            className={cn(
                              "text-[15px] leading-relaxed whitespace-pre-wrap",
                              isDark ? "text-gray-300" : "text-gray-800"
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {previewMessages.length > 10 && (
                      <div className="text-center text-xs opacity-40 pt-4 pb-8">
                        ... and {previewMessages.length - 10} more messages
                      </div>
                    )}
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
