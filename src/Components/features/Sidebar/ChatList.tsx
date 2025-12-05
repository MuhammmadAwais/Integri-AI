import React from "react";
import {
  useGetChatsQuery,
  useDeleteChatMutation,
} from "../../../store/apis/chatAPI";
import { useAppSelector } from "../../hooks/useRedux";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { cn } from "../../../utils/cn";

const ChatList: React.FC = () => {
  const { id: activeChatId } = useParams();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);

  // GUEST LOGIC FIX:
  // If user is logged in, use their ID. If not, use "guest".
  // This matches the ID we use when creating chats in Welcome.tsx
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
        <Loader2 className="animate-spin mb-2" size={20} />
        <span className="text-xs">Loading history...</span>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 px-4 text-center opacity-40">
        <MessageSquare size={32} className="mb-2" />
        <p className="text-sm font-medium">No chats yet</p>
        <p className="text-xs">Start a new conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
      <div className="text-xs font-semibold text-gray-500 mb-2 px-2 mt-4 uppercase tracking-wider">
        Recents
      </div>
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/chat/${chat.id}`}
          className={cn(
            "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm",
            activeChatId === chat.id
              ? isDark
                ? "bg-[#212121] text-white"
                : "bg-gray-200 text-gray-900"
              : isDark
              ? "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <MessageSquare size={16} className="shrink-0 opacity-70" />
          <span className="truncate flex-1 pr-6">
            {chat.title || "New Conversation"}
          </span>

          <button
            onClick={(e) => handleDelete(e, chat.id)}
            className={cn(
              "absolute right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
              isDark
                ? "hover:bg-red-900/30 text-gray-400 hover:text-red-400"
                : "hover:bg-red-100 text-gray-500 hover:text-red-600"
            )}
            title="Delete Chat"
          >
            <Trash2 size={14} />
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
