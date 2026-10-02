import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Smartphone, X, Store } from "lucide-react";
import Portal from "../../../Components/ui/Portal";
import { useAppSelector } from "../../../hooks/useRedux";

interface NewUserBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewUserBlockedModal: React.FC<NewUserBlockedModalProps> = ({ isOpen, onClose }) => {
  const isDark = useAppSelector((state: any) => state.theme?.isDark ?? true);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // GSAP slide + fade entrance
  useEffect(() => {
    if (!isOpen || !panelRef.current || !backdropRef.current) return;

    // Reset
    gsap.set(panelRef.current, { y: 40, opacity: 0 });
    gsap.set(backdropRef.current, { opacity: 0 });

    // Animate in
    const tl = gsap.timeline();
    tl.to(backdropRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" })
      .to(panelRef.current, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, "-=0.1");
  }, [isOpen]);

  const handleClose = () => {
    if (!panelRef.current || !backdropRef.current) { onClose(); return; }
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { y: 30, opacity: 0, duration: 0.25, ease: "power2.in" })
      .to(backdropRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal Panel */}
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden
            ${isDark
              ? "bg-[#07060A] border-zinc-800 text-white"
              : "bg-white border-zinc-200 text-zinc-900"}
          `}
        >
          {/* Top accent stripe */}
          <div className="h-0.5 w-full bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700" />

          {/* Close */}
          <button
            onClick={handleClose}
            className={`
              absolute right-4 top-4 p-1.5 rounded-lg transition-colors hover:cursor-pointer
              ${isDark ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300" : "hover:bg-zinc-100 text-zinc-400"}
            `}
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="px-7 pt-8 pb-4 flex flex-col items-center text-center gap-4">
            {/* Icon badge */}
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center border
              ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"}
            `}>
              <Smartphone size={26} className={isDark ? "text-zinc-300" : "text-zinc-700"} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1.5">Account Not Found</h2>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Registration is exclusively available via the{" "}
                <span className={isDark ? "text-zinc-200 font-medium" : "text-zinc-800 font-medium"}>
                  Integri Mobile App.
                </span>{" "}
                Please create your account there, then return here to sign in.
              </p>
            </div>
          </div>

          {/* App store links */}
          <div className="px-7 pb-3 flex flex-col gap-2.5">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-semibold transition-all
                ${isDark
                  ? "bg-white text-black hover:bg-zinc-100 border-white"
                  : "bg-black text-white hover:bg-zinc-800 border-black"}
              `}
            >
              <Store size={16} />
              Download on the App Store
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-semibold transition-all
                ${isDark
                  ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800/50"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"}
              `}
            >
              <Store size={16} />
              Get it on Google Play
            </a>
          </div>

          {/* Footer */}
          <div className={`
            px-7 py-3 text-center text-xs border-t
            ${isDark ? "border-zinc-800 text-zinc-600" : "border-zinc-100 text-zinc-400"}
          `}>
            Already have an account?{" "}
            <button
              onClick={handleClose}
              className={`font-semibold hover:cursor-pointer ${isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              Try a different account
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default NewUserBlockedModal;
