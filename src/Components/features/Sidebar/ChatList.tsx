import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  useGetChatsQuery,
  useDeleteChatMutation,
} from "../../../store/apis/chatAPI";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";

interface ChatListProps {
  searchTerm?: string;
}

const ChatList: React.FC<ChatListProps> = ({ searchTerm = "" }) => {
  const { data: chats = [], isLoading } = useGetChatsQuery();
  const [deleteChat] = useDeleteChatMutation();
  const isDark = useAppSelector((state) => state.theme.isDark);

  // Filter chats based on debounce search
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="p-4 text-xs opacity-50 animate-pulse">
        Loading chats...
      </div>
    );

  return (
    <div className="flex-1 px-2 py-2 space-y-1">
      <div
        className={cn(
          "px-2 py-2 text-xs font-semibold uppercase tracking-wider mb-1",
          isDark ? "text-gray-500" : "text-gray-400"
        )}
      >
        {searchTerm ? "Search Results" : "Recent Chats"}
      </div>

      {filteredChats.length === 0 ? (
        <div className="p-4 text-center text-xs opacity-50">
          No chats found.
        </div>
      ) : (
        filteredChats.map((chat) => (
          <NavLink
            key={chat.id}
            to={`/chat/${chat.id}`}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer border border-transparent",
                isDark
                  ? isActive
                    ? "bg-[#2A2B32] text-white border-[#3e3f4b]"
                    : "text-gray-300 hover:bg-[#2A2B32]/50 hover:text-white"
                  : isActive
                  ? "bg-white text-gray-900 shadow-sm border-gray-200"
                  : "text-gray-600 hover:bg-gray-100"
              )
            }
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className="shrink-0 opacity-70" />
              <span className="truncate">{chat.title}</span>
            </div>

            <button
              type="button"
              title="Delete Chat"
              onClick={(e) => {
                e.preventDefault();
                deleteChat(chat.id);
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all hover:scale-110",
                isDark
                  ? "hover:bg-red-500/20 hover:text-red-400"
                  : "hover:bg-red-100 hover:text-red-600"
              )}
            >
              <Trash2 size={12} />
            </button>
          </NavLink>
        ))
      )}
    </div>
  );
};

export default ChatList;
