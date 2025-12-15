import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "../lib/utils";
import { useChatList } from "../features/chat/hooks/useChat";
import { SessionService } from "../api/backendApi"; // NEW LOGIC

// Types
type SortKey = "title" | "date" | "model";
type SortOrder = "asc" | "desc";

const HistoryPage: React.FC = () => {
  const user = useAppSelector((state: any) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.token); // NEW LOGIC
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const navigate = useNavigate();

  // Fetch chats using the hook instead of Redux selector
  const { chats: sessions, loading } = useChatList(user?.id);

  // Sort State
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Sorting Handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!token) return; // NEW LOGIC
    if (window.confirm("Are you sure?")) {
      try {
        await SessionService.deleteSession(token, chatId); // NEW LOGIC
        window.location.reload();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  // Helper for Date parsing (API or Timestamp)
  const getDate = (item: any) => {
    const val = item.updated_at || item.updatedAt || item.created_at;
    if (!val) return 0;
    return typeof val === "string"
      ? new Date(val).getTime()
      : val.seconds * 1000;
  };

  const formatDate = (item: any) => {
    const val = item.updated_at || item.updatedAt || item.created_at;
    if (!val) return "N/A";
    const date =
      typeof val === "string" ? new Date(val) : new Date(val.seconds * 1000);
    return date.toLocaleDateString();
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
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
  }, [sessions, sortKey, sortOrder]);

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
    <div
      className={cn(
        "max-w-6xl mx-auto p-4 md:p-8 h-full overflow-y-auto",
        isDark ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Header */}
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
          {sessions.length} Conversations
        </div>
      </div>

      {/* Table Container */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl border shadow-sm",
          isDark ? "border-[#2A2B32] bg-[#1a1a1a]" : "border-gray-200 bg-white"
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
                    className="p-4 font-medium cursor-pointer select-none hover:opacity-70 transition-opacity"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Conversation <SortIcon column="title" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-medium cursor-pointer select-none hover:opacity-70 transition-opacity"
                    onClick={() => handleSort("model")}
                  >
                    <div className="flex items-center gap-2">
                      Model <SortIcon column="model" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-medium cursor-pointer select-none hover:opacity-70 transition-opacity"
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
                  sortedSessions.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => navigate(`/chat/${session.id}`)}
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
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/chat/${session.id}`)}
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
                            onClick={(e) => handleDelete(e, session.id)}
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
