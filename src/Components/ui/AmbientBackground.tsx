import React from "react";

/**
 * Static ambient glow behind page content (replaces the animated particle
 * canvas). One soft radial light, Gemini-style, so the eye settles on the
 * content instead of tracking movement. No animation, no event listeners.
 */
const AmbientBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    <div className="absolute left-1/2 top-1/2 h-[min(80vh,720px)] w-[min(90vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(20,153,138,0.10),transparent)] dark:bg-[radial-gradient(closest-side,rgba(94,234,212,0.07),rgba(124,92,255,0.03)_55%,transparent)]" />
  </div>
);

export default AmbientBackground;
