import { useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import AVAILABLE_MODELS, {
  getAvailableModelsByTier,
  HIDDEN_PICKER_MODEL_IDS,
  MULTI_CHAT_LIMITS,
  resolveAllowedModels,
  type ModelConfig,
  type SubscriptionTier,
} from "../../../../Constants";
import { fetchLimits } from "../../limits/slices/limitsSlice";
import { fetchUserPreferences } from "../../news/slices/userPreferencesSlice";

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  pro: 2, // Pro is the highest/most superior tier
};

export const useSubscription = () => {
  const user  = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const tier: SubscriptionTier = user?.subscriptionTier || "free";
  const limits = useAppSelector((state: any) => state.limits.limits);
  const dispatch = useAppDispatch();

  // Fetch limits and user preferences whenever the token becomes available or changes
  useEffect(() => {
    if (token) {
      dispatch(fetchLimits(token));
      dispatch(fetchUserPreferences(token));
    }
  }, [token, dispatch]);


  return useMemo(() => {
    const currentLevel = TIER_LEVELS[tier] ?? 0;

    const features = {
      // Available from Premium tier and above (Premium + Pro)
      advancedModels: currentLevel >= TIER_LEVELS.premium,
      unlimitedHistory: currentLevel >= TIER_LEVELS.premium,
      standardVoice: currentLevel >= TIER_LEVELS.premium,
      standardImageGen: currentLevel >= TIER_LEVELS.premium,
      prioritySupport: currentLevel >= TIER_LEVELS.premium,

      // Available from Pro tier only (highest tier)
      nextGenModels: currentLevel >= TIER_LEVELS.pro,
      realTimeVoice: currentLevel >= TIER_LEVELS.pro,
      hdImageGen: currentLevel >= TIER_LEVELS.pro,
      highLimits: currentLevel >= TIER_LEVELS.pro,
      betaAccess: currentLevel >= TIER_LEVELS.pro,
    };

    // Same resolution order as the mobile app: the live server list wins, but a
    // list that collapses to a single entry (the /me/limits failure fallback
    // returns just `integri`) is treated as "no real data" and the tier
    // catalog is used instead.
    const allowed: string[] = Array.isArray(limits?.allowed_models)
      ? limits.allowed_models
      : [];
    const availableModels: ModelConfig[] =
      allowed.length > 1
        ? resolveAllowedModels(allowed)
        : (getAvailableModelsByTier(tier) as ModelConfig[]);

    // Everything a picker should list: allowed models first, then catalog
    // models the plan doesn't include (rendered as locked).
    const availableIds = new Set(availableModels.map((m) => m.id));
    const pickerModels: ModelConfig[] = [
      ...availableModels,
      ...(AVAILABLE_MODELS as ModelConfig[]).filter((m) => !availableIds.has(m.id)),
    ].filter((m) => !HIDDEN_PICKER_MODEL_IDS.includes(m.id));
    const multiChatLimit = (tier && MULTI_CHAT_LIMITS[tier]) || MULTI_CHAT_LIMITS.free;

    return {
      tier,
      isFree: tier === "free",
      isPro: tier === "pro",
      isPremium: tier === "premium",
      isAtLeastPremium: currentLevel >= TIER_LEVELS.premium, // premium or pro
      isAtLeastPro: currentLevel >= TIER_LEVELS.pro,         // pro only
      canAccess: (feature: keyof typeof features) => features[feature],
      availableModels,
      pickerModels,
      multiChatLimit,
    };
  }, [tier, limits]);
};
