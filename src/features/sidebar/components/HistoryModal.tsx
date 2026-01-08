import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Portal from "../../../Components/ui/Portal";
import DeleteModal from "../../../Components/ui/DeleteModal";

import { useChatList } from "../../chat/hooks/useChat";
import { useAppSelector } from "../../../hooks/useRedux";
import { SessionService } from "../../../api/backendApi";

import HistoryList from "./HistoryList";
import HistoryPreview from "./HistoryPreview";

/* ================= UTIL ================= */

export const getSessionId = (chat: any): string | null =>
  chat?.session_id ?? chat?.id ?? null;

/**
 * 🔥 FIX: Merge streamed message chunks into full messages
 */
const normalizeMessages = (rawMessages: any[]) => {
  const map = new Map<string, any>();

  for (const msg of rawMessages) {
    const key = msg.message_id || `${msg.role}-${msg.created_at}`;

    if (!map.has(key)) {
      map.set(key, { ...msg });
    } else {
      map.get(key).content += msg.content;
    }
  }

  return Array.from(map.values());
};

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  /* ================= REDUX ================= */
  const token = useAppSelector(
    (state: any) => state.auth.accessToken || state.auth.token
  );
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const { chats, handleDeleteChat } = useChatList();

  /* ================= RESET ================= */
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedChatId(null);
      setPreviewMessages([]);
      setMobileView("list");
    }
  }, [isOpen]);

  /* ================= FETCH PREVIEW (🔥 FIXED) ================= */
  useEffect(() => {
    const fetchPreview = async () => {
      if (!selectedChatId || !token) {
        setPreviewMessages([]);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const res = await SessionService.getSessionMessages(
          token,
          selectedChatId
        );

        const raw = Array.isArray(res)
          ? res
          : res?.messages || res?.items || [];

        // 🔥 MERGE STREAMED CHUNKS
        const merged = normalizeMessages(raw);

        console.log("🧩 MERGED HISTORY:", merged);
        setPreviewMessages(merged);
      } catch (err) {
        console.error("Failed to load preview", err);
        setPreviewMessages([]);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [selectedChatId, token]);

  /* ================= HANDLERS ================= */
  const handleChatClick = (id: string) => {
    setSelectedChatId(id);
    setMobileView("detail");
  };

  const handleOpenChat = (id: string) => {
    onClose();
    navigate(`/chat/${id}`);
  };

  const confirmDelete = async () => {
    if (!chatToDelete || !handleDeleteChat) return;

    await handleDeleteChat(chatToDelete);
    setSelectedChatId(null);
    setPreviewMessages([]);
    setMobileView("list");
    setChatToDelete(null);
    setIsDeleteModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDark={isDark}
      />

      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className={`relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-6xl md:rounded-2xl overflow-hidden flex border ${
            isDark
              ? "bg-[#101010] border-[#2A2B32] text-white"
              : "bg-white border-gray-200 text-black"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <HistoryList
            chats={chats}
            search={search}
            setSearch={setSearch}
            selectedChatId={selectedChatId}
            onSelect={handleChatClick}
            isDark={isDark}
            mobileView={mobileView}
            onClose={onClose}
          />

          <HistoryPreview
            chats={chats}
            selectedChatId={selectedChatId}
            messages={previewMessages}
            loading={isPreviewLoading}
            isDark={isDark}
            mobileView={mobileView}
            onBack={() => {
              setSelectedChatId(null);
              setMobileView("list");
            }}
            onDelete={(id) => {
              setChatToDelete(id);
              setIsDeleteModalOpen(true);
            }}
            onOpenChat={handleOpenChat}
            onClose={onClose}
          />
        </div>
      </div>
    </Portal>
  );
};

export default HistoryModal;
