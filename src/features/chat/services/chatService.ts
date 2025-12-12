import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../app/firebase";
import { generateAIResponse } from "../../../lib/openai";

// Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  updatedAt: any;
}

export const ChatService = {
  // 1. Create a New Chat
  createChat: async (userId: string, model: string, firstMessage: string) => {
    const newChatRef = doc(collection(db, "users", userId, "chats"));
    await setDoc(newChatRef, {
      title: firstMessage.slice(0, 30) + "...",
      model: model,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newChatRef.id;
  },

  // 2. Send Message & Get AI Response
  sendMessage: async (
    userId: string,
    chatId: string,
    content: string,
    model: string
  ) => {
    // A. Save User Message to DB
    const messagesRef = collection(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "messages"
    );
    await addDoc(messagesRef, {
      role: "user",
      content,
      createdAt: serverTimestamp(),
    });

    // B. Update Chat Timestamp (so it moves to top of sidebar)
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await updateDoc(chatRef, { updatedAt: serverTimestamp() });

    // C. Call AI (Frontend Logic)
    // Note: In a production app, you'd move this part to a Cloud Function
    try {
      // Fetch previous messages for context (optional optimization)
      const aiResponse = await generateAIResponse(
        [{ role: "user", content }],
        model
      );

      // D. Save AI Response to DB
      await addDoc(messagesRef, {
        role: "assistant",
        content: aiResponse,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("AI Generation Failed:", error);
      await addDoc(messagesRef, {
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the AI.",
        createdAt: serverTimestamp(),
      });
    }
  },

  // 3. Delete Chat
  deleteChat: async (userId: string, chatId: string) => {
    await deleteDoc(doc(db, "users", userId, "chats", chatId));
  },
};
