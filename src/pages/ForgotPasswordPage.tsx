import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAuthReset } from "../hooks/useAuthReset";
import AuthInput from "../features/auth/components/AuthInput";
import ForgotPasswordModal from "../features/auth/components/ForgotPasswordModal";

// ─────────────────────────────────────────────────────────────────────────────
// Google tooltip
// ─────────────────────────────────────────────────────────────────────────────
const GoogleTooltip: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span className="text-sm text-gray-600">Using Google?</span>
      <button
        type="button"
        className="text-gray-600 hover:text-gray-400 transition-colors"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Google account info"
      >
        <Info size={14} />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-60
                     bg-[#141416] border border-white/10 rounded-xl p-3 shadow-2xl
                     text-xs text-gray-400 leading-relaxed"
        >
          Google accounts reset passwords via Google.{" "}
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 underline"
          >
            Manage here
          </a>
          .
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Glossy submit button
// ─────────────────────────────────────────────────────────────────────────────
const SubmitButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
}> = ({ isLoading, children }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    if (isLoading) return;
    gsap.to(btnRef.current, { scale: 1.025, duration: 0.2, ease: "power2.out" });
    gsap.fromTo(
      shineRef.current,
      { x: "-115%", opacity: 0.7 },
      { x: "115%", opacity: 0, duration: 0.48, ease: "power1.inOut" }
    );
  };
  const onLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.18, ease: "power2.in" });
  };

  return (
    <button
      ref={btnRef}
      type="submit"
      disabled={isLoading}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative w-full overflow-hidden flex items-center justify-center gap-2
                 py-4 rounded-xl font-bold text-sm text-[#07060A]
                 bg-[#F2F4F7] hover:bg-white
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                 shadow-lg shadow-red-900/25 cursor-pointer"
    >
      {/* Shine overlay */}
      <div
        ref={shineRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
          transform: "translateX(-115%)",
        }}
      />
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const { status, errorMessage, sendReset, reset } = useAuthReset();

  // Refs
  const pageRef       = useRef<HTMLDivElement>(null);
  const radialRef     = useRef<HTMLDivElement>(null);
  const shimmerRef    = useRef<HTMLDivElement>(null);
  const robotRef      = useRef<HTMLImageElement>(null);
  const formCardRef   = useRef<HTMLDivElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const floatRef      = useRef<gsap.core.Tween | null>(null);

  // ── Toast on generic error ──────────────────────────────────────────────
  useEffect(() => {
    if (status === "error" && errorMessage) {
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4500,
        theme: "dark",
        style: {
          background: "#18161C",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          color: "#f87171",
          fontSize: "13px",
        },
      });
    }
  }, [status, errorMessage]);

  // ── Mouse-follow radial gradient ────────────────────────────────────────
  useEffect(() => {
    const page = pageRef.current;
    const radial = radialRef.current;
    if (!page || !radial) return;

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = page.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      gsap.to(radial, {
        backgroundImage: `radial-gradient(ellipse 48% 42% at ${x}% ${y}%, rgba(220,38,38,0.09) 0%, rgba(6,182,212,0.04) 45%, transparent 75%)`,
        duration: 0.5,
        ease: "power1.out",
      });
    };

    page.addEventListener("mousemove", onMove);
    return () => page.removeEventListener("mousemove", onMove);
  }, []);

  // ── Entrance + float + shimmer GSAP ────────────────────────────────────
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // form card
      tl.from(formCardRef.current, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      });

      // staggered inner content
      tl.from(
        ".fp-item",
        { y: 14, opacity: 0, stagger: 0.07, duration: 0.55, ease: "power3.out" },
        "-=0.5"
      );

      // robot image
      tl.from(
        robotRef.current,
        { scale: 0.91, opacity: 0, duration: 1.1, ease: "power3.out" },
        "-=0.7"
      );

      // floating breath on robot
      tl.call(() => {
        floatRef.current = gsap.to(robotRef.current, {
          y: -16,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // ── Periodic shimmer sweep (every 8 s) ──────────────────────────
      const doShimmer = () => {
        gsap.fromTo(
          shimmerRef.current,
          { x: "-110%", opacity: 1 },
          { x: "110%", opacity: 0.85, duration: 1.6, ease: "power1.inOut" }
        );
      };
      doShimmer();
      const interval = setInterval(doShimmer, 8000);

      // store cleanup in a ref-callable pattern via returned function
      return () => clearInterval(interval);
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await sendReset(email.trim());
  };

  const handleModalClose = useCallback(() => reset(), [reset]);

  const isLoading = status === "checking";
  const isSuccess = status === "success";
  const showModal = status === "notfound" || status === "google" || status === "blacklisted";

  return (
    <>
      {/* ── Modal overlay ──────────────────────────────────────────────── */}
      {showModal && (
        <ForgotPasswordModal
          variant={status as "notfound" | "google" | "blacklisted"}
          email={email}
          onClose={handleModalClose}
        />
      )}

      {/* ── Full-screen unified container ──────────────────────────────── */}
      <div
        ref={pageRef}
        className="relative flex min-h-screen w-full bg-[#0d0d0f] overflow-hidden"
      >
        {/* Mouse-follow radial gradient */}
        <div ref={radialRef} className="absolute inset-0 z-0 pointer-events-none" />

        {/* Shimmer sweep */}
        <div
          ref={shimmerRef}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)",
            transform: "translateX(-110%)",
          }}
        />

        {/* ── Robot illustration (right side, bleeds left via mask) ──── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none
                     flex items-center justify-end"
        >
          <img
            ref={robotRef}
            src="/robot-illustration.png"
            alt=""
            aria-hidden="true"
            className="h-full max-h-screen object-contain select-none"
            style={{
              width: "58%",
              /* Fade the robot's left edge into the background so it
                 bleeds seamlessly into the glassmorphism form card */
              maskImage:
                "linear-gradient(to right, transparent 0%, black 28%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 28%)",
              opacity: 0.9,
            }}
            onError={(e) => (e.currentTarget.style.opacity = "0")}
          />
        </div>

        {/* Subtle right-side vignette / depth layer */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #0d0d0f 0%, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* ══════════════════════════════════════════════════════════════
            LEFT FORM — glassmorphism card floating above the scene
        ══════════════════════════════════════════════════════════════ */}
        <div
          ref={contentRef}
          className="relative z-20 w-full flex items-center justify-start
                     px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32"
        >
          {/* Back to login — top-left absolute */}
          <Link
            to="/login"
            className="fp-item fixed top-6 left-6 flex items-center gap-1.5
                       text-xs text-gray-600 hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Login
          </Link>

          {/* Glassmorphism card */}
          <div
            ref={formCardRef}
            className="w-full max-w-sm py-10 px-8 rounded-2xl"
            style={{
              background: "rgba(13,13,15,0.65)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.07)",
            }}
          >
            {/* Logo */}
            <div className="fp-item mb-5">
              <img
                src="/dark-theme-logo.png"
                alt="Integri AI"
                className="w-11 h-11 sm:w-13 sm:h-13"
              />
            </div>

            {/* Heading */}
            <h1 className="fp-item text-3xl sm:text-[2rem] font-bold text-white tracking-tight leading-tight mb-2">
              Identity Reset
            </h1>
            <p className="fp-item text-gray-500 text-sm sm:text-[0.88rem] leading-relaxed mb-8">
              We'll verify your email and send a secure reset link.
            </p>

            {/* ── Success state ─────────────────────────────────────── */}
            {isSuccess ? (
              <div className="space-y-5 fp-item">
                <div
                  className="flex items-start gap-3.5 p-4 rounded-xl
                               bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2
                    size={20}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm mb-0.5">
                      Check your inbox
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Reset link sent to{" "}
                      <span className="text-white font-medium">{email}</span>.
                      It may take a minute.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 p-3.5 rounded-xl
                               bg-white/3 border border-white/8 text-xs text-gray-500"
                >
                  <ShieldCheck size={15} className="text-gray-600 shrink-0 mt-0.5" />
                  <span>
                    The link in your email will redirect you back to Integri
                    automatically.
                  </span>
                </div>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3.5
                             rounded-xl bg-[#1a1a1d] border border-white/8 text-white
                             text-sm font-semibold hover:bg-[#222226]
                             hover:border-white/12 transition-all duration-200"
                >
                  <ArrowLeft size={15} />
                  Return to Login
                </Link>
              </div>
            ) : (
              /* ── Form ──────────────────────────────────────────────── */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="fp-item">
                  <AuthInput
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="fp-item">
                  <SubmitButton isLoading={isLoading}>
                    {isLoading ? "Verifying…" : "Send Reset Link"}
                  </SubmitButton>
                </div>

                {/* Divider */}
                <div className="fp-item relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/6" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-gray-700 text-xs"
                      style={{ background: "rgba(13,13,15,0)" }}>
                      or
                    </span>
                  </div>
                </div>

                <div className="fp-item flex justify-center">
                  <GoogleTooltip />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
