import React from "react";
import { Crown } from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";

const UserProfile: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div
      className={cn(
        "mt-auto p-4 border-t",
        isDark ? "border-gray-800" : "border-gray-100"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer",
          isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100"
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
          DU
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isDark ? "text-gray-200" : "text-gray-900"
            )}
          >
            Danish Usman
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs truncate",
                isDark ? "text-gray-500" : "text-gray-500"
              )}
            >
              Free
            </span>
            <Crown className="w-3 h-3 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
