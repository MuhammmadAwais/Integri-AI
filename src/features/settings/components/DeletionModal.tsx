import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Loader2, Trash2, Lock, Mail } from "lucide-react";
import { cn } from "../../../lib/utils";

interface DeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, password?: string) => void; // Updated signature
  isDark: boolean;
  isLoading?: boolean;
  authProvider: string; // 'password' or 'google.com' etc.
  currentUserEmail?: string;
}

const DeletionModal: React.FC<DeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark,
  isLoading = false,
  authProvider,
  currentUserEmail,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation States
  const isDeleteTyped = deleteConfirmation.toLowerCase() === "delete";
  const isEmailValid = email.toLowerCase() === currentUserEmail?.toLowerCase();
  // Password is required only if provider is 'password'
  const isPasswordValid =
    authProvider === "password" ? password.length > 0 : true;

  const canSubmit =
    isDeleteTyped && isEmailValid && isPasswordValid && !isLoading;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDeleteConfirmation("");
      setEmail("");
      setPassword("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onConfirm(email, password);
    }
  };

  if (!isOpen) return null;

  const isGoogle = authProvider === "google.com";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-all",
              isDark
                ? "bg-[#18181b] border-zinc-800 text-zinc-100"
                : "bg-white border-zinc-200 text-zinc-900"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold">Delete Account</h3>
              </div>
              <button
                title="close"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  "rounded-full p-2 transition-colors hover:cursor-pointer",
                  isDark
                    ? "hover:bg-zinc-800 text-zinc-400"
                    : "hover:bg-zinc-100 text-zinc-500"
                )}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                This action is{" "}
                <span className="font-bold text-red-500">irreversible</span>.
                Please verify your credentials to confirm permanent deletion.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Type Delete */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider opacity-70">
                    Type <span className="text-red-500 font-bold">delete</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="delete"
                    disabled={isLoading}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all",
                      isDark
                        ? "bg-zinc-900/50 border-zinc-800 focus:border-red-500/50"
                        : "bg-gray-50 border-gray-200 focus:border-red-500/50"
                    )}
                  />
                </div>

                {/* 2. Confirm Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider opacity-70">
                    Confirm Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                      size={16}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={"Input your email here"}
                      disabled={isLoading}
                      className={cn(
                        "w-full rounded-xl border pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all",
                        isDark
                          ? "bg-zinc-900/50 border-zinc-800 focus:border-blue-500/50"
                          : "bg-gray-50 border-gray-200 focus:border-blue-500/50"
                      )}
                    />
                  </div>
                </div>

                {/* 3. Confirm Password (Only if using Password Auth) */}
                {!isGoogle && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider opacity-70">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                        size={16}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className={cn(
                          "w-full rounded-xl border pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all",
                          isDark
                            ? "bg-zinc-900/50 border-zinc-800 focus:border-blue-500/50"
                            : "bg-gray-50 border-gray-200 focus:border-blue-500/50"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Google Notice */}
                {isGoogle && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-xs border",
                      isDark
                        ? "bg-blue-900/10 border-blue-900/30 text-blue-200"
                        : "bg-blue-50 border-blue-100 text-blue-700"
                    )}
                  >
                    For security, you will be asked to sign in with Google again
                    after clicking Delete.
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className={cn(
                      "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:cursor-pointer",
                      isDark
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg ",
                      !canSubmit || isLoading
                        ? "opacity-50 cursor-not-allowed bg-red-600 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:cursor-pointer"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DeletionModal;
