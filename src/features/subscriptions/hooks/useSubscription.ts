import { useMemo } from "react";
import { useAppSelector } from "../../../hooks/useRedux";
import AVAILABLE_MODELS, { type SubscriptionTier } from "../../../../Constants";

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

export const useSubscription = () => {
  const user = useAppSelector((state) => state.auth.user);
  const tier: SubscriptionTier = user?.subscriptionTier || "free";

  return useMemo(() => {
    const currentLevel = TIER_LEVELS[tier] ?? 0;

    const features = {
      // Pro Features (Pro + Premium)
      advancedModels: currentLevel >= TIER_LEVELS.pro, // GPT-4o, Claude 3.5 Sonnet
      unlimitedHistory: currentLevel >= TIER_LEVELS.pro,
      standardVoice: currentLevel >= TIER_LEVELS.pro,
      standardImageGen: currentLevel >= TIER_LEVELS.pro,
      prioritySupport: currentLevel >= TIER_LEVELS.pro,

      // Premium Features (Premium Only)
      nextGenModels: currentLevel >= TIER_LEVELS.premium, // GPT-5, o1
      realTimeVoice: currentLevel >= TIER_LEVELS.premium, // Ultra-low latency streaming
      hdImageGen: currentLevel >= TIER_LEVELS.premium,
      highLimits: currentLevel >= TIER_LEVELS.premium, // 10x higher limits for knowledge base/files
      betaAccess: currentLevel >= TIER_LEVELS.premium, // Early access to experimental features
    };

    const availableModels = AVAILABLE_MODELS.filter((model) => {
      if (model.isFree) return true;
      if (currentLevel >= TIER_LEVELS.pro && model.isPro) return true;
      if (currentLevel >= TIER_LEVELS.premium && model.isPremium) return true;
      return false;
    });

    return {
      tier,
      isFree: tier === "free",
      isPro: tier === "pro",
      isPremium: tier === "premium",
      isAtLeastPro: currentLevel >= TIER_LEVELS.pro,
      canAccess: (feature: keyof typeof features) => features[feature],
      availableModels,
    };
  }, [tier]);
};
