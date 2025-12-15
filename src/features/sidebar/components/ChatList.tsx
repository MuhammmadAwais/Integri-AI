import React from "react";
import { useChatList } from "../../chat/hooks/useChat";
import { SessionService } from "../../../api/backendApi"; // NEW LOGIC
import { useAppSelector } from "../../../hooks/useRedux";
import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";

const ChatList: React.FC = () => {
  const { id: activeChatId } = useParams();
  const navigate = useNavigate();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const user = useAppSelector((state: any) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.token); // NEW LOGIC

  // Fetch chats
  const { chats = [], loading } = useChatList(user?.id);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Critical: Stop click from bubbling to the row
    if (!token) return; // NEW LOGIC

    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        // NEW LOGIC: Call backend
        await SessionService.deleteSession(token, chatId);

        // If deleting the currently active chat, redirect to home
        if (activeChatId === chatId) {
          navigate("/");
        }
        window.location.reload(); // Refresh list
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
  };

  if (loading) {
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
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className={cn(
            "group relative flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 text-sm cursor-pointer",
            activeChatId === chat.id
              ? isDark
                ? "bg-[#181818] text-white font-medium"
                : "bg-gray-200 text-gray-900 font-medium"
              : isDark
              ? "text-gray-400 hover:bg-[#111] hover:text-gray-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          {/* Icon */}
          <MessageSquare size={15} className="shrink-0 opacity-70" />

          {/* Title - flex-1 pushes button to the right, truncate handles overflow */}
          <span className="truncate flex-1 text-left select-none">
            {chat.title || "New Chat"}
          </span>

          {/* Delete Button - Always Visible, High Z-Index, No Shrink */}
          <button
            title="Delete Chat"
            onClick={(e) => handleDelete(e, chat.id)}
            className={cn(
              "shrink-0 p-2 rounded-full transition-colors z-20 relative",
              isDark
                ? "text-gray-500 hover:text-red-400 hover:bg-[#2f2f2f]"
                : "text-gray-400 hover:text-red-600 hover:bg-gray-200"
            )}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
