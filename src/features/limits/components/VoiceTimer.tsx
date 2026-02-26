import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAppDispatch } from '../../../hooks/useRedux';
import { useLimits } from '../hooks/useLimits';
import { addVoiceSeconds } from '../slices/limitsSlice';

interface VoiceTimerProps {
  /** Whether a voice session is currently active */
  isActive: boolean;
  isDark: boolean;
  className?: string;
}

const fmtTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * VoiceTimer — displays voice_minutes_used vs voice_limit_minutes.
 * When isActive=true, counts up every second and dispatches addVoiceSeconds
 * to keep the Redux slice in sync with the live session.
 */
const VoiceTimer: React.FC<VoiceTimerProps> = ({ isActive, isDark, className }) => {
  const { limits, voicePct } = useLimits();
  const dispatch = useAppDispatch();
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      setSessionSeconds(0);
      intervalRef.current = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
        dispatch(addVoiceSeconds(1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, dispatch]);

  if (!limits) return null;

  const baseMinsUsed = limits.voice_minutes_used - sessionSeconds / 60;
  const totalSecsUsed = Math.floor(baseMinsUsed * 60) + sessionSeconds;
  const limitSecs = limits.voice_limit_minutes * 60;
  const remainSecs = Math.max(0, limitSecs - totalSecsUsed);

  const isWarning = voicePct >= 80;
  const isFull    = voicePct >= 100 || remainSecs === 0;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono',
      isDark
        ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
        : 'bg-white border-zinc-200 text-zinc-500',
      isFull && 'border-red-500/30 text-red-500',
      className
    )}>
      {isActive
        ? <Mic className={cn('w-3 h-3 animate-pulse', isFull ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-current')} />
        : <MicOff className="w-3 h-3" />}

      <span className={cn(isFull ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-current')}>
        {fmtTime(totalSecsUsed)}
      </span>

      <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>/</span>

      <span>{fmtTime(limitSecs)}</span>
    </div>
  );
};

export default VoiceTimer;
