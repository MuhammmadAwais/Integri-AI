import React from "react";
import { X, Search, Clock, ArrowRight, Calendar } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getSessionId } from "./HistoryModal";

interface Props {
  chats: any[];
  search: string;
  setSearch: (v: string) => void;
  selectedChatId: string | null;
  onSelect: (id: string) => void;
  isDark: boolean;
  mobileView: "list" | "detail";
  onClose: () => void;
}

const HistoryList: React.FC<Props> = ({
  chats,
  search,
  setSearch,
  selectedChatId,
  onSelect,
  isDark,
  mobileView,
  onClose,
}) => {
  const filteredChats = (chats || []).filter((c: any) =>
    (c.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        "flex-col h-full border-r shrink-0 transition-all md:w-[350px]",
        isDark ? "border-[#2A2B32] bg-[#141414]" : "border-gray-200 bg-gray-50",
        mobileView === "detail" ? "hidden md:flex" : "flex w-full"
      )}
    >
      <div className="p-4 border-b border-inherit shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-indigo-500" size={20} />
            History
          </h2>
          <button
          title="button"
            onClick={onClose}
            className={cn(
              "md:hidden p-2 rounded-full hover:cursor-pointer",
              isDark ? "hover:bg-white/10" : "hover:bg-black/10"
            )}
          >
            <X  size={20} />
          </button>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl border",
            isDark
              ? "bg-[#1F1F1F] border-transparent"
              : "bg-white border-gray-200"
          )}
        >
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            placeholder="Search chats..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChats.map((chat: any) => {
          const id = getSessionId(chat);
          if (!id) return null;

          const isActive = selectedChatId === id;

          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                "hover:cursor-pointer w-full text-left p-3.5 rounded-xl transition-all group relative",
                isActive
                  ? isDark
                    ? "bg-[#2A2B32]"
                    : "bg-white ring-1 ring-black/5"
                  : isDark
                  ? "hover:bg-[#1A1A1A]"
                  : "hover:bg-gray-100"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    "font-medium truncate pr-4 text-[14px]",
                    isActive ? "text-indigo-500" : ""
                  )}
                >
                  {chat.title || "New Chat"}
                </span>
                <ArrowRight size={14} className="md:hidden opacity-30" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                {new Date(
                  chat.updated_at || chat.created_at || Date.now()
                ).toLocaleDateString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
