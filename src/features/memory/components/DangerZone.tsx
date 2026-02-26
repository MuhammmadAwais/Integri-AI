import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DangerZoneProps {
  onDeleteMemory: () => Promise<void>;
  isLoading: boolean;
  isDark: boolean;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onDeleteMemory, isLoading, isDark }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    await onDeleteMemory();
    setShowConfirm(false);
  };

  return (
    <>
      <div className={cn(
        'rounded-2xl border',
        isDark ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50 border-red-200'
      )}>
        {/* Header */}
        <div className={cn('flex items-center justify-between px-6 py-4 border-b', isDark ? 'border-red-900/30' : 'border-red-200')}>
          <span className={cn('text-xs font-semibold uppercase tracking-widest', isDark ? 'text-red-400/70' : 'text-red-500')}>
            Danger Zone
          </span>
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-zinc-900')}>Clear All Memory</p>
            <p className={cn('text-xs mt-1 max-w-sm leading-relaxed', isDark ? 'text-zinc-500' : 'text-zinc-500')}>
              Permanently deletes all extracted facts, topics, patterns, and context. This action cannot be undone.
            </p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all shrink-0 cursor-pointer disabled:opacity-50',
              isDark
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                : 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-sm'
            )}
          >
            {isLoading
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />}
            Delete Memory
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {createPortal(
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                onClick={() => !isLoading && setShowConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'relative z-10 w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden',
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
                )}
              >
                {/* Top red stripe */}
                <div className="h-1 bg-red-600 w-full" />

                <div className="p-6">
                  {!isLoading && (
                    <button
                      onClick={() => setShowConfirm(false)}
                      className={cn('absolute top-5 right-5 p-1.5 rounded-lg cursor-pointer transition-colors', isDark ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', isDark ? 'bg-red-500/15' : 'bg-red-50 border border-red-100')}>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>

                  <h3 className={cn('text-base font-bold mb-1.5', isDark ? 'text-zinc-100' : 'text-zinc-900')}>
                    Delete all memory?
                  </h3>
                  <p className={cn('text-sm leading-relaxed mb-6', isDark ? 'text-zinc-400' : 'text-zinc-500')}>
                    This permanently removes every fact, topic, and interaction pattern Integri has learned about you. You cannot recover this data.
                  </p>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={isLoading}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer disabled:opacity-50',
                        isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-70"
                    >
                      {isLoading
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Deleting…</>
                        : <><Trash2 className="w-3.5 h-3.5" />Yes, delete</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default DangerZone;
