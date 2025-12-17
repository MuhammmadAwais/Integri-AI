import React, { useLayoutEffect, useRef} from "react";
import { cn } from "../../lib/utils";
import gsap from "gsap";
import {Trash2} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import SkeletonLoader from "./SkeletonLoader";
import MessageAvatar from "./MessageAvatar";
import MessageMarkdown from "./MessageMarkdown";
import MessageActions from "./MessageActions";

// --- TYPES ---
interface MessageProps {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
}


// --- MAIN COMPONENT ---
const MessageBubble: React.FC<MessageProps> = ({
  id,
  role,
  content,
  isLoading,
  onDelete,
  onRegenerate,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const isUser = role === "user";

  // Entrance Animation
  useLayoutEffect(() => {
    if (bubbleRef.current && gsap) {
      gsap.fromTo(
        bubbleRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex w-full mb-8 relative group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[95%] md:max-w-[85%] gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* 1. Avatar */}
        <MessageAvatar isUser={isUser} isDark={isDark} />

        <div
          className={cn(
            "flex flex-col min-w-0 w-full",
            isUser ? "items-end" : "items-start"
          )}
        >
          {isLoading ? (
            <div className="space-y-3 w-full max-w-md mt-2 animate-pulse">
              <SkeletonLoader className="h-4 w-3/4 rounded-full bg-gray-300 dark:bg-gray-700" />
              <SkeletonLoader className="h-4 w-1/2 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          ) : (
            <>
              {/* 2. Content Bubble */}
              <div
                className={cn(
                  "text-[15px] leading-7 w-full overflow-hidden relative",
                  isUser
                    ? cn(
                        "px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm",
                        isDark
                          ? "bg-[#2F3336] text-[#E7E9EA]"
                          : "bg-[#F3F4F6] text-[#111827]"
                      )
                    : cn(
                        "px-1 py-0 bg-transparent",
                        isDark ? "text-[#E7E9EA]" : "text-[#0F1419]"
                      )
                )}
              >
                {/* User Delete Button (Absolute Position) */}
                {isUser && onDelete && id && (
                  <button
                    onClick={() => onDelete(id)}
                    className="absolute -left-8 top-1 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <MessageMarkdown
                  content={content}
                  isDark={isDark}
                  isUser={isUser}
                />
              </div>

              {/* 3. Bot Actions */}
              {!isUser && (
                <MessageActions
                  content={content}
                  isDark={isDark}
                  id={id}
                  onDelete={onDelete}
                  onRegenerate={onRegenerate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
