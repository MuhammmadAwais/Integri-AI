// src/features/subscriptions/services/subscriptionService.ts
import { Purchases, type Package, PeriodUnit } from "@revenuecat/purchases-js";
import type { SubscriptionTier } from "../../../../Constants";

// Cache for the configured Purchases instance per user
let configuredPurchasesInstance: ReturnType<typeof Purchases.configure> | null =
  null;
let configuredUserId: string | null = null;

/**
 * Gets or configures the RevenueCat Purchases instance for a user.
 * Reuses the instance if already configured for the same user.
 */
const getPurchasesInstance = (
  userId: string,
): ReturnType<typeof Purchases.configure> => {
  // If already configured for this user, return the instance
  if (configuredPurchasesInstance && configuredUserId === userId) {
    return configuredPurchasesInstance;
  }

  // Configure for the first time or for a different user
  const purchases = Purchases.configure(
    import.meta.env.VITE_REVENUECAT_WEB_API_KEY,
    // "9gFbPzHpfMR9pI33sCr7n23ZndI3",
    userId,
  );

  configuredPurchasesInstance = purchases;
  configuredUserId = userId;

  return purchases;
};

/**
 * Helper function to check if user has free days available
 * Matches Flutter's haveFreeDaysToUseApp() logic
 */
const haveFreeDaysToUseApp = async (userId: string): Promise<boolean> => {
  try {
    // Import Firebase here to avoid circular dependencies
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("../../../app/firebase");

    const userDoc = await getDoc(doc(db, "Users", userId));
    if (!userDoc.exists()) {
      return false;
    }

    const data = userDoc.data();
    // Support both camelCase and snake_case (e.g. from backend/admin)
    const freeDays = (data.freeDays ?? data.free_days) as number | null;
    const freeDayStartDateTime =
      data.freeDayStartDateTime ?? data.free_day_start_date_time;

    if (freeDays === null || freeDays === 0) {
      console.log("[FreeDays] freeDays missing or zero:", freeDays);
      return false;
    }

    if (!freeDayStartDateTime) {
      console.log("[FreeDays] freeDayStartDateTime missing");
      return false;
    }

    // Check if free days period is still valid
    // Handle Firestore Timestamp or Date objects
    let startDate: Date;
    if (freeDayStartDateTime?.toDate) {
      // Firestore Timestamp
      startDate = freeDayStartDateTime.toDate();
    } else if (freeDayStartDateTime instanceof Date) {
      startDate = freeDayStartDateTime;
    } else if (
      typeof freeDayStartDateTime === "string" ||
      typeof freeDayStartDateTime === "number"
    ) {
      startDate = new Date(freeDayStartDateTime);
    } else {
      return false;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + freeDays);
    const now = new Date();
    const stillValid = now < endDate;
    if (!stillValid) {
      console.log(
        "[FreeDays] Period ended - start:",
        startDate.toISOString(),
        "end:",
        endDate.toISOString(),
        "now:",
        now.toISOString()
      );
    }
    return stillValid;
  } catch (error) {
    console.error("Error checking free days:", error);
    return false;
  }
};

/**
 * Plan data structure for UI display
 */
export interface PlanData {
  id: string; // RevenueCat package identifier
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  tier: SubscriptionTier;
  packageType: string;
}

