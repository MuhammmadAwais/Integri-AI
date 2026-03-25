import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { X, AlertTriangle, Chrome, ShieldAlert, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../thunks/authThunk";
import { useAppDispatch } from "../../../hooks/useRedux";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type ModalVariant = "notfound" | "google" | "blacklisted";

interface ForgotPasswordModalProps {
  variant: ModalVariant;
  email: string;
  onClose: () => void;
}

// accent color per variant
const ACCENT: Record<ModalVariant, { border: string; glow: string }> = {
  notfound:   { border: "rgba(239,68,68,0.2)",   glow: "rgba(239,68,68,0.06)"   },
  google:     { border: "rgba(96,165,250,0.2)",   glow: "rgba(96,165,250,0.06)"  },
  blacklisted:{ border: "rgba(251,146,60,0.2)",   glow: "rgba(251,146,60,0.06)"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components – modal body content per variant
// ─────────────────────────────────────────────────────────────────────────────

const NotFoundBody: React.FC<{ email: string }> = ({ email }) => (
  <div className="space-y-4">
    <p className="text-gray-400 text-sm leading-relaxed">
      No account exists for{" "}
      <span className="font-semibold text-white">{email}</span>. Registration
      for Integri is exclusive to the{" "}
      <span className="font-semibold text-white">Integri AI Mobile App</span>.
    </p>

    {/* Mobile-first message */}
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl text-xs text-gray-500 leading-relaxed"
      style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)" }}
    >
      <Smartphone size={15} className="text-gray-600 shrink-0 mt-0.5" />
      <span>
        If you registered via the mobile app and lost access, open the{" "}
        <strong className="text-gray-300">Integri AI App</strong> → Settings →
        Update Email to restore account access.
      </span>
    </div>

    <p className="text-gray-600 text-xs">
      Still stuck?{" "}
      <a
        href="https://enterprise.integri.app/contactUs"
        className="text-red-400 hover:text-red-300 underline transition-colors"
      >
        Contact support
      </a>
      .
    </p>
  </div>
);

const BlacklistedBody: React.FC<{ email: string }> = ({ email }) => (
  <div className="space-y-4">
    <p className="text-gray-400 text-sm leading-relaxed">
      The domain{" "}
      <span className="font-mono text-orange-400 text-xs px-1.5 py-0.5 rounded bg-orange-500/10">
        @{email.split("@")[1] ?? "unknown"}
      </span>{" "}
      is a temporary or test address. Integri requires a real email to send a
      secure reset link.
    </p>

    {/* Mobile-first recovery message */}
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl text-xs text-gray-500 leading-relaxed"
      style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)" }}
    >
      <Smartphone size={15} className="text-gray-600 shrink-0 mt-0.5" />
      <span>
        If you signed up with a disposable address, open the{" "}
        <strong className="text-gray-300">Integri AI App</strong> → Settings →
        Update Email and switch to a permanent address before resetting your
        password here.
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Google variant — inline sign-in button (not just a link)
// ─────────────────────────────────────────────────────────────────────────────
const GoogleBody: React.FC<{ email: string; onClose: () => void }> = ({
  email,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const btnRef   = useRef<HTMLButtonElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = async () => {
    onClose();
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate("/");
    }
  };

  const onEnter = () => {
    gsap.to(btnRef.current, { scale: 1.025, duration: 0.2, ease: "power2.out" });
    gsap.fromTo(
      shineRef.current,
      { x: "-115%", opacity: 0.6 },
      { x: "115%", opacity: 0, duration: 0.45, ease: "power1.inOut" }
    );
  };
  const onLeave = () =>
    gsap.to(btnRef.current, { scale: 1, duration: 0.17, ease: "power2.in" });

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm leading-relaxed">
        The email{" "}
        <span className="font-semibold text-white">{email}</span> is linked to
        a <span className="text-blue-300 font-medium">Google account</span>.
        Password reset is managed by Google — no separate Integri password
        exists for this identity.
      </p>

      {/* Sign in with Google button */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleGoogleSignIn}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="relative overflow-hidden w-full flex items-center justify-center
                   gap-2.5 py-3 rounded-xl text-sm font-semibold text-white
                   transition-all duration-200 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "0.5px solid rgba(96,165,250,0.3)",
        }}
      >
        {/* Shine */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)",
            transform: "translateX(-115%)",
          }}
        />
        <Chrome size={16} className="text-blue-400 shrink-0" />
        Sign in with Google
      </button>

      {/* Fallback external link */}
      <p className="text-center text-xs text-gray-600">
        or{" "}
        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          manage your Google password
        </a>
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Header config per variant
// ─────────────────────────────────────────────────────────────────────────────
const HEADER: Record<
  ModalVariant,
  { icon: React.ReactNode; title: string }
> = {
  notfound: {
    icon: <AlertTriangle size={20} className="text-red-400" />,
    title: "Identity Not Found",
  },
  google: {
    icon: <Chrome size={20} className="text-blue-400" />,
    title: "Social Identity Detected",
  },
  blacklisted: {
    icon: <ShieldAlert size={20} className="text-orange-400" />,
    title: "Manual Verification Required",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  variant,
  email,
  onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);

  const accent = ACCENT[variant];
  const header = HEADER[variant];

  // ── GSAP entrance ────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, { opacity: 0, duration: 0.22 });
      gsap.from(cardRef.current, {
        scale: 0.93,
        opacity: 0,
        y: 18,
        duration: 0.38,
        ease: "power3.out",
        delay: 0.04,
      });
    });
    return () => ctx.revert();
  }, []);

  // ── Escape key ───────────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // ── Backdrop click ───────────────────────────────────────────────────────
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={onBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fp-modal-title"
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          background: `linear-gradient(145deg, #111113 0%, #0d0d0f 100%)`,
          border: `0.5px solid ${accent.border}`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.06), 0 0 40px ${accent.glow}`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-600 hover:text-white
                     transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${accent.border}` }}
          >
            {header.icon}
          </div>
          <h2
            id="fp-modal-title"
            className="text-white font-bold text-[0.95rem] tracking-tight"
          >
            {header.title}
          </h2>
        </div>

        {/* Body — variant-specific */}
        {variant === "notfound" && <NotFoundBody email={email} />}
        {variant === "blacklisted" && <BlacklistedBody email={email} />}
        {variant === "google" && <GoogleBody email={email} onClose={onClose} />}

        {/* Dismiss (shown for non-google variants; google has its own CTA flow) */}
        {variant !== "google" && (
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl text-sm text-gray-600
                       hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Dismiss
          </button>
        )}
        {variant === "google" && (
          <button
            onClick={onClose}
            className="mt-3 w-full py-2.5 rounded-xl text-xs text-gray-700
                       hover:text-gray-500 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
