/**
 * ImportCodeModal.tsx
 *
 * Glassmorphic modal for importing a GitHub repository into the chat context.
 *
 * States:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  NOT CONNECTED   → "Connect GitHub" OAuth + PAT fallback    │
 *  │  LOADING         → Progress bar + "Indexed x/y files..."    │
 *  │  SUCCESS         → Green chip, token count, "Use Repo" btn  │
 *  │  ERROR           → Red error message with retry option       │
 *  └─────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Github,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  TriangleAlert,
  Eye,
  EyeOff,
  ArrowRight,
  FolderGit2,
  Cpu,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useGitHubOAuth } from "../hooks/useGitHubOAuth";
import { useRepoPacker } from "../hooks/useRepoPacker";
import { useAppSelector } from "../../../hooks/useRedux";
import { toast } from "react-toastify";

interface ImportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Micro-component: Animated progress bar ─────────────────────────────────

const ProgressBar: React.FC<{ value: number; total: number }> = ({
  value,
  total,
}) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
};

// ── Micro-component: Status dot ────────────────────────────────────────────

const PulseDot: React.FC<{ color?: string }> = ({
  color = "bg-indigo-400",
}) => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span
      className={cn(
        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
        color
      )}
    />
    <span
      className={cn("relative inline-flex rounded-full h-2 w-2", color)}
    />
  </span>
);

// ── Main Modal ──────────────────────────────────────────────────────────────

const ImportCodeModal: React.FC<ImportCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const attachedRepo = useAppSelector(
    (state: any) => state.chat.attachedRepo
  );

  const [repoUrl, setRepoUrl] = useState("");
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [showPATInput, setShowPATInput] = useState(false);
  const [patLoading, setPatLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // const {
  //   isConnected,
  //   user,
  //   connect,
  //   connectWithPAT,
  //   disconnect,
  // } = useGitHubOAuth();

  const isConnected = false;
  const user = null as any;

  const { packRepo, reset, status, progress, error } = useRepoPacker();

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && status === "idle") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, status]);

  // Show success toast when done
  useEffect(() => {
    if (status === "done" && attachedRepo) {
      toast.success(
        `✅ ${attachedRepo.owner}/${attachedRepo.repo} indexed — ${attachedRepo.fileCount} files, ${(attachedRepo.tokenCount / 1000).toFixed(0)}K tokens`,
        { autoClose: 4000 }
      );
    } else if (status === "error" && error) {
      toast.error(error);
    }
  }, [status, attachedRepo, error]);

  const handleImport = () => {
    if (!repoUrl.trim()) return;
    packRepo(repoUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && repoUrl.trim() && status === "idle") {
      handleImport();
    }
    if (e.key === "Escape") onClose();
  };

  const handlePATConnect = async () => {
    // if (!pat.trim()) return;
    // setPatLoading(true);
    // try {
    //   await connectWithPAT(pat);
    //   setPat("");
    //   setShowPATInput(false);
    //   toast.success("GitHub account connected!");
    // } catch (err: any) {
    //   toast.error(err.message || "Failed to connect GitHub account.");
    // } finally {
    //   setPatLoading(false);
    // }
  };

  const handleClose = () => {
    if (status !== "crawling" && status !== "fetching_tree" && status !== "packing") {
      reset();
      setRepoUrl("");
      onClose();
    }
  };

  const isLoading =
    status === "fetching_tree" ||
    status === "crawling" ||
    status === "packing";

  // ─── Render ──────────────────────────────────────────────────────────────

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-[480px] rounded-2xl border shadow-2xl overflow-hidden",
              isDark
                ? "bg-[#111113]/95 border-white/10 text-white backdrop-blur-xl"
                : "bg-white/95 border-gray-200 text-gray-900 backdrop-blur-xl"
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4 border-b",
                isDark ? "border-white/10" : "border-gray-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    isDark ? "bg-white/10" : "bg-gray-100"
                  )}
                >
                  <FolderGit2 size={16} className="text-indigo-400" />
                </div>
                <span className="font-semibold text-sm tracking-tight">
                  Import Code Repository
                </span>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isLoading
                    ? "opacity-30 cursor-not-allowed"
                    : isDark
                    ? "hover:bg-white/10 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                )}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 flex flex-col gap-4">
              {/* ── State: SUCCESS ──────────────────────────────────────── */}
              <AnimatePresence mode="wait">
                {status === "done" && attachedRepo ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Success banner */}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-emerald-400">
                          Repository Indexed!
                        </span>
                        <span
                          className={cn(
                            "text-xs truncate mt-0.5",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          {attachedRepo.owner}/{attachedRepo.repo} ·{" "}
                          {attachedRepo.branch}
                        </span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={cn(
                          "rounded-xl p-3 border",
                          isDark
                            ? "bg-white/5 border-white/10"
                            : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <FolderGit2 size={12} className="text-indigo-400" />
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                            Files
                          </span>
                        </div>
                        <span className="text-xl font-bold">
                          {attachedRepo.fileCount.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-xl p-3 border",
                          isDark
                            ? "bg-white/5 border-white/10"
                            : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Cpu size={12} className="text-purple-400" />
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                            Tokens
                          </span>
                        </div>
                        <span className="text-xl font-bold">
                          {(attachedRepo.tokenCount / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>

                    {/* Token warning */}
                    {attachedRepo.isOverLimit && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                        <TriangleAlert size={14} className="shrink-0 mt-px" />
                        <span>
                          <span className="font-semibold">Token Limit Warning:</span>{" "}
                          This repo exceeds 1M tokens. Some lower-priority files
                          were excluded to stay within context limits.
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          reset();
                          setRepoUrl("");
                        }}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                          isDark
                            ? "border-white/10 hover:bg-white/5 text-gray-400"
                            : "border-gray-200 hover:bg-gray-50 text-gray-500"
                        )}
                      >
                        Import Another
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        Use this Repo
                      </button>
                    </div>
                  </motion.div>
                ) : status === "error" ? (
                  /* ── State: ERROR ──────────────────────────────────────── */
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle size={18} className="text-red-400 shrink-0 mt-px" />
                      <span className="text-sm text-red-300">{error}</span>
                    </div>

                    {/* URL input for retry */}
                    <div
                      className={cn(
                        "flex items-center gap-2 w-full rounded-xl border px-3 py-2.5",
                        isDark
                          ? "bg-white/5 border-white/10"
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <LinkIcon size={14} className="text-gray-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://github.com/owner/repo"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        reset();
                        if (repoUrl.trim()) packRepo(repoUrl);
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      Retry Import
                    </button>
                  </motion.div>
                ) : isLoading ? (
                  /* ── State: LOADING ─────────────────────────────────────── */
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-5 py-2"
                  >
                    {/* Repo identifier */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <Github size={18} className="text-indigo-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {repoUrl
                            .replace("https://github.com/", "")
                            .replace(/\/tree\/.+$/, "")}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <PulseDot />
                          <span className="text-xs text-gray-400">
                            {progress.phase || "Initialising..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar value={progress.indexed} total={progress.total} />

                    {/* File counter */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {progress.phase || "Processing..."}
                      </span>
                      {progress.total > 0 && (
                        <span className="text-xs font-mono font-semibold text-indigo-400">
                          {progress.indexed} / {progress.total}
                        </span>
                      )}
                    </div>

                    {/* Animated dots — "thinking" feel */}
                    <div className="flex justify-center gap-1.5 py-2">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500/60"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-center text-[11px] text-gray-500">
                      This may take a moment for large repositories
                    </p>
                  </motion.div>
                ) : (
                  /* ── State: IDLE (default entry) ─────────────────────── */
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-4"
                  >
                    {/* GitHub account status */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border",
                        isDark
                          ? "bg-white/5 border-white/10"
                          : "bg-gray-50 border-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Github size={16} className={isDark ? "text-white" : "text-gray-800"} />
                        {isConnected && user ? (
                          <span className="text-sm font-medium">
                            Connected as{" "}
                            <span className="text-indigo-400 font-semibold">
                              {user.login}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not connected{" "}
                            <span className="text-[11px] ml-1">(public repos only)</span>
                          </span>
                        )}
                      </div>
                      {/* isConnected ? (
                        <button
                          onClick={disconnect}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowPATInput(!showPATInput)}
                            className="text-xs text-gray-400 hover:text-gray-300 font-medium transition-colors"
                          >
                            Use PAT
                          </button>
                          <button
                            onClick={connect}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                          >
                            Connect
                          </button>
                        </div>
                      ) */}
                    </div>

                    {/* PAT input (collapsible) */}
                    <AnimatePresence>
                      {showPATInput && !isConnected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2">
                            <div
                              className={cn(
                                "flex-1 flex items-center gap-2 rounded-xl border px-3 py-2.5",
                                isDark
                                  ? "bg-white/5 border-white/10"
                                  : "bg-gray-50 border-gray-200"
                              )}
                            >
                              <input
                                type={showPat ? "text" : "password"}
                                value={pat}
                                onChange={(e) => setPat(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handlePATConnect();
                                }}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-500 font-mono"
                              />
                              <button onClick={() => setShowPat(!showPat)} className="text-gray-400 hover:text-gray-300">
                                {showPat ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                            <button
                              onClick={handlePATConnect}
                              disabled={patLoading || !pat.trim()}
                              className={cn(
                                "px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                                pat.trim() && !patLoading
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  : isDark
                                  ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              )}
                            >
                              {patLoading ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1.5 ml-1">
                            Generate a PAT with{" "}
                            <a
                              href="https://github.com/settings/tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline"
                            >
                              repo read access
                            </a>
                            . Not stored on any server.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* URL input */}
                    <div
                      className={cn(
                        "flex items-center gap-2 w-full rounded-xl border px-3 py-3 transition-colors",
                        isDark
                          ? "bg-white/5 border-white/10 focus-within:border-indigo-500/50"
                          : "bg-gray-50 border-gray-200 focus-within:border-indigo-400"
                      )}
                    >
                      <LinkIcon size={14} className="text-gray-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="GitHub repository or branch URL"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {repoUrl && (
                        <button
                          onClick={() => setRepoUrl("")}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Info note */}
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                      Currently only public repos are supported without authentication.
                      {/* For private repos,{" "}
                      <button
                        onClick={() => setShowPATInput(true)}
                        className="text-indigo-400 hover:underline"
                      >
                        connect your GitHub account
                      </button>
                      . */}
                    </p>

                    {/* Import button */}
                    <button
                      onClick={handleImport}
                      disabled={!repoUrl.trim()}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                        repoUrl.trim()
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-px"
                          : isDark
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Github size={16} />
                      Import Repository
                      {repoUrl.trim() && (
                        <ArrowRight size={14} className="ml-auto" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImportCodeModal;
