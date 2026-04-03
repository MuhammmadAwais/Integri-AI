import React, { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import gsap from "gsap";
import { Trash2, Sparkles } from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import SkeletonLoader from "./SkeletonLoader";
import MessageAvatar from "./MessageAvatar";
import MessageMarkdown from "./MessageMarkdown";
import MessageActions from "./MessageActions";
import { AttachmentStatusList } from "./AttachmentManager";
import { FileGallery } from "./FileGallery";

// --- TYPES ---
interface MessageProps {
  id?: string;
  role: "user" | "assistant";
  content: string;
  // Added attachment prop
  attachment?: {
    name: string;
    type: "image" | "file";
    url: string;
  };
  attachments?: {
    name: string;
    type: "image" | "file";
    url: string;
  }[];
  file_ids?: string[];
  isLoading?: boolean;
  isGeneratingImage?: boolean; // New prop for image generation skeleton
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
  provider: string;
  is_custom_gpt: boolean;
  modelId?: string;
}

// --- MAIN COMPONENT ---
const MessageBubble: React.FC<MessageProps> = ({
  id,
  role,
  content,
  attachment,
  attachments,
  file_ids,
  isLoading,
  isGeneratingImage,
  onDelete,
  onRegenerate,
  provider,
  is_custom_gpt,
  modelId,
}) => {
  const { t } = useTranslation();
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
          "flex max-w-[95%] md:max-w-[85%] gap-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* 1. Avatar */}
        <MessageAvatar
          is_custom_gpt={is_custom_gpt}
          provider={provider}
          modelId={modelId}
          isUser={isUser}
          isDark={isDark}
        />

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
              {/* --- 2. MESSAGE CONTAINER (FLEX COL) --- */}
              <div
                className={cn(
                  "flex flex-col gap-1 max-w-full",
                  isUser ? "items-end" : "items-start"
                )}
              >
                {/* User Delete Button (Absolute Position near top of container) */}
                {isUser && onDelete && id && (
                  <button
                    onClick={() => onDelete(id)}
                    className="absolute -left-8 top-1 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                    title={t("common.deleteMessage")}
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* --- IMAGE GENERATION SKELETON START --- */}
                {isGeneratingImage && (
                  <div className="mb-3 animate-pulse">
                    <div
                      className={cn(
                        "relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-[280px] h-[280px] flex items-center justify-center",
                        isDark ? "bg-white/5" : "bg-black/5"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <Sparkles size={24} className="animate-spin-slow" />
                        <span className="text-xs font-medium">
                          Generating Image...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* --- IMAGE GENERATION SKELETON END --- */}

                {/* --- FILE GALLERY (PERSISTENT & DECOUPLED) --- */}
                {((attachments && attachments.length > 0) || attachment || (file_ids && file_ids.length > 0)) && (
                  <FileGallery 
                    file_ids={file_ids}
                    attachments={attachments || (attachment ? [attachment] : []) as any}
                  />
                )}

                {/* --- TEXT BUBBLE --- */}
                {(() => {
                  const displayContent = content
                    ? content
                        .replace(/\[File:\s*[^\]]+\]/g, "")
                        .replace(/SYSTEM: The repository source code is attached as a PDF\. Use the XML tags for navigation\.\s*/gi, "")
                        .trim()
                    : "";

                  if (!displayContent || isGeneratingImage) return null;

                  return (
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
                      <MessageMarkdown
                        content={displayContent}
                        isDark={isDark}
                        isUser={isUser}
                      />
                    </div>
                  );
                })()}
              </div>

              {((attachments && attachments.length > 0) || attachment) && !isGeneratingImage && isUser && (
                <AttachmentStatusList attachments={attachments || (attachment ? [attachment] : []) as any} isDark={isDark} />
              )}

              {/* 3. Bot Actions */}
              {!isUser && !isGeneratingImage && (
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
