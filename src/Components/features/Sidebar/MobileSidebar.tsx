import React from "react";
import { X, MessageSquare, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMobileMenu } from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";
import ChatList from "./ChatList"; // Using your existing ChatList

const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chat.isMobileMenuOpen);
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => dispatch(toggleMobileMenu(false))}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          isDark ? "bg-[#171717]" : "bg-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span
            className={cn(
              "font-bold text-lg",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Integri AI
          </span>
          <button
          title="button"
            onClick={() => dispatch(toggleMobileMenu(false))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X
              size={20}
              className={isDark ? "text-gray-400" : "text-gray-600"}
            />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* New Chat Button */}
          <div className="px-4 mb-6">
            <button
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all",
                isDark ? "bg-white text-black" : "bg-black text-white"
              )}
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Reuse the ChatList Component */}
          <ChatList />
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
