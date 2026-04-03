import React, { useRef, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ChatService } from "../features/chat/services/chatService";
import gsap from "gsap";
import ParticleBackground from "../Components/ui/ParticleBackground";
import SubscriptionOfferingCard from "../features/subscriptions/components/SubscriptionOfferingCard";
import WelcomeChatInput from "../features/chat/components/WelcomeChatInput";
import AdUnit from "../Components/ads/AdUnit";
import { AD_SLOTS } from "../config/ads";
import { useSubscription } from "../features/subscriptions/hooks/useSubscription";
import TrustpilotToast from "../Components/ui/TrustpilotToast";

const WelcomePage: React.FC = () => {
  const { t } = useTranslation();
  const isDark = useAppSelector((state: any) => state.theme?.isDark);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);
  const { isFree } = useSubscription();
  // Model and Agent state from Redux
  const { newChatModel, selectedAgentId } = useAppSelector(
    (state: any) => state.chat
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- ANIMATION LOGIC ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        logoRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 }
      ).fromTo(
        inputRef.current,
        { scale: 0.98, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleStartChat = async (text: string, files?: File[], searchMode?: "search" | "deep-search" | null) => {
    if ((!text.trim() && (!files || files.length === 0)) || !accessToken) return;

    // Override model if search mode is active
    let currentModelId = newChatModel.id;
    if (searchMode === "search") {
      currentModelId = "gpt-4o-mini-search-preview";
    } else if (searchMode === "deep-search") {
      currentModelId = "gpt-4o-mini-deep-research";
    }

    const firstFile = files && files.length > 0 ? files[0] : null;

    // Check if we should route to PDF Chat
    if (firstFile?.type === "application/pdf") {
      try {
        const newChatId = await ChatService.createChat(
          accessToken,
          currentModelId,
          selectedAgentId || undefined
        );
        navigate(`/chat/${newChatId}`, {
          state: {
            initialMessage: text || t("chat.explainThis"),
            initialFile: firstFile,
            file: firstFile,
          },
        });
      } catch (error) {
        console.error(`Hey ${user?.name} Failed to start your chat:`, error);
      }
      return;
    }

    // Standard/Agent Chat Logic
    let content = text;
    if (firstFile) content = `[File: ${files?.map(f => f.name).join(', ')}] ${text}`;
    try {
      const newChatId = await ChatService.createChat(
        accessToken,
        currentModelId,
        selectedAgentId || undefined
      );
      navigate(`/chat/${newChatId}`, {
        state: {
          initialMessage: content,
          initialFiles: files,
          model: currentModelId,
        },
      });
    } catch (error) {
      console.error(`Hey ${user?.name} Failed to start your chat:`, error);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Friend";

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center h-dvh w-full relative overflow-hidden transition-colors duration-300 font-sans",
        isDark
          ? "bg-[#000000] selection:bg-zinc-800 selection:text-white"
          : "bg-white selection:bg-blue-100 selection:text-blue-900"
      )}
    >
      <ParticleBackground />

     {user && ( <SubscriptionOfferingCard />)}

      {/* LEFT SKYSCRAPER AD — fixed to left margin, freemium only */}
      {/* temporarily disabled */}
      {false && isFree && (
        <div className="hidden lg:block fixed left-[256px] top-1/2 -translate-y-1/2 w-[160px] xl:w-[200px] max-h-[350px] mb-8 z-[5]">
          <AdUnit
            slot={AD_SLOTS.WELCOME_LEFT_SKYSCRAPER}
            format="vertical"
            responsive
            isDark={isDark}
            testId="ad-welcome-left"
          />
        </div>
      )}

      {/* CENTER CONTENT - Original centered layout preserved */}
      <div className="w-full max-w-[720px] px-6 flex flex-col items-center -mt-12 z-10 relative">
        <div
          ref={logoRef}
          className="mb-10 flex flex-col items-center justify-center text-center gap-4"
        >
          <Link to="/">
            <h1
              className={cn(
                "text-6xl sm:text-7xl font-bold tracking-tighter hover:cursor-pointer transition-opacity hover:opacity-90",
                isDark ? "text-white" : "text-black"
              )}
            >
              Integri
            </h1>
          </Link>
          <h2
            className={cn(
              "text-lg sm:text-xl font-semibold tracking-widest mt-2",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}
          >
{t("welcome.greeting", { name: firstName })}
          </h2>
        </div>

        {/* REUSABLE INPUT COMPONENT */}
        <WelcomeChatInput
          ref={inputRef}
          user={user}
          isDark={isDark}
          onStartChat={handleStartChat}
        />

        <div className="mt-6 text-xs font-medium text-zinc-400/60 dark:text-zinc-600/60 select-none">
          {t("chat.llmDisclaimer")}
        </div>
      </div>

      {/* RIGHT SKYSCRAPER AD — fixed to right margin, freemium only */}
      {/* temporarily disabled */}
      {false && isFree && (
        <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 w-[160px] xl:w-[200px] max-h-[350px] mb-8 z-[5]">
          <AdUnit
            slot={AD_SLOTS.WELCOME_RIGHT_SKYSCRAPER}
            format="vertical"
            responsive
            isDark={isDark}
            testId="ad-welcome-right"
          />
        </div>
      )}
      
      <TrustpilotToast />
    </div>
  );
};

export default WelcomePage;
