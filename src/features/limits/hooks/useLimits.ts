import { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { fetchLimits } from "../slices/limitsSlice";

export const useLimits = () => {
  const limits = useAppSelector((state: any) => state.limits?.limits ?? null);
  const status = useAppSelector((state: any) => state.limits?.status ?? "idle");
  const dispatch = useAppDispatch();

  return useMemo(() => {
    // ── Derived booleans ─────────────────────────────────────────────────────
    // All default to true (permissive) if limits haven't loaded,
    // so a failed fetch never blocks the user.
    const canCreateAgent =
      limits == null ||
      limits.current_agents_count < limits.max_agents;

    const hasRemainingImages =
      limits == null ||
      limits.images_generated_this_month < limits.image_generation_limit;

    const hasRemainingMessages =
      limits == null || !limits.is_daily_limit_reached;

    const isVoiceAvailable =
      limits == null ||
      limits.voice_minutes_used < limits.voice_limit_minutes;

    // ── Formatted reset time ──────────────────────────────────────────────────
    const resetTimeFormatted = limits?.daily_limit_resets_at
      ? new Date(limits.daily_limit_resets_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : null;

    // ── Progress percentages ──────────────────────────────────────────────────
    const messagesPct =
      limits && limits.daily_message_limit > 0
        ? Math.min(100, (limits.daily_messages_used / limits.daily_message_limit) * 100)
        : 0;

    const imagesPct =
      limits && limits.image_generation_limit > 0
        ? Math.min(100, (limits.images_generated_this_month / limits.image_generation_limit) * 100)
        : 0;

    const voicePct =
      limits && limits.voice_limit_minutes > 0
        ? Math.min(100, (limits.voice_minutes_used / limits.voice_limit_minutes) * 100)
        : 0;

    const agentsPct =
      limits && limits.max_agents > 0
        ? Math.min(100, (limits.current_agents_count / limits.max_agents) * 100)
        : 0;

    return {
      limits,
      isLoading: status === "loading",
      isError: status === "error",
      // Feature guards
      canCreateAgent,
      hasRemainingImages,
      hasRemainingMessages,
      isVoiceAvailable,
      // Reset time
      resetTimeFormatted,
      // Progress percentages (0–100)
      messagesPct,
      imagesPct,
      voicePct,
      agentsPct,
      // Refresh trigger
      refresh: (token: string) => dispatch(fetchLimits(token)),
    };
  }, [limits, status, dispatch]);
};
