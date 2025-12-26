import React from "react";
import { HelpCircle, MessageSquare, Info, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

const HelpAndAbout: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const navigate = useNavigate();

  const LinkItem = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-colors group hover:cursor-pointer",
        isDark ? "hover:bg-[#222]" : "hover:bg-gray-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={cn(isDark ? "text-gray-400" : "text-gray-500")}
        />
        <span
          className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-200" : "text-gray-700"
          )}
        >
          {label}
        </span>
      </div>
      <ChevronRight
        size={16}
        className={cn(
          "opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
          isDark ? "text-gray-500" : "text-gray-400"
        )}
      />
    </button>
  );

  return (
    <div
      className={cn(
        "rounded-xl border divide-y",
        isDark
          ? "border-[#333] divide-[#333] bg-[#1a1a1a]"
          : "border-gray-200 divide-gray-100 bg-white"
      )}
    >
      <LinkItem
        icon={HelpCircle}
        label="Help Center & FAQs"
        onClick={() => navigate("/help")}
      />
      <LinkItem
        icon={MessageSquare}
        label="Send Feedback"
        onClick={() => navigate("/feedback")}
      />
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <Info
            size={18}
            className={cn(isDark ? "text-gray-400" : "text-gray-500")}
          />
          <span
            className={cn(
              "text-sm font-medium",
              isDark ? "text-gray-200" : "text-gray-700"
            )}
          >
            About Integri AI
          </span>
        </div>
        <p
          className={cn(
            "text-xs pl-8 leading-relaxed",
            isDark ? "text-gray-500" : "text-gray-500"
          )}
        >
          Version 1.0.0 (Beta)
          <br />
          © 2025 Integri AI. All rights reserved.
          <br />
        </p>
      </div>
    </div>
  );
};

export default HelpAndAbout;
