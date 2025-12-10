import React, { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "../lib/utils";
import { deleteChat } from "../features/chat/chatSlice";

// Types
type SortKey = "title" | "date" | "model";
type SortOrder = "asc" | "desc";

const HistoryPage: React.FC = () => {
  const sessions = useAppSelector((state) => state.chat.sessions);
  const isDark = useAppSelector((state:any) => state.theme.isDark);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  // Derived Sorted Data
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let valA: any 
      let valB: any 

      // Handle missing model/date fields safely
      if (sortKey === "title") {
        valA = a.title;
        valB = b.title;
      }
      if (sortKey === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }
      if (sortKey === "model") {
        valA = a.model || "";
        valB = b.model || "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sessions, sortKey, sortOrder]);

  // Render Sort Icon
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
        "max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 h-full overflow-y-auto",
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
          {sessions.length} Conversations
        </div>
      </div>

      <div
        className={cn(
          "w-full overflow-hidden rounded-xl border shadow-sm",
          isDark ? "border-[#2A2B32] bg-[#1a1a1a]" : "border-gray-200 bg-white"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* Table Header */}
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
                  className="p-4 font-semibold cursor-pointer select-none hover:bg-black/5 transition-colors w-[40%]"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Conversation <SortIcon column="title" />
                  </div>
                </th>
                <th
                  className="p-4 font-semibold cursor-pointer select-none hover:bg-black/5 transition-colors w-[20%]"
                  onClick={() => handleSort("model")}
                >
                  <div className="flex items-center gap-2">
                    Model <SortIcon column="model" />
                  </div>
                </th>
                <th
                  className="p-4 font-semibold cursor-pointer select-none hover:bg-black/5 transition-colors w-[25%]"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    Date <SortIcon column="date" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-right w-[15%]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody
              className={cn(
                "divide-y",
                isDark ? "divide-[#2A2B32]" : "divide-gray-100"
              )}
            >
              {sortedSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center opacity-50">
                    No conversations found.
                  </td>
                </tr>
              ) : (
                sortedSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => navigate(`/chat/${session.id}`)}
                    className={cn(
                      "group transition-colors cursor-pointer",
                      isDark
                        ? "hover:bg-[#2A2B32] text-gray-300"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg shrink-0",
                            isDark
                              ? "bg-black/20"
                              : "bg-indigo-50 text-indigo-600"
                          )}
                        >
                          <MessageSquare size={16} />
                        </div>
                        <span className="font-medium truncate max-w-[200px] md:max-w-xs">
                          {session.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-md border",
                          isDark
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-gray-100"
                        )}
                      >
                        {session.model || "GPT-4o"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono opacity-70">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td
                      className="p-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/chat/${session.id}`)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "hover:bg-indigo-500/20 text-indigo-400"
                              : "hover:bg-indigo-50 text-indigo-600"
                          )}
                          title="Open"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          onClick={() => dispatch(deleteChat(session.id))}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
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
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
