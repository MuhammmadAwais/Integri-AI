import React from "react";
import { SquarePen } from "lucide-react"; // "New Chat" icon
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import ChatList from "./ChatList";
import { useNavigate } from "react-router-dom";
import { SessionService } from "../../../api/backendApi"; // NEW LOGIC

const ContextSidebar: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.token); // NEW LOGIC
  const currentModel = useAppSelector((state: any) => state.chat.currentModel); // NEW LOGIC
  const navigate = useNavigate();

  const handleNewChat = async () => {
    if (!token) return; // NEW LOGIC
    try {
      // NEW LOGIC: Create Session via API
      const response = await SessionService.createSession(
        token,
        currentModel || "gpt-4o"
      );

      if (response && response.session_id) {
        navigate(`/chat/${response.session_id}`);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[53px]">
        <h2
          className={cn(
            "text-xl font-extrabold ml-2 hover:cursor-pointer",
            isDark ? "text-[#E7E9EA]" : "text-black"
          )}
        >
          Integri-AI
        </h2>

        <button
          onClick={handleNewChat}
          className={cn(
            "p-2 rounded-full transition-color hover:cursor-pointers",
            isDark
              ? "text-[#E7E9EA] hover:bg-[#181818]"
              : "text-black hover:bg-gray-100"
          )}
          title="New Chat"
        >
          <SquarePen className="hover:cursor-pointer" size={20} />
        </button>
      </div>

      {/* Recent Chats Label */}
      <div className="flex items-center justify-between px-6 py-2 mt-2">
        <span className="text-[#71767B] text-sm font-bold">Recent chats</span>
      </div>

      {/* Chat List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 mt-1">
        <ChatList />
      </div>
    </div>
  );
};

export default ContextSidebar;
