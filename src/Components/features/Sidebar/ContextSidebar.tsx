import React, { useState } from "react";
import { Plus, Search, MessageSquare, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  createNewChat,
  deleteChat,
  toggleMobileMenu,
} from "../../../store/chatSlice"; // Import actions
import { cn } from "../../../utils/cn";
import ModelSelector from "./ModelSelector";

const ContextSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const sessions = useAppSelector((state) => state.chat.sessions);
  const activeTab = useAppSelector((state) => state.chat.activeSidebarTab);

  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. NEW CHAT FUNCTIONALITY ---
  const handleNewChat = () => {
    const newId = Date.now().toString();
    dispatch(createNewChat({ id: newId, title: "New Conversation" }));

    // Close mobile menu if open
    dispatch(toggleMobileMenu(false));

    // Navigate
    navigate(`/chat/${newId}`);
  };

  const filteredChats = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={cn(
        "flex flex-col w-[280px] h-full border-r relative",
        isDark
          ? "bg-[#171717] border-[#2A2B32]"
          : "bg-[#F9F9FA] border-gray-200"
      )}
    >
      {/* Header Area */}
      <div className="flex flex-col px-3 pt-6 pb-2 gap-3 shrink-0">
        <button
          onClick={handleNewChat}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl w-full transition-all duration-200 shadow-sm border font-medium text-sm hover:scale-[1.02]",
            isDark
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-800"
          )}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>

        {activeTab === "home" && <ModelSelector />}

        {/* Simple Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none",
              isDark ? "bg-[#212121] text-white" : "bg-white border"
            )}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="text-center opacity-50 text-xs mt-4">
            No conversations yet
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                navigate(`/chat/${chat.id}`);
                dispatch(toggleMobileMenu(false)); // Close mobile menu on click
              }}
              className={cn(
                "group flex items-center justify-between px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors",
                isDark
                  ? "hover:bg-[#2A2B32] text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0 opacity-70" />
                <span className="truncate">{chat.title}</span>
              </div>
              <button
                title="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(deleteChat(chat.id));
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContextSidebar;
