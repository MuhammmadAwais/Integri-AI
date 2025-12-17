import React, { useState } from "react";
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
import { SessionService } from "../../../api/backendApi";
import { useChatList } from "../../chat/hooks/useChat";
import { cn } from "../../../lib/utils";
import DeleteModal from "../../../Components/ui/DeleteModal";
// 1. Import AVAILABLE_MODELS to lookup the provider
import  AVAILABLE_MODELS  from "../../../../Constants";

const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux State
  const isOpen = useAppSelector((state: any) => state.chat.isMobileMenuOpen);
  {
    isOpen;
  } // FOR VERCEL FIX
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const user = useAppSelector((state: any) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.token);
  const currentModel = useAppSelector((state: any) => state.chat.currentModel);

  // Local State for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Data Fetching
  const { chats, handleDeleteChat, refreshChats } = useChatList(user?.id);

  // --- ACTIONS ---

  const handleNavigation = (path: string) => {
    navigate(path);
    dispatch(toggleMobileMenu(false));
  };

  const handleNewChat = async () => {
    if (!token) return;
    try {
      // 2. Resolve the correct Provider for the current model
      const modelId = currentModel || "gpt-5.1";
      const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
      const provider = modelConfig ? modelConfig.provider : "openai";

      // 3. Pass 'provider' to the createSession call
      const response = await SessionService.createSession(
        token,
        modelId,
        provider
      );

      const newSessionId =
        response?.session_id || response?.id || response?._id;

      if (newSessionId) {
        if (refreshChats) refreshChats(); // Ensure list updates
        navigate(`/chat/${newSessionId}`);
        dispatch(toggleMobileMenu(false));
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  // --- DELETE HANDLERS ---

  const requestDelete = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setChatToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (chatToDelete && handleDeleteChat) {
      await handleDeleteChat(chatToDelete);

      // If we are currently on the deleted page, go home
      if (location.pathname.includes(chatToDelete)) {
        navigate("/");
      }

      setChatToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      {/* Scrollbar Styles (Same as Desktop) */}
      <style>{`
        .mobile-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .mobile-scrollbar:hover {
          scrollbar-color: ${isDark ? "#333" : "#CCC"} transparent;
        }
        .mobile-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .mobile-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .mobile-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
        }
        .mobile-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: ${isDark ? "#333" : "#CCC"};
        }
      `}</style>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDark={isDark}
      />

      <div className="flex flex-col h-full w-full relative">
        {/* 1. Header */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <History
              size={20}
              className={isDark ? "text-white" : "text-black"}
            />
            <h2
              className={cn(
                "text-lg font-bold",
                isDark ? "text-white" : "text-black"
              )}
            >
              History
            </h2>
          </div>
          <button
            title="Close Menu"
            onClick={() => dispatch(toggleMobileMenu(false))}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDark
                ? "hover:bg-[#1A1A1A] text-white"
                : "hover:bg-gray-100 text-black"
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Navigation Grid & New Chat */}
        <div className="px-4 mb-2 shrink-0">
          {/* New Chat Button - Now uses correct Provider logic */}
          <button
            onClick={handleNewChat}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium mb-4 transition-all active:scale-[0.98]",
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-800"
            )}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>

          {/* Quick Nav Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
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
        </div>

        {/* 3. Recent Chats Header */}
        <div className="px-6 py-2 shrink-0">
          <span className="text-[#71767B] text-xs font-bold uppercase tracking-wider">
            Recent Chats
          </span>
        </div>

        {/* 4. Scrollable Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 mobile-scrollbar min-h-0">
          <div className="space-y-1">
            {chats.length === 0 ? (
              <div className="text-center py-8 opacity-50 text-sm">
                No recent conversations
              </div>
            ) : (
              chats.map((chat) => {
                const sessionId = chat.session_id || chat.id;
                if (!sessionId) return null; // Skip invalid

                return (
                  <div
                    key={sessionId}
                    onClick={() => {
                      navigate(`/chat/${sessionId}`);
                      dispatch(toggleMobileMenu(false));
                    }}
                    className={cn(
                      "group relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-sm",
                      location.pathname.includes(sessionId)
                        ? isDark
                          ? "bg-[#2A2B32] text-white font-medium"
                          : "bg-gray-100 text-gray-900 font-medium"
                        : isDark
                        ? "text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <MessageSquare
                        size={16}
                        className="shrink-0 opacity-60"
                      />
                      <span className="truncate pr-2">
                        {chat.title || "New Chat"}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      title="Delete Chat"
                      onClick={(e) => requestDelete(e, sessionId)}
                      className={cn(
                        "p-2 rounded-full transition-colors shrink-0 z-10",
                        isDark
                          ? "text-gray-500 hover:text-red-400 hover:bg-[#3A3B42]"
                          : "text-gray-400 hover:text-red-600 hover:bg-gray-200"
                      )}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Helper Component for the 4-grid Icons (Unchanged UI)
const NavTile = ({ icon: Icon, label, active, onClick, isDark }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer h-[70px]",
      active
        ? isDark
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-100 text-black"
        : isDark
        ? "text-gray-500 hover:bg-[#111] hover:text-gray-300"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <Icon
      size={20}
      strokeWidth={active ? 2.5 : 2}
      className={active ? "text-indigo-500" : "opacity-70"}
    />
    <span
      className={cn(
        "text-[10px] font-medium",
        active ? "opacity-100" : "opacity-60"
      )}
    >
      {label}
    </span>
  </button>
);

export default MobileSidebar;
