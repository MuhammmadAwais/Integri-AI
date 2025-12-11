import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../app/firebase";
import { type Message, type ChatSession } from "../services/chatService";

// Hook 1: Listen to the list of chats (For Sidebar)
export const useChatList = (userId: string | undefined) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setChats([]);
      return;
    }

    // Subscribe to the "chats" collection
    const q = query(
      collection(db, "users", userId, "chats"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatSession[];
      setChats(chatData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { chats, loading };
};

// Hook 2: Listen to specific messages (For Chat Interface)
export const useMessages = (
  userId: string | undefined,
  chatId: string | undefined
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !chatId) return;

    const q = query(
      collection(db, "users", userId, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, chatId]);

  return { messages, loading };
};
