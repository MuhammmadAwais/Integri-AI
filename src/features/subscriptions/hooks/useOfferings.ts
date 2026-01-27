import { useState, useEffect } from "react";
import { SubscriptionService, type PlanData } from "../services/subscriptionService";
import { useAppSelector } from "../../../hooks/useRedux";

interface UseOfferingsReturn {
  plans: PlanData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage RevenueCat offerings
 */
export const useOfferings = (): UseOfferingsReturn => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfferings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedPlans = await SubscriptionService.getOfferings(user.id);
      setPlans(fetchedPlans);
    } catch (err) {
      console.error("Error fetching offerings:", err);
      setError(err instanceof Error ? err.message : "Failed to load subscription plans");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, [user?.id]);

  return {
    plans,
    isLoading,
    error,
    refetch: fetchOfferings,
  };
};
