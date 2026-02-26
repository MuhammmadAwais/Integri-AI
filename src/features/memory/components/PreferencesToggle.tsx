import React from 'react';
import { Brain, PowerOff } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { UserPreferencesPayload } from '../../../api/backendApi';
import { motion } from 'framer-motion';

interface PreferencesToggleProps {
  preferences: UserPreferencesPayload | null;
  onToggleMemory: (disable: boolean) => void;
  isLoading: boolean;
  isDark: boolean;
}

const PreferencesToggle: React.FC<PreferencesToggleProps> = ({ preferences, onToggleMemory, isLoading, isDark }) => {
  const isEnabled = !(preferences?.disable_memory_extraction ?? false);
  const base = isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200';
  const divLine = isDark ? 'border-stone-800' : 'border-stone-100';

  if (isLoading && preferences === null) {
    return (
      <div className={cn('rounded-2xl border animate-pulse', base)}>
        <div className={cn('px-6 py-3.5 border-b', divLine)}>
          <div className={cn('h-3 w-40 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
        </div>
        <div className={cn('px-6 py-5 flex items-center justify-between gap-6')}>
          <div className="flex items-center gap-3.5 flex-1">
            <div className={cn('w-9 h-9 rounded-xl shrink-0', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
            <div className="space-y-2 flex-1">
              <div className={cn('h-3 w-40 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
              <div className={cn('h-2.5 w-64 rounded', isDark ? 'bg-stone-900' : 'bg-stone-100')} />
            </div>
          </div>
          <div className={cn('w-11 h-6 rounded-full shrink-0', isDark ? 'bg-stone-800' : 'bg-stone-200')} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border', base)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-3.5 border-b', divLine)}>
        <span className={cn('text-xs font-semibold uppercase tracking-[0.12em]', isDark ? 'text-stone-500' : 'text-stone-400')}>
          Memory Extraction
        </span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full border font-medium',
          isEnabled
            ? (isDark ? 'bg-amber-900/30 border-amber-800/40 text-amber-600' : 'bg-amber-50 border-amber-100 text-amber-700')
            : (isDark ? 'bg-stone-900 border-stone-800 text-stone-600' : 'bg-stone-100 border-stone-200 text-stone-400')
        )}>
          {isEnabled ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={cn(
            'p-2.5 rounded-xl shrink-0',
            isDark ? 'bg-stone-900 border border-stone-800' : 'bg-stone-100'
          )}>
            {isEnabled
              ? <Brain className={cn('w-4 h-4', isDark ? 'text-stone-300' : 'text-stone-700')} />
              : <PowerOff className={cn('w-4 h-4', isDark ? 'text-stone-600' : 'text-stone-400')} />}
          </div>
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold', isDark ? 'text-stone-200' : 'text-stone-800')}>
              {isEnabled ? 'Learning from conversations' : 'Memory extraction paused'}
            </p>
            <p className={cn('text-xs mt-0.5 leading-relaxed', isDark ? 'text-stone-600' : 'text-stone-400')}>
              Integri automatically extracts facts and context from chats to personalise future responses.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggleMemory(isEnabled)}
          disabled={isLoading}
          aria-label="Toggle memory extraction"
          className={cn(
            'relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer disabled:opacity-40',
            isEnabled
              ? (isDark ? 'bg-amber-700' : 'bg-stone-800')
              : (isDark ? 'bg-stone-700' : 'bg-stone-300')
          )}
        >
          {isLoading ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className={cn('w-3 h-3 border-2 rounded-full animate-spin border-t-transparent', isDark ? 'border-stone-400' : 'border-stone-600')} />
            </span>
          ) : (
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 550, damping: 32 }}
              className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full shadow-sm',
                isEnabled ? 'left-[22px] bg-white' : (isDark ? 'left-0.5 bg-stone-500' : 'left-0.5 bg-white')
              )}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferencesToggle;
