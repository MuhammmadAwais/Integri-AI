import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  PenSquare,
  Image as ImageIcon,
  History,
  ChevronDown,
  ChevronRight,
  Trash2,
  FileText,
  CheckCircle,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux";
import { useChatList } from "../../chat/hooks/useChat";
import { cn } from "../../../lib/utils";
import HistoryModal from "./HistoryModal";
import DeleteModal from "../../../Components/ui/DeleteModal";
import UserProfile from "./UserProfile";

// --- NAVIGATION ITEMS: labels come from t() inside component ---
const NAV_ITEMS = [
  { id: "chat", labelKey: "nav.chat", icon: MessageCircle, path: "/" },
  { id: "playground", labelKey: "nav.multiChats", icon: PenSquare, path: "/playground" },
  { id: "agents", labelKey: "nav.agents", icon: CheckCircle, path: "/agents" },
  { id: "imageGen", labelKey: "nav.imageGen", icon: ImageIcon, path: "/imageGen" },
  { id: "pdf", labelKey: "nav.pdfChat", icon: FileText, path: "/pdf" },
  { id: "news", labelKey: "nav.news", icon: Newspaper, path: "/news" },
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  // State
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const SearchinputRef = useRef<HTMLInputElement | null>(null);

  // Profile Functionailities
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (
        modKey &&
        (e.key.toLowerCase() === "k" ||
          (e.altKey && e.key.toLowerCase() === "i"))
      ) {
        e.preventDefault();
        SearchinputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Data Fetching
  const { chats = [], handleDeleteChat } = useChatList();
  // Filter Logic
  const filteredChats = chats.filter((c: any) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNavClick = (path: string) => {
    navigate(path);
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
      if (location.pathname.includes(chatToDelete)) {
        navigate("/");
      }
      setChatToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s;
        }
        .custom-scrollbar:hover {
          scrollbar-color: ${isDark ? "#333" : "#CCC"} transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: ${isDark ? "#333" : "#CCC"};
        }
      `}</style>

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDark={isDark}
      />

      <div
        className={cn(
          "flex flex-col h-full border-e transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative z-40 select-none",
          isExpanded ? "w-60" : "w-[60px]",
          isDark
            ? "bg-[#000000] border-[#1F1F1F] text-[#E7E9EA]"
            : "bg-white border-gray-200 text-gray-900",
        )}
      >
        {/* --- 1. HEADER LOGO --- */}
        <div
          className={cn(
            "flex items-center my-2 h-[52px]",
            isExpanded ? "ps-5 pe-5" : "justify-center",
          )}
        >
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1
              className={cn(
                "",
                isExpanded
                  ? "text-2xl font-extrabold"
                  : "text xs font-semibold",
              )}
            >
              {t("sidebar.integri")}
            </h1>
          </Link>
        </div>

        {/* --- 2. SEARCH --- */}
        <div className="ps-4 pe-4 mb-2">
          {isExpanded ? (
            <div
              className={cn(
                "flex items-center gap-2.5 ps-3 pe-3 py-1.5 rounded-full border transition-all group",
                isDark
                  ? "bg-[#101010] border-[#1F1F1F] focus-within:border-gray-700 focus-within:bg-black"
                  : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-gray-300",
              )}
            >
              <Search size={14} className="text-gray-500" />
              <input
                ref={SearchinputRef}
                type="text"
                placeholder={t("sidebar.searchPlaceholder")}
                className={cn(
                  "bg-transparent border-none outline-none w-full text-[13px] placeholder:text-gray-500",
                  isDark ? "text-white" : "text-black",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="text-[10px] text-gray-600 font-medium">
                {t("nav.searchShortcut")}
              </span>
            </div>
          ) : (
            <button
              title={t("common.search")}
              onClick={() => setIsExpanded(true)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                isDark
                  ? "hover:bg-[#1A1A1A] text-gray-400"
                  : "hover:bg-gray-100",
              )}
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* --- 3. MAIN NAV --- */}
        <div className="flex flex-col gap-0.5 ps-4 pe-4">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={t(item.labelKey)}
              isActive={location.pathname === item.path}
              isExpanded={isExpanded}
              onClick={() => handleNavClick(item.path)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* --- 4. HISTORY --- */}
        <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar ps-4 pe-4">
          {isExpanded ? (
            <div className="animate-in fade-in duration-300">
              <button
                className={cn(
                  "flex justify-between items-center w-full ps-2 pe-2 py-2 text-[#71767B]  transition-colors group mb-1",
                  isDark ? "hover:text-white" : "hover:text-black",
                )}
              >
                <Link
                  to="/history"
                  className="flex items-center gap-2 font-bold "
                >
                  <History className="mt-0.5" size={14} />
                  <span className="text-[13px] font-abold ">{t("nav.history")}</span>
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

              {isHistoryOpen && (
                <div className="ps-4 space-y-1">
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#505050] ps-2 pe-2 mb-1 mt-2">
                      {t("nav.recent")}
                    </h4>
                    {filteredChats.length === 0 ? (
                      <div className="text-[12px] text-gray-600 ps-2 pe-2 py-1">
                        {t("nav.noChatsFound")}
                      </div>
                    ) : (
                      filteredChats.map((chat: any) => {
                        const sessionId = chat.session_id || chat.id;
                        if (!sessionId) return null;

                        return (
                          <div key={sessionId} className="group relative">
                            <Link
                              to={`/chat/${sessionId}`}
                              className={cn(
                                "block ps-2 pe-8 py-1 rounded text-[13px] truncate transition-colors",
                                isDark
                                  ? "text-[#E7E9EA] hover:bg-[#1A1A1A]"
                                  : "text-gray-700 hover:bg-gray-100",
                                location.pathname.includes(sessionId) &&
                                (isDark ? "bg-[#1A1A1A]" : "bg-gray-100"),
                              )}
                            >
                              {chat.title || t("common.newConversation")}
                            </Link>

                            <button
                              onClick={(e) => requestDelete(e, sessionId)}
                              className={cn(
                                "hover:cursor-pointer absolute end-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                                isDark
                                  ? "hover:bg-[#2C2C2C] text-gray-400 hover:text-red-400"
                                  : "hover:bg-gray-200 text-gray-500 hover:text-red-500",
                              )}
                              title={t("nav.deleteChat")}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className={cn(
                      "text-[12px] text-[#71767B] ps-2 pe-2 py-1 hover:underline text-start block w-full hover:cursor-pointer mt-2",
                      isDark ? "hover:text-white" : "hover:text-black",
                    )}
                  >
                    {t("nav.seeAll")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              title={t("nav.history")}
              onClick={() => setIsExpanded(true)}
              className={cn(
                "w-9 h-9 mx-auto rounded-lg flex items-center justify-center transition-colors mt-2",
                isDark
                  ? "hover:bg-[#1A1A1A] text-gray-500"
                  : "hover:bg-gray-100",
              )}
            >
              <History size={20} />
            </button>
          )}
        </div>

        {/* --- 5. FOOTER (UserProfile) --- */}
        <div
          className={cn(
            "ps-4 pe-4 py-3 mt-auto relative z-50",
            isDark ? "border-t border-[#1F1F1F]" : "border-t border-gray-200",
          )}
        >
          <UserProfile
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
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
      "flex items-center gap-3 py-2 rounded-lg transition-all duration-150 group w-full text-start hover:cursor-pointer",
      isExpanded ? "ps-4 pe-4" : "justify-center ps-0 pe-0",
      isActive
        ? isDark
          ? "bg-[#1A1A1A] text-white"
          : "bg-gray-100 text-black"
        : isDark
          ? "text-[#999] hover:bg-[#111] hover:text-[#E7E9EA]"
          : "text-gray-600 hover:bg-gray-50",
    )}
  >
    <Icon size={18} strokeWidth={2} className="shrink-0 hover:cursor-pointer" />
    {isExpanded && (
      <span className="text-[13.5px] font-medium leading-none pt-0.5 ">
        {label}
      </span>
    )}
  </button>
);

export default Sidebar;
