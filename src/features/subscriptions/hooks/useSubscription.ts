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
  pro: 1,
  premium: 2,
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
      // Pro Features (Pro + Premium)
      advancedModels: currentLevel >= TIER_LEVELS.pro,
      unlimitedHistory: currentLevel >= TIER_LEVELS.pro,
      standardVoice: currentLevel >= TIER_LEVELS.pro,
      standardImageGen: currentLevel >= TIER_LEVELS.pro,
      prioritySupport: currentLevel >= TIER_LEVELS.pro,

      // Premium Features (Premium Only)
      nextGenModels: currentLevel >= TIER_LEVELS.premium,
      realTimeVoice: currentLevel >= TIER_LEVELS.premium,
      hdImageGen: currentLevel >= TIER_LEVELS.premium,
      highLimits: currentLevel >= TIER_LEVELS.premium,
      betaAccess: currentLevel >= TIER_LEVELS.premium,
    };

    const availableModels = getAvailableModelsByTier(tier);
    const multiChatLimit = (tier && MULTI_CHAT_LIMITS[tier]) || MULTI_CHAT_LIMITS.free;

    return {
      tier,
      isFree: tier === "free",
      isPro: tier === "pro",
      isPremium: tier === "premium",
      isAtLeastPro: currentLevel >= TIER_LEVELS.pro,
      canAccess: (feature: keyof typeof features) => features[feature],
      availableModels,
      multiChatLimit,
    };
  }, [tier]);
};
