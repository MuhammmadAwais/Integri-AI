import React, { useEffect, useRef } from 'react';
import { Brain, Hash, Layers, Database, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { MemoryStats } from '../../../api/backendApi';
import gsap from 'gsap';

interface MemoryStatsCardProps {
  stats: MemoryStats | null;
  isLoading: boolean;
  isDark: boolean;
}

const fmtBytes = (b: number) => {
  if (b === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${s[i]}`;
};

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
};

const MemoryStatsCard: React.FC<MemoryStatsCardProps> = ({ stats, isLoading, isDark }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && stats && ref.current) {
      gsap.fromTo(ref.current.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' });
    }
  }, [isLoading, stats]);

  const card = isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200';
  const divLine = isDark ? 'border-stone-800' : 'border-stone-100';

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border animate-pulse', card)}>
        <div className={cn('px-6 py-4 border-b', divLine)}>
          <div className={cn('h-3 w-36 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
        </div>
        {/* Asymmetric shimmer: 2 tall + 2 smaller */}
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[80, 80, 64, 64].map((h, i) => (
            <div key={i} className={cn('border-r last:border-r-0 p-5', divLine, isDark ? 'border-stone-800' : 'border-stone-100')}>
              <div className={cn('rounded mb-3', isDark ? 'bg-stone-800' : 'bg-stone-100')} style={{ height: 14, width: 14 }} />
              <div className={cn('rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} style={{ height: h * 0.45, width: '60%' }} />
              <div className={cn('rounded mt-1.5', isDark ? 'bg-stone-900' : 'bg-stone-100')} style={{ height: 10, width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Asymmetric stat definitions: first two are "primary" (bigger num), last two "secondary"
  const statItems = [
    { icon: Hash,     label: 'Facts',    value: stats.notable_facts_count,    primary: true  },
    { icon: Brain,    label: 'Topics',   value: stats.topics_count,            primary: true  },
    { icon: Layers,   label: 'Domains',  value: stats.domains_count,           primary: false },
    { icon: Database, label: 'Size',     value: fmtBytes(stats.memory_size_bytes), primary: false },
  ];

  return (
    <div className={cn('rounded-2xl border overflow-hidden', card)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-3.5 border-b', divLine)}>
        <span className={cn('text-xs font-semibold uppercase tracking-[0.12em]', isDark ? 'text-stone-500' : 'text-stone-400')}>
          Memory Overview
        </span>
        <span className={cn('flex items-center gap-1.5 text-xs', isDark ? 'text-stone-700' : 'text-stone-400')}>
          <Clock className="w-3 h-3" />
          {fmtDate(stats.last_updated)}
        </span>
      </div>

      {/* Asymmetric stat grid */}
      <div ref={ref} className={cn('grid grid-cols-2 md:grid-cols-4 divide-x', isDark ? 'divide-stone-800' : 'divide-stone-100')}>
        {statItems.map(({ icon: Icon, label, value, primary }) => (
          <div
            key={label}
            className={cn(
              'flex flex-col justify-between p-5 gap-4',
              primary
                ? (isDark ? 'bg-stone-950' : 'bg-white')
                : (isDark ? 'bg-stone-900/40' : 'bg-stone-50/80')
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isDark ? 'text-stone-600' : 'text-stone-400')} />
            <div>
              <p className={cn(
                'font-bold tracking-tight tabular-nums',
                primary ? 'text-3xl' : 'text-xl',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}>
                {value}
              </p>
              <p className={cn('text-xs mt-0.5 font-medium', isDark ? 'text-stone-600' : 'text-stone-400')}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Status row */}
      <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-1.5 px-6 py-3 border-t', divLine)}>
        {[
          { label: 'Memory active',   active: stats.has_memory },
          { label: 'Preferences set', active: stats.has_preferences },
          { label: 'Has context',     active: stats.has_context },
        ].map(({ label, active }) => (
          <span key={label} className={cn(
            'flex items-center gap-1.5 text-xs',
            active
              ? (isDark ? 'text-stone-300' : 'text-stone-700')
              : (isDark ? 'text-stone-700' : 'text-stone-400')
          )}>
            {active
              ? <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
              : <XCircle className="w-3.5 h-3.5" />}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MemoryStatsCard;
