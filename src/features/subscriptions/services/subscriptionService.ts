// src/features/subscription/services/subscriptionService.ts
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../app/firebase";

export const SubscriptionService = {
  /**
   * Simulates a purchase and updates (or creates) the user's document in Firestore.
   */
  purchaseSubscription: async (
    userId: string,
    planId: string
  ): Promise<string> => {
    // 1. Simulate API/Payment Gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Upsert Firestore (Update if exists, Create if not)
    const userRef = doc(db, "users", userId);

    // Using setDoc with merge: true prevents "No document to update" errors
    await setDoc(
      userRef,
      {
        isPremium: true,
        planId: planId,
        subscriptionDate: serverTimestamp(),
        status: "active",
        updatedAt: serverTimestamp(), // Good for tracking
      },
      { merge: true }
    );

    return planId;
  },

  /**
   * Cancel subscription (Reverts to free tier)
   */
  cancelSubscription: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userRef = doc(db, "users", userId);

    // We use setDoc here too for safety, though updateDoc is usually fine for cancellations
    await setDoc(
      userRef,
      {
        isPremium: false,
        planId: "starter",
        status: "canceled",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};
