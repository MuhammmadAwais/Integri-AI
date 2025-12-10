import React, { useState , useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  PenSquare,
  AudioWaveform,
  Image as ImageIcon,
  FolderOpen,
  History,
  ChevronsLeft,
  ChevronsRight,

  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux"; // Adjust path if needed
import { useGetChatsQuery } from "../../chat/services/chatService";// Adjust path if needed
import { cn } from "../../../lib/utils";// Adjust path if needed
import HistoryModal from "./HistoryModal";

// --- NAVIGATION ITEMS CONFIG ---
const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: PenSquare, path: "/" },
  { id: "voice", label: "Voice", icon: AudioWaveform, path: "/voice" },
  { id: "imagine", label: "Imagine", icon: ImageIcon, path: "/imagine" },
  { id: "projects", label: "Projects", icon: FolderOpen, path: "/projects" },
];

const Sidebar: React.FC = () => {
  // State
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state:any) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);
  const SearchinputRef = useRef<HTMLInputElement | null>(null);
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? e.metaKey : e.ctrlKey;

  if (modKey && e.altKey && e.key.toLowerCase() === "i") {
    e.preventDefault();
    SearchinputRef.current?.focus();
  } else if (modKey && e.key.toLowerCase() === "k") {
    e.preventDefault();
    SearchinputRef.current?.focus();
  }
};

     document.addEventListener("keydown", handleKeyDown);
     return () => document.removeEventListener("keydown", handleKeyDown);
   }, []);


  // Data
  const { data: chats = [] } = useGetChatsQuery(user?.id || "guest");

  // Filter Logic
  const filteredChats = chats
    .filter((c) =>
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  // Styling Constants
  const COLLAPSED_ICON_SIZE = 20;

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <HistoryModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div
        className={cn(
          // CORE LAYOUT & ANIMATION
          "flex flex-col h-full border-r transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative z-40 select-none",

          // WIDTH LOGIC
          isExpanded ? "w-60" : "w-[60px]",

          // BACKGROUND COLORS (Crucial for fixing glitches)
          isDark
            ? "bg-[#000000] border-[#1F1F1F] text-[#E7E9EA]"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {/* --- 1. HEADER LOGO --- */}
        <div
          className={cn(
            "flex items-center my-2 h-[52px]",
            isExpanded ? "px-5" : "justify-center"
          )}
        >
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src={isDark ? "/dark-theme-logo.png" : "/light-theme-logo.png"}
              alt="logo"
              className="h-8 w-auto "
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
              ref={SearchinputRef}
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
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              isExpanded={isExpanded}
              onClick={() => handleNavClick(item.path)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* --- 4. HISTORY --- */}
        <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar px-2">
          {isExpanded ? (
            <div className="animate-in fade-in duration-300">
              {/* Header with Toggle */}
              <button
                className={cn(
                  "flex justify-between items-center w-full px-2 py-2 text-[#71767B]  transition-colors group mb-1",
                  isDark ? "hover:text-white" : "hover:text-black"
                )}
              >
                <Link
                  to="/history"
                  className="flex items-center gap-2 font-bold "
                >
                  <History className="mt-0.5" size={14} />
                  <span className="text-[13px] font-abold ">History</span>
                </Link>
                {isHistoryOpen ? (
                  <ChevronDown
                    className="hover:cursor-pointer"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    size={12}
                  />
                ) : (
                  <ChevronRight
                    className="hover:cursor-pointer"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    size={12}
                  />
                )}
              </button>

              {/* Dropdown Content */}
              {isHistoryOpen && (
                <div className="pl-2 space-y-4">
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
                  <button
                    onClick={() => setShowModal(true)}
                    className={cn(
                      "text-[12px] text-[#71767B]  px-2 py-1 hover:underline text-left block w-full hover:cursor-pointer",
                      isDark ? "hover:text-white" : "hover:text-black"
                    )}
                  >
                    See all
                  </button>
                </div>
              )}
            </div>
          ) : (
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
            <div className="relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
            </div>

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

// --- HELPER COMPONENT ---
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
