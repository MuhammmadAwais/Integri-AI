import React, { useState } from "react";
import {
  Moon,
  Sun,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleTheme } from "../theme/themeSlice";
import { logout } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const NavActionBtn = ({ icon: Icon, onClick, label, active = false }: any) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer",
        isDark
          ? "text-gray-400 hover:text-white hover:bg-white/10"
          : "text-gray-600 hover:text-gray-900 hover:bg-black/5",
        active && (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

const NavbarRight: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  // @ts-ignore - Assuming store update
  const { user, isGuest } = useAppSelector(
    (state:any ) => state.auth || { user: null, isGuest: true }
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 relative">
      <NavActionBtn
        icon={isDark ? Sun : Moon}
        label="Toggle Theme"
        onClick={() => dispatch(toggleTheme())}
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Profile Section */}
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ml-1 border cursor-pointer",
          isDark
            ? "hover:bg-white/10 border-transparent hover:border-gray-700"
            : "hover:bg-black/5 border-transparent hover:border-gray-200"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold ring-2 ring-transparent group-hover:ring-indigo-500">
          {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
        </div>
      </button>

      {/* Profile Dropdown */}
      {showProfileMenu && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg border overflow-hidden py-1 z[100",
            isDark ? "bg-[#1E1E1E] border-gray-700" : "bg-white border-gray-200"
          )}
        >
          <div className="px-4 py-3 border-b border-gray-700/50">
            <p
              className={cn(
                "text-sm font-medium",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {user?.name || "Guest User"}
            </p>
            <p
              className={cn(
                "text-xs truncate",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              {user?.email || "No account active"}
            </p>
          </div>

          {isGuest || !user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer",
                  isDark
                    ? "text-gray-300 hover:bg-white/5"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <LogIn size={16} /> Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer",
                  isDark
                    ? "text-gray-300 hover:bg-white/5"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <UserIcon size={16} /> Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarRight;