export const SubscriptionService = {
  /**
   * Fetches offerings from RevenueCat and maps them to plan data
   */
  getOfferings: async (userId: string): Promise<PlanData[]> => {
    try {
      const REVENUECAT_ID = import.meta.env.VITE_REVENUECAT_ID;
      const purchases = getPurchasesInstance(userId);

      const offerings = await purchases.getOfferings();
      console.log("Fetched Offerings:", offerings);

      let currentOffering = offerings.current;
      if (!currentOffering && offerings.all[REVENUECAT_ID]) {
        currentOffering = offerings.all[REVENUECAT_ID];
      }
      if (!currentOffering && offerings.all["default"]) {
        currentOffering = offerings.all["default"];
      }

      if (!currentOffering) {
        console.warn("No offering found, returning empty array");
        return [];
      }

      // Map RevenueCat packages to our plan format
      const plans: PlanData[] = currentOffering.availablePackages.map(
        (pkg: Package) => {
          const product = pkg.webBillingProduct || pkg.rcBillingProduct;
          const priceObj = product.price;
          
          // Get currency code from price object
          const currencyCode = priceObj?.currency || "EUR";
          
          // Convert price from micro-units to base currency (e.g., 9990000 micros = 9.99)
          const priceInBaseCurrency = priceObj ? priceObj.amountMicros / 1_000_000 : 0;
          
          // Convert USD to EUR if needed (approximate rate: 1 USD ≈ 0.92 EUR)
          // Update this rate as needed or fetch from an API for accuracy
          const USD_TO_EUR_RATE = 0.92;
          let priceInEuros = priceInBaseCurrency;
          if (currencyCode === "USD") {
            priceInEuros = priceInBaseCurrency * USD_TO_EUR_RATE;
          } else if (currencyCode !== "EUR") {
            // For other currencies, keep as is but log a warning
            console.warn(`Unsupported currency: ${currencyCode}, displaying as-is`);
            priceInEuros = priceInBaseCurrency;
          }
          
          // Determine tier based on package identifier
          let tier: SubscriptionTier = "free";
          const identifier = pkg.identifier.toLowerCase();
          if (identifier.includes("premium")) {
            tier = "premium";
          } else if (identifier.includes("pro")) {
            tier = "pro";
          }

          // Determine billing interval from package identifier or product period
          const identifierLower = identifier;
          const isAnnual = identifierLower.includes("annual") || 
                          identifierLower.includes("yearly") ||
                          identifierLower.includes("year");
          const isMonthly = identifierLower.includes("monthly") || 
                           identifierLower.includes("month");
          
          // Also check product period if available
          const period = product.period;
          // Period has number and unit properties (unit is PeriodUnit enum)
          const periodUnit = period?.unit;
          const isAnnualByPeriod = periodUnit === PeriodUnit.Year;
          const isMonthlyByPeriod = periodUnit === PeriodUnit.Month;

          // Final determination
          const finalIsAnnual = isAnnual || isAnnualByPeriod;
          const finalIsMonthly = isMonthly || isMonthlyByPeriod;

          // Extract plan name from product title or identifier
          const productTitle = product.title || product.displayName || "";
          const name = productTitle || 
                      pkg.identifier
                        .replace(/_/g, " ")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());

          // Use product description if available, otherwise use tier-based description
          const descriptions: Record<SubscriptionTier, string> = {
            free: "Basic AI features",
            pro: "Everything in PREMIUM plus GPT 5.2, GPT 5.1, Claude Haiku 4.5, Gemini 3 Flash, Advanced Voice, HD Image Gen, and more.",
            premium: "Almost all LLMs, no ads, unlimited agents, standard voice and image, PDF chats, and multi chats.",
          };
          const description = product.description || descriptions[tier];

          // Generate features based on tier (per product differentiation)
          const featuresByTier: Record<SubscriptionTier, string[]> = {
            free: ["Basic AI features", "Limited usage"],
            pro: [
              "Everything in PREMIUM",
              "GPT 5.2, GPT 5.1, Claude Haiku 4.5, and Gemini 3 Flash",
              "Advanced Real-time Voice",
              "10x Higher File Limits",
              "HD Image Generation",
              "PDF chats with higher LLMs and OCR",
              "Multi chats with all LLMs",
              "Priority Email Support",
            ],
            premium: [
              "Almost all LLMs",
              "No ads",
              "Unlimited Agents creation",
              "Standard Voice Mode",
              "Standard Image Generation",
              "PDF chats",
              "Multi chats",
            ],
          };

          // Generate button text
          const buttonTexts: Record<SubscriptionTier, { monthly: string; annual: string }> = {
            free: { monthly: "Get Started", annual: "Get Started" },
            pro: { monthly: "Go Pro", annual: "Subscribe Yearly" },
            premium: { monthly: "Go Premium", annual: "Get Premium Yearly" },
          };

          // Calculate monthly and yearly prices
          let priceMonthly = priceInEuros;
          let priceYearly = priceInEuros;
          
          if (finalIsMonthly) {
            priceMonthly = priceInEuros;
            priceYearly = priceInEuros * 12; // Approximate yearly
          } else if (finalIsAnnual) {
            priceYearly = priceInEuros;
            priceMonthly = priceInEuros / 12; // Approximate monthly
          }

          return {
            id: pkg.identifier,
            name: name,
            description: description,
            priceMonthly: Math.round(priceMonthly * 100) / 100, // Round to 2 decimals
            priceYearly: Math.round(priceYearly * 100) / 100,
            features: featuresByTier[tier],
            isPopular: (tier === "premium" && finalIsMonthly) || (tier === "pro" && finalIsAnnual),
            buttonText: finalIsAnnual ? buttonTexts[tier].annual : buttonTexts[tier].monthly,
            tier,
            packageType: pkg.packageType,
          };
        },
      );

      return plans;
    } catch (error) {
      console.error("Error fetching offerings:", error);
      throw error;
    }
  },
  /**
   * Initializes RevenueCat and returns current tier status.
   * Matches Flutter's updatePurchaserStatus() logic:
   * 1. Logs in to RevenueCat
   * 2. Checks activeSubscriptions for pro plans
   * 3. Falls back to premium if other subscriptions exist
   * 4. Checks free days if no subscriptions
   * 5. Defaults to freemium (free)
   */
  syncStatusWithRevenueCat: async (
    userId: string,
  ): Promise<SubscriptionTier> => {
    try {
      const purchases = getPurchasesInstance(userId);

      // Ensure user is logged in (equivalent to Purchases.logIn in Flutter)
      // In JS SDK, configure already handles this, but we can use identifyUser if needed
      // Since we're configuring with userId, this should already be handled

      const customerInfo = await purchases.getCustomerInfo();

      // Check active subscriptions first (matching Flutter logic)
      if (customerInfo.activeSubscriptions.size > 0) {
        const activeSubsArray = Array.from(customerInfo.activeSubscriptions);

        // Check if any subscription is a pro plan
        // Matches: element.contains("monthly_pro") || element.contains("annual_pro")
        //          || element == "annual_pro" || element == "monthly_pro"
        const hasProSubscription = activeSubsArray.some(
          (subId) =>
            subId.includes("monthly_pro") ||
            subId.includes("annual_pro") ||
            subId === "annual_pro" ||
            subId === "monthly_pro",
        );

        if (hasProSubscription) {
          console.log("Pro subscription detected");
          return "pro";
        } else {
          // Other active subscriptions (premium plans)
          console.log("Premium subscription detected");
          return "premium";
        }
      }

      // No active subscriptions - check free days
      const hasFreeDays = await haveFreeDaysToUseApp(userId);
      if (hasFreeDays) {
        console.log("Free days available - granting premium access");
        return "premium";
      }

      // Default to freemium (free)
      console.log("No subscription or free days - defaulting to free");
      return "free";
    } catch (error) {
      console.error("RevenueCat Check Error:", error);
      // When RevenueCat fails (e.g. network, not configured), still honor free days from Firestore
      try {
        const hasFreeDays = await haveFreeDaysToUseApp(userId);
        if (hasFreeDays) {
          console.log("RevenueCat failed but free days available - granting premium access");
          return "premium";
        }
      } catch (freeDaysError) {
        console.error("Free days check failed:", freeDaysError);
      }
      return "free";
    }
  },

  /**
   * Maps our plan IDs to RevenueCat package identifiers
   * RevenueCat identifiers may differ from our display names
   */
  mapPlanIdToRevenueCatIdentifier: (planId: string): string => {
    const mapping: Record<string, string> = {
      "Monthly Pro Subscription": "monthly_pro",
      "Annual Pro Subscription": "annual_pro",
      "Anual Pro Subscription": "annual_pro", // Legacy typo support
      "Monthly Premium Subscription": "monthly_premium",
      "Annual Premium Subscription": "annual_premium",
      "Anual Premium Subscription": "annual_premium", // Legacy typo support
    };

    // Return mapped identifier or original planId if no mapping exists
    return mapping[planId] || planId;
  },

  /**
   * Purchases a specific package (pro/premium monthly/annual)
   */
  purchaseSubscription: async (
    userId: string,
    planId: string,
  ): Promise<SubscriptionTier> => {
    try {
      const REVENUECAT_ID = import.meta.env.VITE_REVENUECAT_ID;
      const purchases = getPurchasesInstance(userId);

      const offerings = await purchases.getOfferings();
      console.log("Offerings:", offerings);

      let currentOffering = offerings.current;
      console.log("Current Offering:", currentOffering);

      if (!currentOffering && offerings.all[REVENUECAT_ID]) {
        currentOffering = offerings.all[REVENUECAT_ID];
      }
      if (!currentOffering && offerings.all["default"]) {
        currentOffering = offerings.all["default"];
      }

      if (!currentOffering) {
        throw new Error(
          "No offerings found. Please check RevenueCat Dashboard.",
        );
      }

      // Map our plan ID to RevenueCat identifier
      const revenueCatIdentifier = SubscriptionService.mapPlanIdToRevenueCatIdentifier(planId);
      
      // Log all available package identifiers for debugging
      console.log("Available Packages:", currentOffering.availablePackages.map((p: Package) => ({
        identifier: p.identifier,
        packageType: p.packageType,
      })));
      console.log("Looking for planId:", planId);
      console.log("Mapped to RevenueCat identifier:", revenueCatIdentifier);

      // Try to find the package - first try mapped identifier, then original planId
      let pkg = currentOffering.availablePackages.find(
        (p: Package) => p.identifier === revenueCatIdentifier,
      );

      // If not found with mapped ID, try original planId (exact match)
      if (!pkg) {
        pkg = currentOffering.availablePackages.find(
          (p: Package) => p.identifier === planId,
        );
      }

      // If not found, try case-insensitive match
      if (!pkg) {
        pkg = currentOffering.availablePackages.find(
          (p: Package) => p.identifier.toLowerCase() === revenueCatIdentifier.toLowerCase() ||
                          p.identifier.toLowerCase() === planId.toLowerCase(),
        );
      }

      // If still not found, try partial match (contains)
      if (!pkg) {
        const searchTerms = [revenueCatIdentifier.toLowerCase(), planId.toLowerCase()];
        pkg = currentOffering.availablePackages.find(
          (p: Package) => {
            const identifierLower = p.identifier.toLowerCase();
            return searchTerms.some(term => 
              identifierLower.includes(term) || term.includes(identifierLower)
            );
          },
        );
      }

      if (!pkg) {
        const availableIds = currentOffering.availablePackages.map((p: Package) => p.identifier).join(", ");
        throw new Error(
          `Plan '${planId}' not found in offering. Available packages: ${availableIds}`,
        );
      }

      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });

      console.log("Purchase completed. Customer Info:", customerInfo);
      console.log(
        "Active Subscriptions:",
        Array.from(customerInfo.activeSubscriptions),
      );

      // Determine the new tier using the same logic as syncStatusWithRevenueCat
      let newTier: SubscriptionTier = "free";

      if (customerInfo.activeSubscriptions.size > 0) {
        const activeSubsArray = Array.from(customerInfo.activeSubscriptions);

        // Check if any subscription is a pro plan
        const hasProSubscription = activeSubsArray.some(
          (subId) =>
            subId.includes("monthly_pro") ||
            subId.includes("annual_pro") ||
            subId === "annual_pro" ||
            subId === "monthly_pro",
        );

        if (hasProSubscription) {
          newTier = "pro";
        } else {
          // Other active subscriptions (premium plans)
          newTier = "premium";
        }
      } else {
        // No active subscriptions after purchase - this shouldn't happen, but handle it
        throw new Error(
          "Purchase completed but no active subscriptions found.",
        );
      }

      return newTier;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === "UserCancelledError") {
        throw new Error("Purchase was cancelled.");
      }
      console.error("Purchase Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Purchase failed";
      throw new Error(errorMessage);
    }
  },
};
