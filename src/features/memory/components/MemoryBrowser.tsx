import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronDown, Inbox } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { MemoryDataPayload } from '../../../api/backendApi';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryBrowserProps {
  memoryData: MemoryDataPayload | null;
  isLoading: boolean;
  isDark: boolean;
}

// ─── Date detection & formatting ─────────────────────────────────────────────
const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,          // ISO datetime
  /^\d{4}-\d{2}-\d{2}$/,                        // YYYY-MM-DD
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i, // "Jan 1, 2024"
];

const isDateString = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  return DATE_PATTERNS.some(p => p.test(v.trim()));
};

const fmtDate = (v: string): string => {
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return v;
  }
};

// ─── Smart recursive value renderer ──────────────────────────────────────────
function renderValue(value: unknown, isDark: boolean, depth = 0): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className={cn('text-xs italic', isDark ? 'text-stone-600' : 'text-stone-400')}>None</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className={cn('text-xs italic', isDark ? 'text-stone-600' : 'text-stone-400')}>Empty</span>;

    // Array of primitives → pill tags
    if (value.every(v => typeof v !== 'object' || v === null)) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {value.map((item, i) => {
            const str = String(item);
            const display = isDateString(str) ? fmtDate(str) : str;
            return (
              <span key={i} className={cn(
                'px-2.5 py-0.5 rounded-md text-xs border font-medium',
                isDark ? 'bg-stone-900 border-stone-700 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-700'
              )}>
                {display}
              </span>
            );
          })}
        </div>
      );
    }

    // Array of objects → cards
    return (
      <div className="space-y-2 mt-1.5">
        {value.map((item, i) => (
          <div key={i} className={cn(
            'p-3 rounded-xl border text-xs leading-relaxed',
            isDark ? 'bg-stone-900/60 border-stone-700' : 'bg-stone-50 border-stone-200'
          )}>
            {typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>).map(([k, v]) => {
                  const vStr = String(v);
                  const display = isDateString(vStr) ? fmtDate(vStr) : vStr;
                  return (
                    <div key={k} className="flex gap-2 flex-wrap">
                      <span className={cn('font-semibold shrink-0 capitalize', isDark ? 'text-stone-400' : 'text-stone-500')}>
                        {k.replace(/_/g, ' ')}:
                      </span>
                      <span className={isDark ? 'text-stone-200' : 'text-stone-800'}>{display}</span>
                    </div>
                  );
                })
              : (() => { const s = String(item); return <span className={isDark ? 'text-stone-200' : 'text-stone-800'}>{isDateString(s) ? fmtDate(s) : s}</span>; })()}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0)
      return <span className={cn('text-xs italic', isDark ? 'text-stone-600' : 'text-stone-400')}>Empty</span>;
    return (
      <div className={cn('space-y-2 mt-1.5', depth > 0 ? 'pl-3 border-l' : '', isDark ? 'border-stone-700' : 'border-stone-200')}>
        {entries.map(([k, v]) => {
          const isScalar = typeof v !== 'object' || v === null;
          const vStr = isScalar ? String(v) : '';
          const display = isScalar ? (isDateString(vStr) ? fmtDate(vStr) : vStr) : null;
          return (
            <div key={k} className={cn(isScalar ? 'flex gap-2 flex-wrap items-baseline' : 'flex flex-col gap-1')}>
              <span className={cn('text-xs font-semibold capitalize shrink-0', isDark ? 'text-stone-400' : 'text-stone-500')}>
                {k.replace(/_/g, ' ')}
              </span>
              {isScalar
                ? <span className={cn('text-sm', isDark ? 'text-stone-200' : 'text-stone-800')}>{display}</span>
                : <div className="pl-1">{renderValue(v, isDark, depth + 1)}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <span className={cn(
        'px-2.5 py-0.5 rounded-md text-xs border font-medium',
        value
          ? (isDark ? 'bg-stone-800 border-stone-700 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-700')
          : (isDark ? 'bg-stone-900 border-stone-800 text-stone-600' : 'bg-stone-100 border-stone-200 text-stone-400')
      )}>
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  if (isDateString(value)) {
    return <span className={cn('text-sm', isDark ? 'text-stone-300' : 'text-stone-700')}>{fmtDate(String(value))}</span>;
  }

  return <span className={cn('text-sm', isDark ? 'text-stone-200' : 'text-stone-800')}>{String(value)}</span>;
}

// Humanize snake_case
const humanize = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ─── Pretty .txt export ───────────────────────────────────────────────────────
const buildTextExport = (data: MemoryDataPayload): string => {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const line = '─'.repeat(52);
  const doubleLine = '═'.repeat(52);

  const serialize = (value: unknown, indent = 0): string => {
    const pad = '  '.repeat(indent);
    if (value === null || value === undefined) return `${pad}None`;
    if (Array.isArray(value)) {
      if (value.length === 0) return `${pad}(empty)`;
      return value.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          const pairs = Object.entries(item as Record<string, unknown>)
            .map(([k, v]) => {
              const vStr = String(v);
              const display = isDateString(vStr) ? fmtDate(vStr) : vStr;
              return `${pad}  ${k.replace(/_/g, ' ')}: ${display}`;
            }).join('\n');
          return `${pad}[${i + 1}]\n${pairs}`;
        }
        const s = String(item);
        return `${pad}  • ${isDateString(s) ? fmtDate(s) : s}`;
      }).join('\n');
    }
    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => {
          const vStr = typeof v !== 'object' ? String(v) : '';
          const label = `${pad}  ${humanize(k)}:`;
          if (typeof v !== 'object' || v === null) {
            const display = isDateString(vStr) ? fmtDate(vStr) : vStr;
            return `${label} ${display}`;
          }
          return `${label}\n${serialize(v, indent + 2)}`;
        }).join('\n');
    }
    const sv = String(value);
    return `${pad}${isDateString(sv) ? fmtDate(sv) : sv}`;
  };

  const sections = Object.entries(data.memory_data)
    .map(([key, value]) => {
      const title = humanize(key).toUpperCase();
      return `${title}\n${line}\n${serialize(value)}\n`;
    })
    .join('\n');

  return [
    doubleLine,
    '  INTEGRI AI — MEMORY EXPORT',
    `  Exported: ${now}`,
    `  User ID:  ${data.user_id || '—'}`,
    doubleLine,
    '',
    sections,
    line,
    `  End of export · Integri AI`,
    line,
  ].join('\n');
};

// ─── Collapsible section card ─────────────────────────────────────────────────
interface SectionCardProps {
  sectionKey: string;
  label: string;
  value: unknown;
  isDark: boolean;
  searchQuery: string;
  accentClass: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ label, value, isDark, searchQuery, accentClass }) => {
  const [open, setOpen] = useState(true);

  const matches = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return label.toLowerCase().includes(q) || JSON.stringify(value).toLowerCase().includes(q);
  }, [searchQuery, label, value]);

  if (!matches) return null;

  const count = Array.isArray(value) ? value.length : (typeof value === 'object' && value ? Object.keys(value).length : null);

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden',
      isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-white'
    )}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer transition-colors gap-3',
          isDark ? 'hover:bg-stone-900' : 'hover:bg-stone-50'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', accentClass)} />
          <span className={cn('text-sm font-semibold truncate', isDark ? 'text-stone-100' : 'text-stone-800')}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {count !== null && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full border tabular-nums',
              isDark ? 'bg-stone-900 border-stone-700 text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-500'
            )}>
              {count}
            </span>
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className={cn('w-3.5 h-3.5', isDark ? 'text-stone-600' : 'text-stone-400')} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={cn('px-5 pb-5 pt-2 border-t', isDark ? 'border-stone-800' : 'border-stone-100')}>
              {renderValue(value, isDark)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Cycle through subtle accent dots for visual differentiation
const ACCENT_DOTS = [
  'bg-amber-600',
  'bg-stone-500',
  'bg-zinc-500',
  'bg-amber-800',
  'bg-stone-600',
  'bg-yellow-700',
];

// ─── Main Component ───────────────────────────────────────────────────────────
const MemoryBrowser: React.FC<MemoryBrowserProps> = ({ memoryData, isLoading, isDark }) => {
  const [search, setSearch] = useState('');

  const handleDownload = () => {
    if (!memoryData) return;
    const text = buildTextExport(memoryData);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integri-memory-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const base = isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200';

  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border animate-pulse', base)}>
        <div className={cn('px-6 py-4 border-b', isDark ? 'border-stone-800' : 'border-stone-100')}>
          <div className={cn('h-3.5 w-32 rounded', isDark ? 'bg-stone-800' : 'bg-stone-100')} />
        </div>
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={cn('rounded-xl border', isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200')}>
              <div className="px-5 py-3.5 flex justify-between">
                <div className={cn('h-3.5 w-36 rounded', isDark ? 'bg-stone-800' : 'bg-stone-200')} />
                <div className={cn('h-3.5 w-6 rounded', isDark ? 'bg-stone-800' : 'bg-stone-200')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const entries = memoryData?.memory_data ? Object.entries(memoryData.memory_data) : [];
  const hasData = entries.length > 0;

  return (
    <div className={cn('rounded-2xl border', base)}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-6 py-4 border-b',
        isDark ? 'border-stone-800' : 'border-stone-100'
      )}>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-semibold uppercase tracking-widest', isDark ? 'text-stone-400' : 'text-stone-500')}>
            Memory Data
          </span>
          {hasData && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full border tabular-nums',
              isDark ? 'bg-stone-900 border-stone-800 text-stone-600' : 'bg-stone-100 border-stone-200 text-stone-400'
            )}>
              {entries.length} sections
            </span>
          )}
        </div>

        {hasData && (
          <button
            onClick={handleDownload}
            title="Download memory as .txt"
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer',
              isDark
                ? 'border-stone-700 text-stone-400 hover:bg-stone-800 hover:border-stone-600 hover:text-stone-200'
                : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            )}
          >
            <Download className="w-3.5 h-3.5" />
            Export .txt
          </button>
        )}
      </div>

      {/* Metadata strip */}
      {memoryData?.updated_at && (
        <div className={cn(
          'px-6 py-2 border-b text-xs flex items-center gap-3',
          isDark ? 'border-stone-800 text-stone-700' : 'border-stone-50 text-stone-400'
        )}>
          <span>Updated {new Date(memoryData.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          {memoryData.version !== undefined && (
            <>
              <span className={isDark ? 'text-stone-800' : 'text-stone-200'}>·</span>
              <span>Version {memoryData.version}</span>
            </>
          )}
        </div>
      )}

      <div className="p-5">
        {!hasData ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className={cn('p-4 rounded-2xl', isDark ? 'bg-stone-900 border border-stone-800' : 'bg-stone-100')}>
              <Inbox className={cn('w-6 h-6', isDark ? 'text-stone-600' : 'text-stone-400')} />
            </div>
            <p className={cn('text-sm font-medium', isDark ? 'text-stone-500' : 'text-stone-500')}>No memory data yet</p>
            <p className={cn('text-xs max-w-xs leading-relaxed', isDark ? 'text-stone-600' : 'text-stone-400')}>
              This space will fill as you converse with Integri. It learns from context to personalise your experience.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Search */}
            <div className={cn(
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border mb-1',
              isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
            )}>
              <Search className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-stone-600' : 'text-stone-400')} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter memory…"
                className={cn(
                  'flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500',
                  isDark ? 'text-stone-200' : 'text-stone-800'
                )}
              />
            </div>

            {/* Section cards with accent dots */}
            {entries.map(([key, value], idx) => (
              <SectionCard
                key={key}
                sectionKey={key}
                label={humanize(key)}
                value={value}
                isDark={isDark}
                searchQuery={search}
                accentClass={ACCENT_DOTS[idx % ACCENT_DOTS.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryBrowser;
