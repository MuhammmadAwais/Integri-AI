import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { logoutUser } from "../../auth/thunks/authThunk";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import Portal from "../../../Components/ui/Portal";

interface UserProfileProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, onToggle }) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  // @ts-ignore
  const { user, isGuest } = useAppSelector(
    (state: any) => state.auth || { user: null, isGuest: true }
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mock Data
  const initials = user?.name ? user.name.substring(0, 1).toUpperCase() : "G";
  const fullName = user?.name || "Guest User";
  const username = user?.email || "No account active";

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showMenu) {
      setShowMenu(false);
      return;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // Calculate position: Open UPWARDS from the footer
      setMenuStyle({
        position: "absolute",
        left: isExpanded ? rect.left : rect.left + 70, // If collapsed, push to right
        bottom: window.innerHeight - rect.top + 10, // Anchor to bottom of viewport relative to element top
        width: "240px",
      });

      setShowMenu(true);
    }
  };

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
      <div
        ref={containerRef}
        onClick={handleToggleMenu}
        className={cn(
          "flex items-center rounded-xl transition-colors cursor-pointer relative group select-none",
          isExpanded
            ? isDark
              ? "p-2 hover:bg-[#181818] "
              : " p-2 hover:bg-transparent"
            : "justify-center p-0 mt-2 w-full aspect-square hover:bg-transparent"
        )}
      >
        {/* 1. Avatar */}
        <div
          className={cn(
            "rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all shadow-sm",
            isExpanded ? "w-9 h-9" : "w-8 h-8"
          )}
        >
          {initials}
        </div>

        {/* 2. Text Info (Visible only when Expanded) */}
        <div
          className={cn(
            "flex-1 ml-3 overflow-hidden transition-all duration-200",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
          )}
        >
          <p
            className={cn(
              "font-bold text-sm truncate",
              isDark ? "text-[#E7E9EA]" : "text-black"
            )}
          >
            {fullName}
          </p>
          <p className="text-[#71767B] text-xs truncate">{username.split("@")[0]}</p>
        </div>

        {/* 4. THE TOGGLE ARROW */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          className={cn(
            "absolute flex items-center justify-center rounded-full shadow-md border transition-all duration-200 z-50 mb-4",
            isDark
              ? "bg-[#1E1E1E] border-[#333] text-gray-400 hover:text-white hover:bg-[#333]"
              : "bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50",
            // Position Logic
            isExpanded
              ? "w-6 h-6 right-2 top-1/2 -translate-y-1/2 opacity-75 group-hover:opacity-100 hover:cursor-pointer" // Inside right, visible on hover
              : "w-5 h-5 -right-1 -top-3 opacity-75 md:opacity-0 group-hover:opacity-100 hover:cursor-pointer" // Top-right corner of avatar when collapsed
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
              "z-9999 rounded-xl shadow-2xl border overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100",
              isDark
                ? "bg-[#1E1E1E] border-gray-700"
                : "bg-white border-gray-200"
            )}
          >
            <div className="px-4 py-3 border-b border-gray-700/50">
              <p
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {fullName}
              </p>
              <p
                className={cn(
                  "text-xs truncate",
                  isDark ? "text-gray-400" : "text-gray-500"
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
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <LogIn size={16} /> Login
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
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <UserIcon size={16} /> Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
                <Link to="/settings">
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
                      isDark
                        ? "hover:bg-white/5 text-white"
                        : "hover:bg-gray-200 text-black"
                    )}
                  >
                    Settings
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
