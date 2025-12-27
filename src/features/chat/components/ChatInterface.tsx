import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { useAppSelector } from "../../../hooks/useRedux";
import { useChat } from "../hooks/useChat";
import { cn } from "../../../lib/utils";
import { ChatService } from "../services/chatService"; // Import ChatService
import { SessionService } from "../../../api/backendApi";

interface ChatInterfaceProps {
  features?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ features = true }) => {
  const { id } = useParams(); // id is undefined for new chats
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const newChatModel = useAppSelector((state: any) => state.chat.newChatModel);
  const selectedAgentId = useAppSelector(
    (state: any) => state.chat.selectedAgentId
  );

  // Local thinking state for the transition period (creating session)
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
  } = useChat(id);

  const hasInitialized = useRef(false);

  // 1. Handle Welcome Page Transition & Auto-Send
  useEffect(() => {
    if (id && location.state?.initialMessage && !hasInitialized.current) {
      hasInitialized.current = true;
      const { initialMessage, initialFile } = location.state;

      // Optimistically show and send
      sendMessage(initialMessage, initialFile);

      // Clear state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state, sendMessage]);

  // 2. SCROLL LOGIC
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && !isStreaming) {
      scrollToBottom();
    }
  }, [messages.length, isStreaming]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 3. MAIN SEND HANDLER
  const handleSend = async (text: string, file?: File | null) => {
    if (!text.trim() && !file) return;

    // CASE A: Existing Session -> Just send
    if (id) {
      sendMessage(text, file);
      setTimeout(scrollToBottom, 100);
      return;
    }

    // CASE B: New Chat -> Create Session FIRST, then Redirect
    if (!token) return;

    try {
      setIsCreatingSession(true);

      // Create Session via API
      // If selectedAgentId is set, it creates an Agent session
      const newSessionId = await ChatService.createChat(
        token,
        newChatModel.id,
        selectedAgentId || undefined // Pass agent ID if present
      );

      // Update Title (Optional optimization: do this in background)
      const cleanText = text.trim();
      const title = cleanText
        ? cleanText.substring(0, 30)
        : file
        ? "Attachment"
        : "New Chat";

      // Fire and forget title update
      SessionService.updateSession(token, newSessionId, title);

      // Redirect to the new session, passing the message to be sent there
      navigate(`/chat/${newSessionId}`, {
        state: {
          initialMessage: text,
          initialFile: file,
        },
      });
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsCreatingSession(false);
      // Optional: Add toast error here
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              role={msg.role}
              content={msg.content}
              attachment={msg.attachment}
              onDelete={msg.id ? () => deleteMessage(msg.id!) : undefined}
            />
          ))}

          {/* Loading Indicators */}
          {(isThinking || isLoading || isCreatingSession) && (
            <div className="flex justify-start">
              <SkeletonLoader />
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div
        className={cn(
          "flex-none w-full z-20 px-4 py-4",
          isDark ? "bg-background" : "bg-white"
        )}
      >
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput
            features={features}
            disabled={isThinking || isStreaming || isCreatingSession}
            onSend={handleSend}
          />
          {features && (
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-500">
                AI can make mistakes. Check important info.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
