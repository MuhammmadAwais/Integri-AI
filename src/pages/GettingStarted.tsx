import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAppDispatch } from "../hooks/useRedux";
import { completeOnboarding } from "../features/auth/slices/authSlice";

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Fade in container background
      tl.from(containerRef.current, {
        opacity: 0,
        duration: 1,
      })
        // 2. Slide content up
        .from(contentRef.current, {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
        });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    dispatch(completeOnboarding());
    navigate("/");
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden flex items-center"
    >
      {/* BACKGROUND IMAGE - Full Screen for Immersive feel */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent z-10" />
        <img
          src="/gettingStarted.png"
          alt="Future AI"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1622979135225-d2ba269fb1ac?q=80&w=2070";
          }}
        />
      </div>

      {/* CONTENT - Floating on top (Glass effect) */}
      <div className="relative z-20 container mx-auto px-6 md:px-12">
        <div ref={contentRef} className="max-w-2xl text-left">
          {/* Decorative Tag */}
          <div className="inline-block px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900/50 backdrop-blur-md mb-6">
            <span className="text-indigo-400 text-sm font-semibold tracking-wide uppercase">
              Integri AI v1.0
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            The Future of Chat <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500">
              Is Here
            </span>
          </h1>

          <p className="text-gray-300 mb-10 text-lg md:text-xl max-w-lg leading-relaxed font-light">
            Unlock the potential of next-gen conversational AI. Integrated
            seamlessly into your workflow for maximum productivity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full border border-gray-700 text-white font-medium text-lg hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
