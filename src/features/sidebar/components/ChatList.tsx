import React from "react";
import {
  useGetChatsQuery,
  useDeleteChatMutation,
} from "../../chat/services/chatService";
import { useAppSelector } from "../../../hooks/useRedux";
import { Trash2, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";

const ChatList: React.FC = () => {
  const { id: activeChatId } = useParams();
  const isDark = useAppSelector((state:any) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.id || "guest";

  const { data: chats = [], isLoading } = useGetChatsQuery(currentUserId);
  const [deleteChat] = useDeleteChatMutation();

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteChat(chatId).unwrap();
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-20 opacity-50">
        <Loader2 className="animate-spin mb-2" size={16} />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-gray-500">No recent conversations</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/chat/${chat.id}`}
          className={cn(
            "group relative flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 text-sm",
            activeChatId === chat.id
              ? isDark
                ? "bg-[#181818] text-white font-medium"
                : "bg-gray-200 text-gray-900 font-medium"
              : isDark
              ? "text-gray-400 hover:bg-[#111] hover:text-gray-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <span className="truncate flex-1">{chat.title || "New Chat"}</span>

          <button
          title="More Options"
            onClick={(e) => handleDelete(e, chat.id)}
            className={cn(
              "opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all",
              isDark
                ? "hover:bg-[#2f2f2f] text-gray-500 hover:text-red-400"
                : "hover:bg-gray-200 text-gray-400 hover:text-red-600"
            )}
          >
            <Trash2 size={13} />
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
