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
  const { data: chats = [], isLoading } = useGetChatsQuery();
  const [deleteChat] = useDeleteChatMutation();
  const isDark = useAppSelector((state) => state.theme.isDark);

  if (isLoading)
    return <div className="p-4 text-xs opacity-50">Loading chats...</div>;

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
      <div>
        <h3
          className={cn(
            "px-3 text-xs font-semibold mb-2",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          CHATS
        </h3>
        <div className="space-y-1">
          {chats.map((chat) => (
            <NavLink
              key={chat.id}
              to={`/chat/${chat.id}`}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                  isDark
                    ? isActive
                      ? "bg-[#2A2B32] text-white"
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
              title="button"
                onClick={(e) => {
                  e.preventDefault();
                  deleteChat(chat.id);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 p-1 rounded transition-all",
                  isDark
                    ? "hover:bg-gray-700 hover:text-red-400"
                    : "hover:bg-gray-200 hover:text-red-600"
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
