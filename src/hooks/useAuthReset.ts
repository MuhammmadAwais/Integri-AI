import { useState, useCallback } from "react";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../app/firebase";
import {
  isBlacklistedDomain,
  logFirebaseAuthEvent,
} from "../utils/emailDomainValidator";

// ─────────────────────────────────────────────────────────────────────────────
// Status union (extended with "blacklisted" for domain pre-flight blocks)
// ─────────────────────────────────────────────────────────────────────────────
export type ResetStatus =
  | "idle"
  | "checking"     // domain check + fetchSignInMethodsForEmail in-flight
  | "success"      // reset email dispatched successfully
  | "google"       // account is a pure Google SSO — no password reset possible
  | "notfound"     // email not registered in Firebase
  | "blacklisted"  // domain is on the black-hole list, skip Firebase entirely
  | "error";       // network / unexpected Firebase error

export interface UseAuthResetReturn {
  status: ResetStatus;
  errorMessage: string | null;
  sendReset: (email: string) => Promise<void>;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Firebase error → user-friendly message
// ─────────────────────────────────────────────────────────────────────────────
const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/invalid-email":
    "That doesn't look like a valid email address. Please double-check.",
  "auth/too-many-requests":
    "Too many attempts — please wait a moment before trying again.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Password reset is not enabled for this project.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAuthReset(): UseAuthResetReturn {
  const [status, setStatus] = useState<ResetStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendReset = useCallback(async (email: string) => {
    setStatus("checking");
    setErrorMessage(null);

    // ── Pre-flight: domain blacklist check (no Firebase call) ───────────────
    if (isBlacklistedDomain(email)) {
      logFirebaseAuthEvent("DOMAIN_BLOCKED", { email, domain: email.split("@")[1] });
      setStatus("blacklisted");
      return;
    }

    try {
      // ── Step 1: discover which providers this email has registered ─────────
      const methods = await fetchSignInMethodsForEmail(auth, email);

      logFirebaseAuthEvent("PROVIDER_CHECK", {
        email,
        providers: methods.join(", ") || "none",
      });

      // ── Branch A: email not registered ─────────────────────────────────────
      if (methods.length === 0) {
        console.warn(
          `%c[SmartRecoveryGate] AUTH_EVENT — auth/user-not-found for "${email}"`,
          "color: #f97316; font-weight: bold;"
        );
        setStatus("notfound");
        return;
      }

      // ── Branch B: pure Google SSO (no password method available) ───────────
      if (methods.includes("google.com") && !methods.includes("password")) {
        console.log(
          `%c[SmartRecoveryGate] SOCIAL_IDENTITY — "${email}" is Google-only`,
          "color: #60a5fa; font-weight: bold;"
        );
        setStatus("google");
        return;
      }

      // ── Branch C: password provider → send reset email ─────────────────────
      await sendPasswordResetEmail(auth, email, {
        // The reset email's "Back to App" link will land on /login
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });

      logFirebaseAuthEvent("RESET_SENT", { email, redirectTo: `${window.location.origin}/login` });
      console.log(
        `%c✓ [SmartRecoveryGate] Password reset dispatched → ${email}`,
        "color: #10b981; font-weight: bold; font-size: 13px;"
      );
      setStatus("success");

    } catch (err: any) {
      const code: string = err?.code ?? "unknown";
      const friendly =
        FIREBASE_ERROR_MAP[code] ?? "Something went wrong. Please try again.";

      logFirebaseAuthEvent("AUTH_ERROR", { email, code, message: err?.message ?? "" });

      setErrorMessage(friendly);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, sendReset, reset };
}
