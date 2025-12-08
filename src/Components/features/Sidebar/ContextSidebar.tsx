import React from "react";
import { SquarePen } from "lucide-react"; // "New Chat" icon
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { createNewChat } from "../../../store/chatSlice";
import ChatList from "./ChatList";
import { cn } from "../../../utils/cn";
import { useNavigate } from "react-router-dom";

const ContextSidebar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleNewChat = () => {
    const newId = Date.now().toString();
    dispatch(createNewChat({ id: newId, title: "New Conversation" }));
    navigate(`/chat/${newId}`);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[53px]">
        <h2
          className={cn(
            "text-xl font-extrabold ml-2",
            isDark ? "text-[#E7E9EA]" : "text-black"
          )}
        >
          Grok
        </h2>

        <button
          onClick={handleNewChat}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDark
              ? "text-[#E7E9EA] hover:bg-[#181818]"
              : "text-black hover:bg-gray-100"
          )}
          title="New Chat"
        >
          <SquarePen size={20} />
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

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t",
          isDark ? "border-[#2F3336]" : "border-gray-200"
        )}
      >
        <button className="text-[#1D9BF0] text-sm hover:underline">
          View all
        </button>
      </div>
    </div>
  );
};

export default ContextSidebar;
