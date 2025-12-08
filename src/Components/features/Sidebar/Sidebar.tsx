import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  PenSquare, // Better match for the 'Chat' icon in image
  AudioWaveform,
  Image as ImageIcon,
  FolderOpen,
  History,
  ChevronsLeft,
  ChevronsRight,
  Orbit,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import { useGetChatsQuery } from "../../../store/apis/chatAPI";
import { cn } from "../../../utils/cn";
import HistoryModal from "./HistoryModal";

const Sidebar: React.FC = () => {
  // State
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true); // Toggle for History dropdown
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);

  // Data
  const { data: chats = [] } = useGetChatsQuery(user?.id || "guest");

  // Filter Logic for Sidebar Search
  const filteredChats = chats
    .filter((c) =>
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5); // Limit to 5 for sidebar

  // --- STYLING CONSTANTS (Sleeker, Smaller) ---
  const BASE_TEXT_SIZE = "text-[13.5px]"; // Explicitly requested smaller font
  const ICON_SIZE = 18;
  const COLLAPSED_ICON_SIZE = 20;

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <HistoryModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div
        className={cn(
          // Added 'bg-black' or 'bg-white' explicitly to prevent transparency on mobile
          "flex flex-col h-full border-r transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative z-40 select-none",
          isExpanded ? "w-[240px]" : "w-[60px]",
          // Ensure background is solid!
          isDark
            ? "bg-[#000000] border-[#1F1F1F] text-[#E7E9EA]"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {/* --- 1. HEADER LOGO --- */}
        <div
          className={cn(
            "flex items-center h-[52px]",
            isExpanded ? "px-5" : "justify-center"
          )}
        >
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Orbit
              size={26}
              strokeWidth={2.5}
              className={isDark ? "text-white" : "text-black"}
            />
          </Link>
        </div>

        {/* --- 2. SEARCH --- */}
        <div className="px-3 mb-2">
          {isExpanded ? (
            <div
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all group",
                isDark
                  ? "bg-[#101010] border-[#1F1F1F] focus-within:border-gray-700 focus-within:bg-black"
                  : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-gray-300"
              )}
            >
              <Search size={14} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className={cn(
                  "bg-transparent border-none outline-none w-full text-[13px] placeholder:text-gray-500",
                  isDark ? "text-white" : "text-black"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="text-[10px] text-gray-600 font-medium">
                Ctrl+K
              </span>
            </div>
          ) : (
            <button
              title="Search"
              onClick={() => setIsExpanded(true)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isDark
                  ? "hover:bg-[#1A1A1A] text-gray-400"
                  : "hover:bg-gray-100"
              )}
            >
              <Search size={COLLAPSED_ICON_SIZE} />
            </button>
          )}
        </div>

        {/* --- 3. MAIN NAV --- */}
        <div className="flex flex-col gap-0.5 px-2">
          <NavItem
            icon={PenSquare}
            label="Chat"
            isActive={location.pathname === "/"}
            isExpanded={isExpanded}
            onClick={() => handleNavClick("/")}
            isDark={isDark}
          />
          <NavItem
            icon={AudioWaveform}
            label="Voice"
            isActive={location.pathname === "/voice"}
            isExpanded={isExpanded}
            onClick={() => handleNavClick("/voice")}
            isDark={isDark}
          />
          <NavItem
            icon={ImageIcon}
            label="Imagine"
            isActive={location.pathname === "/imagine"}
            isExpanded={isExpanded}
            onClick={() => handleNavClick("/imagine")}
            isDark={isDark}
          />
          <NavItem
            icon={FolderOpen}
            label="Projects"
            isActive={location.pathname === "/projects"}
            isExpanded={isExpanded}
            onClick={() => handleNavClick("/projects")}
            isDark={isDark}
          />
        </div>

        {/* --- 4. HISTORY --- */}
        <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar px-2">
          {isExpanded ? (
            <div className="animate-in fade-in duration-300">
              {/* Header with Toggle */}

              <button
                className={cn(
                  "flex items-center justify-between gap-2 w-full px-2 py-2 text-[#71767B]  transition-colors group mb-1"
                )}
              >
                <Link to="/history">
                  <span
                    className={cn(
                      " text-[14px] font-bold flex items-center gap-2 text-left",
                      isDark ? "hover:text-white" : "hover:text-black"
                    )}
                  >
                    <History size={14} />
                    History
                  </span>
                </Link>
                {isHistoryOpen ? (
                  <ChevronDown
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    size={12}
                    className={cn(
                      "hover:cursor-pointer ",
                      isDark ? "hover:text-white" : "hover:text-black"
                    )}
                  />
                ) : (
                  <ChevronRight
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    size={12}
                    className={cn(
                      "hover:cursor-pointer ",
                      isDark ? "hover:text-white" : "hover:text-black"
                    )}
                  />
                )}
              </button>

              {/* Dropdown Content */}
              {isHistoryOpen && (
                <div className="pl-2 space-y-4">
                  {/* Today Section */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#505050] px-2 mb-1">
                      Today
                    </h4>
                    {filteredChats.length === 0 ? (
                      <div className="text-[12px] text-gray-600 px-2 py-1">
                        No chats found
                      </div>
                    ) : (
                      filteredChats.map((chat) => (
                        <Link
                          key={chat.id}
                          to={`/chat/${chat.id}`}
                          className={cn(
                            "block px-2 py-1 rounded text-[13px] truncate transition-colors",
                            isDark
                              ? "text-[#E7E9EA] hover:bg-[#1A1A1A]"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {chat.title || "New Conversation"}
                        </Link>
                      ))
                    )}
                  </div>

                  {/* See All Button */}
                  <button
                    onClick={() => setShowModal(true)}
                    className={cn(
                      "text-[12px] text-[#71767B] hover:cursor-pointer px-2 py-1 hover:underline text-left block w-full",
                      isDark ? "hover:text-white" : "hover:text-black"
                    )}
                  >
                    See all
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Collapsed History Icon
            <button
              title="History"
              onClick={() => setIsExpanded(true)}
              className={cn(
                "w-9 h-9 mx-auto rounded-lg flex items-center justify-center transition-colors mt-2",
                isDark
                  ? "hover:bg-[#1A1A1A] text-gray-500"
                  : "hover:bg-gray-100"
              )}
            >
              <History size={COLLAPSED_ICON_SIZE} />
            </button>
          )}
        </div>

        {/* --- 5. FOOTER --- */}
        <div
          className={cn(
            "p-3 mt-auto",
            isDark ? "border-t border-[#1F1F1F]" : "border-t border-gray-200"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isExpanded ? "justify-between" : "justify-center flex-col"
            )}
          >
            {/* Profile Avatar */}
            <div className="relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                isDark
                  ? "hover:bg-[#1A1A1A] text-[#555]"
                  : "hover:bg-gray-100 text-gray-400"
              )}
            >
              {isExpanded ? (
                <ChevronsLeft size={18} />
              ) : (
                <ChevronsRight size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const NavItem = ({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
  isDark,
}: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 py-2 rounded-lg transition-all duration-150 group w-full text-left",
      isExpanded ? "px-3" : "justify-center px-0",
      isActive
        ? isDark
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-100 text-black"
        : isDark
        ? "text-[#999] hover:bg-[#111] hover:text-[#E7E9EA]"
        : "text-gray-600 hover:bg-gray-50"
    )}
  >
    <Icon size={18} strokeWidth={2} className="shrink-0" />
    {isExpanded && (
      <span className="text-[13.5px] font-medium leading-none pt-0.5">
        {label}
      </span>
    )}
  </button>
);

export default Sidebar;
