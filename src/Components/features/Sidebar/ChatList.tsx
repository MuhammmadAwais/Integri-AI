import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  useGetChatsQuery,
  useDeleteChatMutation,
} from "../../../store/apis/chatAPI";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";

const ChatList: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);

  // Only fetch chats for THIS user
  const { data: chats = [], isLoading } = useGetChatsQuery(user?.id || "", {
    skip: !user, // Don't fetch if not logged in
  });

  const [deleteChat] = useDeleteChatMutation();

  if (isLoading)
    return (
      <div className="p-4 text-xs opacity-50 animate-pulse">
        Loading chats...
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
      <div
        className={cn(
          "px-2 py-2 text-xs font-semibold uppercase tracking-wider mb-1 opacity-50"
        )}
      >
        History
      </div>

      {chats.length === 0 ? (
        <div className="text-center text-xs opacity-30 mt-4">
          No history yet
        </div>
      ) : (
        chats.map((chat) => (
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
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              )
            }
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
              <span className="truncate">{chat.title}</span>
            </div>

            <button
            title="Delete chat"
              onClick={(e) => {
                e.preventDefault();
                deleteChat(chat.id);
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 p-1 rounded transition-all",
                "hover:bg-red-500/20 hover:text-red-500"
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </NavLink>
        ))
      )}
    </div>
  );
};

export default ChatList;
