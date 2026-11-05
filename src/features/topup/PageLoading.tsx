import React from "react";
import { Loader2 } from "lucide-react";

/** Shown while a top-up page's language texts load (a few KB), in the page's own colours. */
const PageLoading: React.FC<{ failed?: boolean }> = ({ failed }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A] p-6 text-center text-zinc-300">
    {failed ? (
      <>
        <p>Could not load this page. Check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:cursor-pointer hover:border-white/30">
          Reload
        </button>
      </>
    ) : (
      <Loader2 size={28} className="animate-spin text-zinc-500" aria-label="Loading" />
    )}
  </div>
);

export default PageLoading;
