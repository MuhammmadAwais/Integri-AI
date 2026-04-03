import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Github,
  X,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  FolderGit2,
  TerminalSquare
} from "lucide-react";
import { cn } from "../../../lib/utils";
import gsap from "gsap";

import { useRepoPacker } from "../hooks/useRepoPacker";
import { useAppSelector } from "../../../hooks/useRedux";
import { useToast } from "../../../Components/ui/ToastProvider";

interface ImportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoiseOverlay = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15] mix-blend-overlay z-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

const LiquidProgressBar: React.FC<{ value: number; total: number }> = ({ value, total }) => {
  const barRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (barRef.current) {
      const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
      gsap.to(barRef.current, {
        width: `${pct}%`,
        duration: 0.6,
        ease: "back.out(1.2)",
      });
    }
  }, [value, total]);

  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden relative">
      <div
        ref={barRef}
        className="h-full bg-zinc-100 rounded-full w-0 will-change-transform"
      />
    </div>
  );
};

const ImportCodeModal: React.FC<ImportCodeModalProps> = ({ isOpen, onClose }) => {
  const { success, error: toastError } = useToast();
  const attachedRepo = useAppSelector((state: any) => state.chat.attachedRepo);

  const [repoUrl, setRepoUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastNotifiedRepoRef = useRef<string | null>(null);

  const { packRepo, reset, status, progress, error } = useRepoPacker();

  useEffect(() => {
    if (isOpen && status === "idle") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, status]);

  useEffect(() => {
    if (status === "done" && attachedRepo) {
      const repoKey = `${attachedRepo.owner}/${attachedRepo.repo}`;
      if (lastNotifiedRepoRef.current !== repoKey) {
        success(`Repository Imported Successfully: ${attachedRepo.repo}`);
        lastNotifiedRepoRef.current = repoKey;
      }
      reset();
      onClose();
    } else if (status === "error" && error) {
      toastError(error);
    }
  }, [status, attachedRepo, error, onClose, success, toastError, reset]);

  const handleImport = () => {
    if (!repoUrl.trim() || status !== "idle") return;
    packRepo(repoUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && repoUrl.trim() && status === "idle") {
      handleImport();
    }
    if (e.key === "Escape") onClose();
  };

  const handleClose = () => {
    if (status !== "crawling" && status !== "fetching_tree" && status !== "packing") {
      reset();
      setRepoUrl("");
      onClose();
    }
  };

  const isLoading = status === "fetching_tree" || status === "crawling" || status === "packing";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-[480px] rounded-2xl overflow-hidden shadow-2xl",
              "bg-zinc-950/40 backdrop-blur-2xl border border-zinc-800 text-zinc-100",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            )}
          >
            <NoiseOverlay />

            <div className="relative z-10">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <TerminalSquare size={16} className="text-zinc-300" />
                  </div>
                  <span className="font-semibold text-sm tracking-tight text-white">Import Github Repository</span>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className={cn("p-1.5 rounded-lg transition-colors", isLoading ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-800 text-zinc-400 hover:text-white hover:cursor-pointer")}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">
                <AnimatePresence mode="wait">
                  {status === "error" ? (
                    <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-px" />
                        <span className="text-sm text-red-300">{error}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full rounded-xl border px-3 py-2.5 bg-zinc-900/50 border-zinc-800 focus-within:border-zinc-700 transition-colors">
                        <LinkIcon size={14} className="text-zinc-500 shrink-0" />
                        <input
                          ref={inputRef}
                          type="url"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="https://github.com/owner/repo"
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600 text-zinc-200"
                        />
                      </div>
                      <button
                        onClick={() => { reset(); if (repoUrl.trim()) packRepo(repoUrl); }}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 hover:bg-white text-zinc-900 transition-colors shadow-lg hover:cursor-pointer"
                      >
                        Retry Import
                      </button>
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-6 py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 relative">
                           <FolderGit2 size={20} className="text-zinc-300 relative z-10" />
                           <motion.div className="absolute inset-0 border border-zinc-500 rounded-xl" animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white truncate">{repoUrl.replace("https://github.com/", "").split("/tree/")[0]}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                            <span className="text-xs font-mono text-zinc-400 tracking-tight">{progress.phase || "Initialising..."}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <LiquidProgressBar value={progress.indexed} total={progress.total} />
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{progress.phase || "SYS/BUSY..."}</span>
                          {progress.total > 0 && <span className="text-[10px] font-mono font-medium text-zinc-400">{progress.indexed}/{progress.total}</span>}
                        </div>
                      </div>

                      <button disabled className="w-full py-3 flex justify-center items-center rounded-xl text-sm font-semibold bg-zinc-900/80 border border-zinc-800 text-zinc-500 cursor-not-allowed">
                         <Loader2 size={16} className="animate-spin mr-2" />
                         Loading your code...
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">Target Repository</label>
                        <div className="flex items-center gap-2 w-full rounded-xl border px-3 py-3 bg-zinc-900/50 border-zinc-800 focus-within:border-zinc-600 transition-colors">
                          <Github size={15} className="text-zinc-500 shrink-0" />
                          <input
                            ref={inputRef}
                            type="url"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="github.com/owner/repo"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600 text-zinc-200"
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <button
                          onClick={handleImport}
                          disabled={!repoUrl.trim()}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
                            repoUrl.trim()
                              ? "bg-zinc-100 hover:bg-white text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
                              : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed",
                            repoUrl.trim() && "cursor-pointer hover:cursor-pointer"
                          )}
                        >
                          Import Repository
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImportCodeModal;
