import React, { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  BookOpen,
  Clock,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  createNewChat,
  deleteChat,
  toggleMobileMenu,
} from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";
import ModelSelector from "./ModelSelector";

const ContextSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const sessions = useAppSelector((state) => state.chat.sessions);
  const activeTab = useAppSelector((state) => state.chat.activeSidebarTab);

  const [searchTerm, setSearchTerm] = useState("");

  const handleNewChat = () => {
    const newId = Date.now().toString();
    dispatch(createNewChat({ id: newId, title: "New Conversation" }));
    dispatch(toggleMobileMenu(false));
    navigate(`/chat/${newId}`);
  };

  const filteredChats = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 1. LIBRARY CONTEXT VIEW ---
  if (activeTab === "library") {
    return (
      <div
        className={cn(
          "flex flex-col w-[280px] h-full border-r relative transition-colors",
          isDark
            ? "bg-[#171717] border-[#2A2B32]"
            : "bg-[#F9F9FA] border-gray-200"
        )}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2
            className={cn(
              "font-bold flex items-center gap-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            <BookOpen size={18} className="text-indigo-500" />
            Library
          </h2>
        </div>
        <div className="p-4 space-y-2">
          <button
            className={cn(
              "w-full text-left p-3 rounded-lg text-sm flex items-center gap-3 transition-colors",
              isDark
                ? "hover:bg-[#2A2B32] text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            )}
          >
            <Folder size={16} /> My Prompts
          </button>
          <button
            className={cn(
              "w-full text-left p-3 rounded-lg text-sm flex items-center gap-3 transition-colors",
              isDark
                ? "hover:bg-[#2A2B32] text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            )}
          >
            <Folder size={16} /> Community
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center opacity-30 text-xs">
          Select a category
        </div>
      </div>
    );
  }

  // --- 2. HOME & HISTORY CONTEXT VIEW ---
  return (
    <div
      className={cn(
        "flex flex-col w-[280px] h-full border-r relative transition-colors",
        isDark
          ? "bg-[#171717] border-[#2A2B32]"
          : "bg-[#F9F9FA] border-gray-200"
      )}
    >
      <div className="flex flex-col px-3 pt-6 pb-2 gap-3 shrink-0">
        {/* Dynamic Header based on Tab */}
        {activeTab === "history" ? (
          <div className="flex items-center gap-2 px-1 mb-2">
            <Clock size={16} className="text-indigo-500" />
            <span
              className={cn(
                "font-bold text-sm",
                isDark ? "text-white" : "text-black"
              )}
            >
              Recent History
            </span>
          </div>
        ) : (
          /* Only show New Chat & Model Selector on Home */
          <>
            <button
              onClick={handleNewChat}
              className={cn(
                "flex items-center justify-center gap-2 pl-2 pr-5 py-3 rounded-xl w-full transition-all duration-200 shadow-sm border font-medium text-sm hover:scale-[1.02] active:scale-95",
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              )}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Chat</span>
            </button>
            <ModelSelector />
          </>
        )}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={
              activeTab === "history" ? "Filter history..." : "Search chats..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all",
              isDark
                ? "bg-[#212121] text-white focus:bg-[#2a2a2a]"
                : "bg-white border border-gray-200 focus:border-indigo-500"
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-40 space-y-2">
            <MessageSquare color={isDark ? "white" : "black"} size={24} />
            <div className={cn("text-xs", isDark ? "text-white" : "text-black")}>No conversations found</div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                navigate(`/chat/${chat.id}`);
                dispatch(toggleMobileMenu(false));
              }}
              className={cn(
                "group flex items-center justify-between px-3 py-3 rounded-lg text-sm cursor-pointer transition-all border border-transparent",
                isDark
                  ? "hover:bg-[#2A2B32] text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isDark ? "bg-indigo-500" : "bg-indigo-600"
                  )}
                />
                <span className="truncate opacity-90">{chat.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(deleteChat(chat.id));
                  if (sessions.length <= 1) navigate("/");
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                title="Delete Chat"
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
