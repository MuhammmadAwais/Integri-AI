import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronLeft,
  LogIn,
  LogOut,
  User as UserIcon,
  Mail,
  Info,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { logoutUser } from "../../auth/thunks/authThunk";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import Portal from "../../../Components/ui/Portal";
import DownloadSettings from "../../settings/components/DownloadSettings";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";

interface UserProfileProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, onToggle }) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  // @ts-ignore
  const { user, isGuest } = useAppSelector(
    (state: any) => state.auth || { user: null, isGuest: true },
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isPremium, isPro } = useSubscription();
  const [showMenu, setShowMenu] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  // Profile states
  // We use a timeout to bridge the gap between button and portal
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [popoverCoords, setPopoverCoords] = useState<React.CSSProperties>({});

  // Mock Data
  const initials = user?.name ? user.name.substring(0, 1).toUpperCase() : "G";
  const { t } = useTranslation();
  const fullName = user?.name || t("common.guestUser");
  const username = user?.email || t("common.noAccountActive");

  // --- POPUP POSITIONING LOGIC ---
  const handleDownloadEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (downloadButtonRef.current) {
      const rect = downloadButtonRef.current.getBoundingClientRect();

      // Calculate position
      // If expanded: Position floating slightly above/right or just right
      // Sidebar implies fixed left, so we pop to the right.
      setPopoverCoords({
        left: rect.right - 98, // 12px gap to the right
        bottom: window.innerHeight - rect.bottom, // Align bottoms
        // Alternatively, to center vertically relative to button:
        // top: rect.top + (rect.height / 2) - (POPOVER_HEIGHT / 2)
        // But bottom alignment is safer for footer menus
      });
    }
    setIsDownloadHovered(true);
  };

  const handleDownloadLeave = () => {
    // Delay closing to allow mouse to enter the portal
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDownloadHovered(false);
    }, 200);
  };

  const handleDivClick = (e: React.MouseEvent) => {
    handleToggleMenu(e);
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showMenu) {
      setShowMenu(false);
      return;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const menuWidth = 240;
      const offsetLeft = 16; // Shift menu left for spacing from edge (helps RTL and LTR)
      const left = (isExpanded ? rect.left : rect.left + 70) - offsetLeft;

      setMenuStyle({
        position: "absolute",
        left,
        bottom: window.innerHeight - rect.top + 10,
        width: `${menuWidth}px`,
      });

      setShowMenu(true);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileImage(user.profile || null);
    }
  }, [user]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
    setShowMenu(false);
  };

  return (
    <>
      {/* PORTAL FOR DOWNLOAD APP POPOVER */}
      {isDownloadHovered && (
        <Portal>
          <DownloadSettings
            isSidebar={true}
            style={popoverCoords}
            onMouseEnter={handleDownloadEnter} // Keep open if hovering portal
            onMouseLeave={handleDownloadLeave} // Close if leaving portal
          />
        </Portal>
      )}

      <div
        onClick={handleDivClick}
        ref={containerRef}
        className={cn(
          "flex items-center rounded-xl transition-colors cursor-pointer relative group select-none",
          isExpanded
            ? isDark
              ? "p-2 hover:bg-[#181818] "
              : " p-2 hover:bg-transparent"
            : "justify-center p-0 mt-2 w-full aspect-square hover:bg-transparent",
        )}
      >
        {/* 1. Avatar */}
        {profileImage ? (
          <div
            className={cn(
              "rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-3 ring-transparent  transition-all shadow-sm",
              isExpanded ? "w-9 h-9" : "w-8 h-8",
              isPremium
                ? isDark
                  ? "ring-yellow-400 group-hover:ring-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                  : "ring-yellow-500 group-hover:ring-yellow-600"
                : isPro
                  ? isDark
                    ? "ring-purple-500 group-hover:ring-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "ring-purple-600 group-hover:ring-purple-700"
                  : "group-hover:ring-indigo-500",
            )}
          >
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-3 ring-transparent transition-all shadow-sm",
              isExpanded ? "w-9 h-9" : "w-8 h-8",
              isPremium
                ? isDark
                  ? "ring-yellow-400 group-hover:ring-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                  : "ring-yellow-500 group-hover:ring-yellow-600"
                : isPro
                  ? isDark
                    ? "ring-purple-500 group-hover:ring-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "ring-purple-600 group-hover:ring-purple-700"
                  : "group-hover:ring-indigo-500",
            )}
          >
            {initials}
          </div>
        )}

        {/* 2. Text Info (Visible only when Expanded) */}
        <div
          className={cn(
            "flex-1 ml-3 overflow-hidden transition-all duration-200",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden",
          )}
        >
          <p
            className={cn(
              "font-bold text-sm truncate",
              isDark ? "text-[#E7E9EA]" : "text-black",
            )}
          >
            {fullName}
          </p>
          <p className="text-[#71767B] text-xs truncate">
            {username.split("@")[0]}
          </p>
        </div>

        {/* 4. THE TOGGLE ARROW */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          title={
            isExpanded ? t("common.collapseSidebar") : t("common.expandSidebar")
          }
          className={cn(
            "absolute flex items-center justify-center rounded-full shadow-md border transition-all duration-200 z-50 mb-4",
            isDark
              ? "bg-[#1E1E1E] border-[#333] text-gray-400 hover:text-white hover:bg-[#333]"
              : "bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50",
            // Position Logic
            isExpanded
              ? "w-6 h-6 right-2 top-1/2 -translate-y-1/2 opacity-75 group-hover:opacity-100 hover:cursor-pointer" // Inside right, visible on hover
              : "w-5 h-5 -right-1 -top-3 opacity-75 md:opacity-0 group-hover:opacity-100 hover:cursor-pointer", // Top-right corner of avatar when collapsed
          )}
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* PORTAL FOR THE MENU */}
      {showMenu && (
        <Portal>
          <div
            ref={menuRef}
            style={menuStyle}
            className={cn(
              "z-9990 rounded-xl shadow-2xl border overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100",
              isDark
                ? "bg-[#1E1E1E] border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div className="px-4 py-3 border-b border-gray-700/50">
              <p
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {fullName}
              </p>
              <p
                className={cn(
                  "text-xs truncate",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                {username}
              </p>
            </div>

            {isGuest || !user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setShowMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                    isDark
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <LogIn size={16} /> {t("auth.login")}
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setShowMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                    isDark
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <UserIcon size={16} /> {t("auth.signUp")}
                </button>
                <Link to="/contactUs">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    <Mail size={16} />
                    {t("userProfile.contactUs")}
                  </button>
                </Link>

                {/* About Us */}

                <a
                  href="https://enterprise.integri.app/"
                  target="_blank"
                  className={cn(
                    "w-full px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors ",
                    isDark
                      ? "hover:bg-white/5 text-white"
                      : "hover:bg-gray-200 text-black",
                  )}
                  rel="noopener noreferrer"
                >
                  <Info size={16} />
                  About Us
                </a>

                <Link to="/privacy-policy">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    <Info size={16} />
                    Privacy Policy
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <LogOut size={16} /> {t("auth.logout")}
                </button>

                {/* --- DOWNLOAD BUTTON TRIGGER --- */}
                <Link to="/settings">
                  <button
                    ref={downloadButtonRef}
                    onMouseEnter={handleDownloadEnter}
                    onMouseLeave={handleDownloadLeave}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    {t("userProfile.downloadTheApp")}
                  </button>
                </Link>
                <Link to="/contactUs">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    {t("userProfile.contactUs")}
                  </button>
                </Link>
                <a
                  href="https://enterprise.integri.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                    isDark
                      ? "hover:bg-white/5 text-white"
                      : "hover:bg-gray-200 text-black",
                  )}
                >
                  About Us
                </a>

                <Link to="/subscriptions">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    {t("userProfile.subscription")}
                  </button>
                </Link>

                <Link to="/settings">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    {t("userProfile.settings")}
                  </button>
                </Link>
                <Link to="/privacy-policy">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black",
                    )}
                  >
                    Privacy Policy
                  </button>
                </Link>
              </>
            )}
          </div>
        </Portal>
      )}
    </>
  );
};

export default UserProfile;
