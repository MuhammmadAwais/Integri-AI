import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { toast } from 'react-toastify';
import { Brain, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MemoryService } from '../api/backendApi';
import type { MemoryStats, MemoryDataPayload, UserPreferencesPayload } from '../api/backendApi';
import ErrorModal from '../Components/ui/ErrorModal';
import { fetchLimits } from '../features/limits/slices/limitsSlice';

import MemoryStatsCard from '../features/memory/components/MemoryStatsCard';
import PreferencesToggle from '../features/memory/components/PreferencesToggle';
import MemoryBrowser from '../features/memory/components/MemoryBrowser';
import DangerZone from '../features/memory/components/DangerZone';
import LimitsOverviewCard from '../features/limits/components/LimitsOverviewCard';

const PersonalizationPage: React.FC = () => {
  const isDark  = useAppSelector((state: any) => state.theme.isDark);
  const token   = useAppSelector((state: any) => state.auth.accessToken);
  const user    = useAppSelector((state: any) => state.auth.user);
  const userId: string | undefined = user?.id;
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const [stats,       setStats]       = useState<MemoryStats | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesPayload | null>(null);
  const [memoryData,  setMemoryData]  = useState<MemoryDataPayload | null>(null);

  const [isLoadingStats,  setIsLoadingStats]  = useState(true);
  const [isLoadingPrefs,  setIsLoadingPrefs]  = useState(true);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [isUpdating,  setIsUpdating]  = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorModal, setErrorModal] = useState<{ open: boolean; title?: string; message: string }>({
    open: false, message: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated  = useRef(false);

  // GSAP stagger entry
  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;
    hasAnimated.current = true;
    const els = containerRef.current.children;
    gsap.set(els, { y: 20, opacity: 0 });
    gsap.to(els, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.05 });
  }, []);

  // Fetch all endpoints independently + refresh limits
  const fetchData = useCallback(async (silent = false) => {
    if (!token || !userId) {
      console.warn('🧠 [PersonalizationPage] Missing token or userId', { token: !!token, userId });
      return;
    }
    console.log('🧠 [PersonalizationPage] Fetching for userId:', userId);
    if (silent) setIsRefreshing(true);

    // Always re-fetch limits when this page loads / refreshes
    dispatch(fetchLimits(token));

    setIsLoadingStats(true);
    MemoryService.getMemoryStats(token, userId)
      .then(res => setStats(res))
      .catch(err => console.error('Stats:', err?.response?.status, err?.response?.data))
      .finally(() => setIsLoadingStats(false));

    setIsLoadingPrefs(true);
    MemoryService.getPreferences(token)
      .then(res => setPreferences(res))
      .catch(err => console.error('Prefs:', err?.response?.status, err?.response?.data))
      .finally(() => setIsLoadingPrefs(false));

    setIsLoadingMemory(true);
    MemoryService.getMemory(token)
      .then(res => setMemoryData(res))
      .catch(err => console.error('Memory:', err?.response?.status, err?.response?.data))
      .finally(() => { setIsLoadingMemory(false); if (silent) setIsRefreshing(false); });
  }, [token, userId, dispatch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleMemory = async (disable: boolean) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await MemoryService.updatePreferences(token, { disable_memory_extraction: disable });
      setPreferences(prev => ({ ...(prev ?? {}), disable_memory_extraction: disable }));
      toast.success(disable ? 'Memory extraction disabled.' : 'Memory extraction enabled.');
    } catch (error: any) {
      setErrorModal({ open: true, title: 'Update Failed', message: error?.response?.data?.detail ?? error?.message ?? 'Failed to update preferences.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!token || !userId) return;
    setIsDeleting(true);
    try {
      await MemoryService.deleteMemory(token, userId);
      toast.success('Memory cleared successfully.');
      setStats(null);
      setMemoryData(null);
      fetchData(true);
    } catch (error: any) {
      setErrorModal({ open: true, title: 'Deletion Failed', message: error?.response?.data?.detail ?? error?.message ?? 'Failed to delete memory.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const bg = isDark ? 'bg-[#07060A]' : 'bg-zinc-50';
  const divider = isDark ? 'border-zinc-800' : 'border-zinc-200';

  return (
    <div className={cn('h-full w-full overflow-y-auto custom-scrollbar', bg)}>
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-10 pb-24">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className={cn('flex items-center gap-1.5 text-xs mb-5 cursor-pointer transition-colors', isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-2xl border', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm')}>
                <Brain className={cn('w-5 h-5', isDark ? 'text-zinc-300' : 'text-zinc-700')} />
              </div>
              <div>
                <h1 className={cn('text-xl font-bold tracking-tight', isDark ? 'text-zinc-100' : 'text-zinc-900')}>
                  Personalization
                </h1>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-zinc-500' : 'text-zinc-400')}>
                  Memory & preferences for your AI experience
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              title="Refresh all data"
              className={cn(
                'p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-40 mt-1',
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-700 shadow-sm'
              )}
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            </button>
          </div>

          {/* Divider */}
          <div className={cn('mt-6 border-b', divider)} />
        </motion.div>

        <ErrorModal
          isOpen={errorModal.open}
          onClose={() => setErrorModal(prev => ({ ...prev, open: false }))}
          title={errorModal.title}
          message={errorModal.message}
        />

        {/* ── Dashboard sections ── */}
        <div ref={containerRef} className="space-y-4">
          <MemoryStatsCard stats={stats} isLoading={isLoadingStats} isDark={isDark} />
          <LimitsOverviewCard isDark={isDark} />
          <PreferencesToggle preferences={preferences} onToggleMemory={handleToggleMemory} isLoading={isLoadingPrefs || isUpdating} isDark={isDark} />
          <MemoryBrowser memoryData={memoryData} isLoading={isLoadingMemory} isDark={isDark} />
          <DangerZone onDeleteMemory={handleDeleteMemory} isLoading={isDeleting} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPage;
