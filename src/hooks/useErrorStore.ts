import { useState } from "react";
import { db } from "./../app/firebase"; // Ensure this points to your firebase config
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore";

// Interface for the data you pass TO the hook
interface ErrorLogInput {
  errorDetails: string | Record<string, any> | Error;
  username: string;
  email: string;
  date?: Date; // Optional: If omitted, we use serverTimestamp()
}

// Interface for the data actually stored IN Firestore
interface FirestoreErrorSchema {
  errorDetails: string | Record<string, any>;
  username: string;
  email: string;
  timestamp: Date | FieldValue; // Can be a JS Date or Firebase ServerTimestamp
  userAgent: string; // Bonus: Helpful for debugging device-specific issues
}

export const useErrorStore = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [error, setInternalError] = useState<string | null>(null);

  const logError = async ({
    errorDetails,
    username,
    email,
    date,
  }: ErrorLogInput) => {
    setIsLogging(true);
    setInternalError(null);

    try {
      // 1. Sanitize the error object. Firestore cannot store raw Error objects or functions.
      let sanitizedError: string | Record<string, any>;

      if (errorDetails instanceof Error) {
        sanitizedError = {
          message: errorDetails.message,
          stack: errorDetails.stack,
          name: errorDetails.name,
        };
      } else if (typeof errorDetails === "object" && errorDetails !== null) {
        sanitizedError = errorDetails as Record<string, any>;
      } else {
        sanitizedError = String(errorDetails);
      }

      // 2. Prepare the payload
      const payload: FirestoreErrorSchema = {
        username,
        email,
        errorDetails: sanitizedError,
        // If a date is provided, use it. Otherwise, use serverTimestamp for consistency.

        timestamp: date ? date : serverTimestamp(),
        
        userAgent: navigator.userAgent,
      };

      // 3. Write to Firestore 'errors' collection
      // Firestore automatically creates the collection if it doesn't exist.
      const docRef = await addDoc(collection(db, "errors"), payload);

      console.log("Error logged to Firestore with ID:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Failed to log error to Firestore:", err);
      setInternalError(
        err instanceof Error ? err.message : "Unknown logging error",
      );
      throw err;
    } finally {
      setIsLogging(false);
    }
  };

  return { logError, isLogging, loggingError: error };
};
