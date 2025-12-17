import React, { useState } from "react";
import { cn } from "../../lib/utils";
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  Trash2,
} from "lucide-react";


const MessageActions: React.FC<{
  content: string;
  isDark: boolean;
  id?: string;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
}> = ({ content, isDark, id, onDelete, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    // GSAP animation for the copy icon could go here if managed globally or via ref
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-3 ml-1">
      <ActionButton
        icon={copied ? Check : Copy}
        onClick={handleCopy}
        title="Copy"
        isDark={isDark}
        active={copied}
        iconClass={copied ? "copy-btn-icon" : ""}
      />

      {onRegenerate && (
        <ActionButton
          icon={RotateCcw}
          onClick={onRegenerate}
          title="Regenerate"
          isDark={isDark}
        />
      )}

      <div
        className={cn("w-px h-3 mx-1", isDark ? "bg-gray-800" : "bg-gray-300")}
      />

      <ActionButton icon={ThumbsUp} title="Good" isDark={isDark} />
      <ActionButton icon={ThumbsDown} title="Bad" isDark={isDark} />

      {/* Bot Delete Button */}
      {onDelete && id && (
        <ActionButton
          icon={Trash2}
          onClick={() => onDelete(id)}
          title="Delete"
          isDark={isDark}
          className="hover:text-red-500 hover:bg-red-500/10"
        />
      )}
    </div>
  );
};

//HELPER COMPONENT

const ActionButton = ({
  icon: Icon,
  onClick,
  title,
  active,
  isDark,
  className,
  iconClass,
}: any) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:cursor-pointer active:scale-95",
      active
        ? "text-green-500 bg-green-500/10"
        : isDark
        ? "text-[#71767B] hover:text-[#1D9BF0] hover:bg-[#1D9BF0]/10"
        : "text-gray-400 hover:text-[#1D9BF0] hover:bg-blue-50",
      className
    )}
  >
    <Icon size={16} strokeWidth={2} className={iconClass} />
  </button>
);

export default MessageActions;