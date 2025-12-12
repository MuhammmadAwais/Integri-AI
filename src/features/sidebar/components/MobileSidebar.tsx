import React from "react";
import {
  X,
  MessageSquare,
  Plus,
  Home,
  History,
  Library,
  Settings,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { toggleMobileMenu } from "../../chat/chatSlice";
import { ChatService } from "../../chat/services/chatService";
import { useChatList } from "../../chat/hooks/useChat";
import { cn } from "../../../lib/utils";

const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = useAppSelector((state: any) => state.chat.isMobileMenuOpen);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const user = useAppSelector((state: any) => state.auth.user);

  // Fetch chats using hook
  const { chats: sessions = [] } = useChatList(user?.id);

  // --- ACTIONS ---
  const handleNavigation = (path: string) => {
    navigate(path);
    dispatch(toggleMobileMenu(false));
  };

  const handleNewChat = async () => {
    if (!user?.id) return;
    try {
      const newId = await ChatService.createChat(
        user.id,
        "gpt-3.5-turbo",
        "New Conversation"
      );
      dispatch(toggleMobileMenu(false));
      navigate(`/chat/${newId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    try {
      await ChatService.deleteChat(user.id, chatId);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-60 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => dispatch(toggleMobileMenu(false))}
      />

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 z-70 h-dvh w-[85%] max-w-[300px] shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col",
          isDark
            ? "bg-[#171717] border-r border-[#2A2B32]"
            : "bg-white border-r border-gray-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2A2B32]">
          <span
            className={cn(
              "font-bold text-lg tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Integri AI
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => dispatch(toggleMobileMenu(false))}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- MAIN NAVIGATION TILES --- */}
        <div className="grid grid-cols-4 gap-2 p-3 border-b border-gray-100 dark:border-[#2A2B32]">
          <NavTile
            icon={Home}
            label="Home"
            active={location.pathname === "/"}
            onClick={() => handleNavigation("/")}
            isDark={isDark}
          />
          <NavTile
            icon={History}
            label="History"
            active={location.pathname === "/history"}
            onClick={() => handleNavigation("/history")}
            isDark={isDark}
          />
          <NavTile
            icon={Library}
            label="Library"
            active={location.pathname === "/library"}
            onClick={() => handleNavigation("/library")}
            isDark={isDark}
          />
          <NavTile
            icon={Settings}
            label="Settings"
            active={location.pathname === "/settings"}
            onClick={() => handleNavigation("/settings")}
            isDark={isDark}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium mb-6 transition-all shadow-sm cursor-pointer active:scale-95",
              isDark ? "bg-white text-black" : "bg-black text-white"
            )}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>

          {/* Recent Chats List */}
          <div className="space-y-1">
            <div className="px-2 mb-2 text-xs font-bold uppercase opacity-50 tracking-wider">
              Recent Chats
            </div>

            {sessions.length === 0 ? (
              <div className="text-center opacity-40 text-sm py-4">
                No history yet
              </div>
            ) : (
              sessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleNavigation(`/chat/${chat.id}`)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer transition-colors",
                    isDark
                      ? "hover:bg-[#2A2B32] text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className="shrink-0 opacity-60" />
                    <span className="truncate">{chat.title || "New Chat"}</span>
                  </div>
                  <button
                    title="Delete Chat"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="p-1 opacity-50 hover:opacity-100 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Helper Component for the 4-grid Icons
const NavTile = ({ icon: Icon, label, active, onClick, isDark }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all cursor-pointer",
      active
        ? isDark
          ? "bg-indigo-600 text-white"
          : "bg-black text-white"
        : isDark
        ? "text-gray-400 hover:bg-[#2A2B32]"
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <Icon size={20} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default MobileSidebar;
