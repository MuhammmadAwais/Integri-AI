import React, { useRef, useLayoutEffect } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ChatService } from "../features/chat/services/chatService";
import gsap from "gsap";
import ParticleBackground from "../Components/ui/ParticleBackground";
import SubscriptionOfferingCard from "../features/subscriptions/components/SubscriptionOfferingCard";
// Import the new component
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
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      ).fromTo(
        inputRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6 },
        "-=0.4"
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

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center h-dvh w-full relative overflow-hidden transition-colors duration-300 font-sans",
        isDark
          ? "bg-[#000000] selection:bg-gray-800 selection:text-white"
          : "bg-white selection:bg-blue-100 selection:text-black"
      )}
    >
      <ParticleBackground />

      <SubscriptionOfferingCard />

      {/* CONTENT */}
      <div className="w-full max-w-[720px] px-4 flex flex-col items-center -mt-16 z-10 relative">
        <div
          ref={logoRef}
          className="mb-18 flex items-center-safe justify-center "
        >
          <Link to="/">
            <h1
              className={cn(
                "text-5xl font-extrabold tracking-tight hover:cursor-pointer",
                isDark ? "text-white" : "text-black"
              )}
            >
              Integri
            </h1>
          </Link>
        </div>

        {/* REUSABLE INPUT COMPONENT */}
        {/* We pass the ref from WelcomePage to the component for GSAP animation */}
        <WelcomeChatInput
          ref={inputRef}
          user={user}
          isDark={isDark}
          onStartChat={handleStartChat}
        />

        <div className="mt-8 text-xs text-gray-500 opacity-60">
          All LLMs can make mistakes. Verify the information you receive.
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
