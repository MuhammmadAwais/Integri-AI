import React, { useState, useLayoutEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import ChatInput from "../features/chat/components/ChatInput";
import PlaygroundLane from "../features/playground/components/PlaygroundLane";
import { removePlaygroundModel } from "../features/chat/chatSlice";
import gsap from "gsap";

const Playground: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const { playgroundModels } = useAppSelector((state: any) => state.chat);
  const dispatch = useAppDispatch();

  const [globalPrompt, setGlobalPrompt] = useState("");
  const [globalFile, setGlobalFile] = useState<File | null>(null);
  const [triggerId, setTriggerId] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".playground-lane",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [playgroundModels.length]); // Re-run animation when models change

  const handleSendMessage = (text: string, file: File | null | undefined) => {
    setGlobalPrompt(text);
    setGlobalFile(file || null);
    setTriggerId((prev) => prev + 1);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100dvh-64px)] w-full overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#09090b]" : "bg-white"
      )}
    >

      <div
        ref={containerRef}
        className={cn(
          "flex-1 flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden p-4 gap-2 snap-x scroll-smooth items-stretch",
          isDark ? "scrollbar-track-[#09090b]" : "scrollbar-track-white"
        )}
      >
        {playgroundModels.map((model:any, idx:any) => (
          <div
            key={`${model.id}-${idx}`}
            className="playground-lane flex-1 min-w-[320px] max-w-full h-full snap-center shrink-0 transition-all duration-300 ease-in-out"
          >
            <PlaygroundLane
              model={model}
              onRemove={() => dispatch(removePlaygroundModel(idx))}
              isDark={isDark}
              globalPrompt={globalPrompt}
              globalFile={globalFile}
              triggerId={triggerId}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t z-20 shrink-0",
          isDark ? "border-zinc-800 bg-[#09090b]" : "border-zinc-200 bg-white"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            placeholder={"Send a global prompt to all models... " }
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};

export default Playground;
