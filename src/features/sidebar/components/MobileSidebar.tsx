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
import { SessionService } from "../../../api/backendApi"; // NEW LOGIC
import { useChatList } from "../../chat/hooks/useChat";
import { cn } from "../../../lib/utils";

const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = useAppSelector((state: any) => state.chat.isMobileMenuOpen);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const user = useAppSelector((state: any) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.token); // NEW LOGIC

  // Fetch chats using hook
  const { chats: sessions = [] } = useChatList(user?.id);

  // --- ACTIONS ---
  const handleNavigation = (path: string) => {
    navigate(path);
    dispatch(toggleMobileMenu(false));
  };

  const handleNewChat = async () => {
    if (!token) return; // NEW LOGIC
    try {
      // NEW LOGIC
      const response = await SessionService.createSession(token, "gpt-4o");
      if (response && response.session_id) {
        navigate(`/chat/${response.session_id}`);
        dispatch(toggleMobileMenu(false));
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!token) return; // NEW LOGIC
    if (window.confirm("Delete this chat?")) {
      try {
        await SessionService.deleteSession(token, chatId); // NEW LOGIC
        window.location.reload();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity"
          onClick={() => dispatch(toggleMobileMenu(false))}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-[85%] max-w-[320px] transition-transform duration-300 ease-out transform flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isDark
            ? "bg-[#090909] border-r border-[#222]"
            : "bg-white border-r border-gray-200"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-transparent">
          <h2
            className={cn(
              "text-xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Integri-AI
          </h2>
          <button
            onClick={() => dispatch(toggleMobileMenu(false))}
            className={cn(
              "p-2 rounded-full",
              isDark
                ? "text-gray-400 hover:bg-[#222]"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <X size={24} />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="px-4 mt-4">
          <button
            onClick={handleNewChat}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-full font-medium transition-all shadow-sm active:scale-95",
              isDark
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            )}
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 grid grid-cols-4 gap-2 border-b border-transparent">
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

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h3
            className={cn(
              "text-xs font-bold uppercase mb-3",
              isDark ? "text-gray-500" : "text-gray-400"
            )}
          >
            Recent Conversations
          </h3>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <p className="text-sm opacity-50 italic">No recent chats</p>
            ) : (
              sessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleNavigation(`/chat/${chat.id}`)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl text-sm transition-colors cursor-pointer",
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
        ? "text-gray-400 hover:bg-[#1A1A1A]"
        : "text-gray-500 hover:bg-gray-100"
    )}
  >
    <Icon size={20} strokeWidth={2.5} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default MobileSidebar;
