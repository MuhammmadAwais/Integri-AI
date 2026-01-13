import React, { useRef, useLayoutEffect } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ChatService } from "../features/chat/services/chatService";
import gsap from "gsap";
import ParticleBackground from "../Components/ui/ParticleBackground";
import SubscriptionOfferingCard from "../features/subscriptions/components/SubscriptionOfferingCard";
import WelcomeChatInput from "../features/chat/components/WelcomeChatInput";

const WelcomePage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme?.isDark);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);

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

  const handleStartChat = async (text: string, file: File | null) => {
    if ((!text.trim() && !file) || !accessToken) return;

    const currentModelId = newChatModel.id;

    // Check if we should route to PDF Chat
    if (file?.type === "application/pdf") {
      try {
        const newChatId = await ChatService.createChat(
          accessToken,
          currentModelId,
          selectedAgentId || undefined
        );
        navigate(`/chat/${newChatId}`, {
          state: {
            initialMessage: text || "Explain this",
            initialFile: file,
            file: file,
          },
        });
      } catch (error) {
        console.error(`Hey ${user?.name} Failed to start your chat:`, error);
      }
      return;
    }

    // Standard/Agent Chat Logic
    let content = text;
    if (file) content = `[File: ${file.name}] ${text}`;
    try {
      const newChatId = await ChatService.createChat(
        accessToken,
        currentModelId,
        selectedAgentId || undefined
      );
      navigate(`/chat/${newChatId}`, {
        state: {
          initialMessage: content,
          initialFile: file,
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

      {/* CONTENT */}
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
            {`Hey ${firstName}, how can I help you today?`}
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
          All LLMs can make mistakes. Verify the information you receive.
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
