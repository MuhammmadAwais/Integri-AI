import React, { useState,  useMemo } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useChatList } from "../features/chat/hooks/useChat";

// --- TYPES ---
type SortKey = "title" | "date" | "model";
type SortOrder = "asc" | "desc";

// --- HELPER: DATE PARSING ---
const getDate = (item: any) => {
  const val =
    item.updated_at || item.updatedAt || item.createdAt || item.created_at;
  if (!val) return 0;
  if (typeof val === "string") return new Date(val).getTime();
  if (val.seconds) return val.seconds * 1000;
  return 0;
};

const formatDate = (item: any) => {
  const val =
    item.updated_at || item.updatedAt || item.createdAt || item.created_at;
  if (!val) return "N/A";
  const date =
    typeof val === "string" ? new Date(val) : new Date(val.seconds * 1000);
  return date.toLocaleDateString();
};

// --- COMPONENT: DELETE CONFIRMATION MODAL ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 p-6 border",
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-white"
            : "bg-white border-gray-200 text-gray-900"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div
            className={cn(
              "p-3 rounded-full",
              isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600"
            )}
          >
            <AlertTriangle size={32} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Delete Conversation?</h3>
            <p
              className={cn(
                "text-sm leading-relaxed",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              This action cannot be undone. This will permanently remove the
              conversation and all its messages.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={cn(
              "hover:cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm",
              isDark
                ? "bg-[#2A2B32] hover:bg-[#3A3B42] text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="hover:cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors text-sm shadow-lg shadow-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const HistoryPage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const navigate = useNavigate();

  // Fetch chats using hook
  const { chats, loading, handleDeleteChat } = useChatList();

  // Sort State
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Sorting Handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Memoized Sorted List
  const sortedSessions = useMemo(() => {
    if (!chats) return [];
    return [...chats].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === "title") {
        valA = (a.title || "").toLowerCase();
        valB = (b.title || "").toLowerCase();
      } else if (sortKey === "date") {
        valA = getDate(a);
        valB = getDate(b);
      } else if (sortKey === "model") {
        valA = a.model || "";
        valB = b.model || "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [chats, sortKey, sortOrder]);

  // --- ACTIONS ---

  // 1. Trigger Modal
  const onDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!chatId) return;

    setChatToDelete(chatId);
    setIsDeleteModalOpen(true);
  };

  // 2. Confirm Delete
  const confirmDelete = async () => {
    if (chatToDelete) {
      try {
        await handleDeleteChat(chatToDelete);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setChatToDelete(null);
      }
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column)
      return <ArrowUpDown size={14} className="opacity-30" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  return (
    <>
      <div
        className={cn(
          "max-w-6xl mx-auto p-4 md:p-8 h-full overflow-y-auto",
          isDark ? "bg-black text-white" : "bg-white text-black"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <h1
            className={cn(
              "text-2xl md:text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Chat History
          </h1>
          <div
            className={cn(
              "text-sm px-3 py-1 rounded-full border",
              isDark
                ? "border-gray-700 text-gray-400"
                : "border-gray-200 text-gray-500"
            )}
          >
            {chats ? chats.length : 0} Conversations
          </div>
        </div>

        <div
          className={cn(
            "w-full overflow-hidden rounded-xl border shadow-sm",
            isDark
              ? "border-[#2A2B32] bg-[#1a1a1a]"
              : "border-gray-200 bg-white"
          )}
        >
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-12 opacity-50">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>Loading history...</span>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className={cn(
                      "border-b",
                      isDark
                        ? "border-[#2A2B32] bg-[#212121] text-gray-300"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    )}
                  >
                    <th
                      className="p-4 font-medium cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Conversation <SortIcon column="title" />
                      </div>
                    </th>
                    <th
                      className="p-4 font-medium cursor-pointer"
                      onClick={() => handleSort("model")}
                    >
                      <div className="flex items-center gap-2">
                        Model <SortIcon column="model" />
                      </div>
                    </th>
                    <th
                      className="p-4 font-medium cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Date <SortIcon column="date" />
                      </div>
                    </th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className={cn(
                    "divide-y",
                    isDark ? "divide-[#2A2B32]" : "divide-gray-100"
                  )}
                >
                  {sortedSessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center opacity-50">
                        No conversation history found.
                      </td>
                    </tr>
                  ) : (
                    sortedSessions.map((session) => {
                      const sessionId = session.session_id || session.id;
                      return (
                        <tr
                          key={sessionId}
                          onClick={() => navigate(`/chat/${sessionId}`)}
                          className={cn(
                            "group cursor-pointer transition-colors",
                            isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-50"
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <MessageSquare size={16} className="opacity-50" />
                              <span className="font-medium truncate max-w-[200px]">
                                {session.title || "New Chat"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="opacity-70 border px-2 py-1 rounded-md text-xs">
                              {session.model || "gpt-4o"}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono opacity-70">
                            {formatDate(session)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 ">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/chat/${sessionId}`);
                                }}
                                className={cn(
                                  "p-2 rounded-lg transition-colors hover:cursor-pointer",
                                  isDark
                                    ? "hover:bg-indigo-500/20 text-indigo-400"
                                    : "hover:bg-indigo-50 text-indigo-600"
                                )}
                                title="Open"
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button
                                onClick={(e) => onDeleteClick(e, sessionId)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors hover:cursor-pointer",
                                  isDark
                                    ? "hover:bg-red-500/20 text-red-400"
                                    : "hover:bg-red-50 text-red-600"
                                )}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* RENDER THE MODAL */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDark={isDark}
      />
    </>
  );
};

export default HistoryPage;
