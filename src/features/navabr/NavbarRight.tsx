import React from "react";
import { MessageSquarePlus } from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 sm:gap-2 relative">
      {/* New chat is the only top-bar action; theme and language moved to
          the profile menu (ProfilePreferences). Hidden on the welcome screen,
          where it would do nothing. */}
      {pathname !== "/" && (
        <NavActionBtn
          icon={MessageSquarePlus}
          label={t("nav.newChat")}
          onClick={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default NavbarRight;
