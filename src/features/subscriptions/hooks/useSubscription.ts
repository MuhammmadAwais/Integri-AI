import { useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import {
  getAvailableModelsByTier,
  MULTI_CHAT_LIMITS,
  type SubscriptionTier,
} from "../../../../Constants";
import { fetchLimits } from "../../limits/slices/limitsSlice";

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  pro: 2, // Pro is the highest/most superior tier
};

export const useSubscription = () => {
  const user  = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const tier: SubscriptionTier = user?.subscriptionTier || "free";
  const dispatch = useAppDispatch();

  // Fetch limits whenever the token becomes available or changes
  useEffect(() => {
    if (token) {
      dispatch(fetchLimits(token));
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

    const availableModels = getAvailableModelsByTier(tier);
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
      multiChatLimit,
    };
  }, [tier]);
};
