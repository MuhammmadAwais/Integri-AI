import React, { useEffect, useRef } from 'react';
import { MessageSquare, Image, Mic, Bot, RefreshCw, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useLimits } from '../hooks/useLimits';
import { useAppSelector } from '../../../hooks/useRedux';
import gsap from 'gsap';

interface LimitsOverviewCardProps {
  isDark: boolean;
}

interface BarProps {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
  pct: number;
  unit?: string;
  isDark: boolean;
  barRef: React.RefObject<HTMLDivElement | null>;
}

const LimitBar: React.FC<BarProps> = ({ label, icon: Icon, used, limit, pct, unit = '', isDark, barRef }) => {
  const isWarning = pct >= 80 && pct < 100;
  const isFull    = pct >= 100;

  const trackClass = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const fillClass  = isFull
    ? 'bg-red-600'
    : isWarning
    ? 'bg-amber-500'
    : (isDark ? 'bg-zinc-300' : 'bg-zinc-800');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-zinc-400')} />
          <span className={cn('text-xs font-medium', isDark ? 'text-zinc-400' : 'text-zinc-600')}>
            {label}
          </span>
        </div>
        <span className={cn(
          'text-xs tabular-nums font-semibold',
          isFull ? 'text-red-500' : isWarning ? 'text-amber-500' : (isDark ? 'text-zinc-300' : 'text-zinc-700')
        )}>
          {typeof used === 'number' && used % 1 !== 0 ? used.toFixed(1) : used}
          {unit} / {limit}{unit}
        </span>
      </div>
      <div className={cn('h-1.5 rounded-full overflow-hidden', trackClass)}>
        <div
          ref={barRef}
          className={cn('h-full rounded-full will-change-transform', fillClass)}
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
};

const LimitsOverviewCard: React.FC<LimitsOverviewCardProps> = ({ isDark }) => {
  const { limits, isLoading, isError, resetTimeFormatted, messagesPct, imagesPct, voicePct, agentsPct, refresh } =
    useLimits();
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const msgBarRef   = useRef<HTMLDivElement>(null);
  const imgBarRef   = useRef<HTMLDivElement>(null);
  const voiceBarRef = useRef<HTMLDivElement>(null);
  const agentBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP: stagger card in, then animate bars to target width
  useEffect(() => {
    if (!limits) return;

    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }

    const bars = [
      { ref: msgBarRef,   pct: messagesPct },
      { ref: imgBarRef,   pct: imagesPct   },
      { ref: voiceBarRef, pct: voicePct    },
      { ref: agentBarRef, pct: agentsPct   },
    ];

    bars.forEach(({ ref, pct }, i) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { width: '0%' },
          { width: `${Math.min(pct, 100)}%`, duration: 0.7, ease: 'power2.out', delay: 0.1 + i * 0.08 }
        );
      }
    });
  }, [limits, messagesPct, imagesPct, voicePct, agentsPct]);

  const base    = isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200';
  const divLine = isDark ? 'border-stone-800' : 'border-stone-100';

  if (isLoading && !limits) {
    return (
      <div className={cn('rounded-2xl border animate-pulse', base)}>
        <div className={cn('px-6 py-3.5 border-b', divLine)}>
          <div className={cn('h-3 w-32 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
        </div>
        <div className="px-6 py-5 space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={cn('h-3 w-40 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
              <div className={cn('h-1.5 rounded-full', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError && !limits) {
    return (
      <div className={cn('rounded-2xl border', base)}>
        <div className={cn('px-6 py-3.5 border-b', divLine)}>
          <span className={cn('text-xs font-semibold uppercase tracking-[0.12em]', isDark ? 'text-stone-500' : 'text-stone-400')}>
            Usage Limits
          </span>
        </div>
        <div className={cn('px-6 py-8 flex flex-col items-center gap-3 text-center')}>
          <p className={cn('text-sm', isDark ? 'text-stone-500' : 'text-stone-500')}>Could not load limits</p>
          {token && (
            <button
              onClick={() => refresh(token)}
              className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors',
                isDark ? 'border-stone-700 text-stone-400 hover:bg-stone-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
              )}
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!limits) return null;

  return (
    <div ref={containerRef} className={cn('rounded-2xl border', base)} style={{ opacity: 0 }}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-3.5 border-b', divLine)}>
        <span className={cn('text-xs font-semibold uppercase tracking-[0.12em]', isDark ? 'text-stone-500' : 'text-stone-400')}>
          Usage Limits
        </span>
        <div className="flex items-center gap-2">
          {resetTimeFormatted && (
            <span className={cn('flex items-center gap-1 text-xs', isDark ? 'text-stone-700' : 'text-stone-400')}>
              <Clock className="w-3 h-3" />
              Resets {resetTimeFormatted}
            </span>
          )}
          {token && (
            <button
              onClick={() => refresh(token)}
              title="Refresh limits"
              className={cn('p-1 rounded cursor-pointer transition-colors', isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600')}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Bars */}
      <div className="px-6 py-5 space-y-5">
        <LimitBar
          label="Daily Messages"
          icon={MessageSquare}
          used={limits.daily_messages_used}
          limit={limits.daily_message_limit}
          pct={messagesPct}
          isDark={isDark}
          barRef={msgBarRef}
        />
        <LimitBar
          label="Image Generation"
          icon={Image}
          used={limits.images_generated_this_month}
          limit={limits.image_generation_limit}
          pct={imagesPct}
          isDark={isDark}
          barRef={imgBarRef}
        />
        <LimitBar
          label="Voice Minutes"
          icon={Mic}
          used={parseFloat(limits.voice_minutes_used.toFixed(1))}
          limit={limits.voice_limit_minutes}
          pct={voicePct}
          unit=" min"
          isDark={isDark}
          barRef={voiceBarRef}
        />
        <LimitBar
          label="Agents"
          icon={Bot}
          used={limits.current_agents_count}
          limit={limits.max_agents}
          pct={agentsPct}
          isDark={isDark}
          barRef={agentBarRef}
        />
      </div>

      {/* Tier badge */}
      <div className={cn('px-6 pb-4 flex items-center gap-2')}>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider',
          isDark ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-600'
        )}>
          {limits.tier}
        </span>
        {limits.is_daily_limit_reached && (
          <span className="text-xs text-red-500 font-medium">· Daily limit reached</span>
        )}
      </div>
    </div>
  );
};

export default LimitsOverviewCard;
