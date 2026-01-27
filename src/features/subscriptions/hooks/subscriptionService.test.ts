import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "../services/subscriptionService";
import { Purchases } from "@revenuecat/purchases-js";

// Mock RevenueCat SDK
vi.mock("@revenuecat/purchases-js", () => ({
  Purchases: {
    configure: vi.fn(),
    isConfigured: vi.fn(),
  },
}));

describe("SubscriptionService", () => {
  const mockPurchasesInstance = {
    getOfferings: vi.fn(),
    getCustomerInfo: vi.fn(),
    purchase: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Purchases.configure to return our mock instance
    (Purchases.configure as any).mockReturnValue(mockPurchasesInstance);
  });

  describe("syncStatusWithRevenueCat", () => {
    it("configures RevenueCat with the correct userId", async () => {
      mockPurchasesInstance.getCustomerInfo.mockResolvedValue({
        entitlements: { active: {} },
      });

      await SubscriptionService.syncStatusWithRevenueCat("test_user_123");

      expect(Purchases.configure).toHaveBeenCalledWith(
        expect.any(String), // API Key
        "test_user_123"     // UserId
      );
    });

    it("returns 'premium' if premium entitlement is active", async () => {
      mockPurchasesInstance.getCustomerInfo.mockResolvedValue({
        entitlements: {
          active: {
            premium: { isActive: true },
          },
        },
      });

      const tier = await SubscriptionService.syncStatusWithRevenueCat("u1");
      expect(tier).toBe("premium");
    });

    it("returns 'pro' if pro entitlement is active", async () => {
      mockPurchasesInstance.getCustomerInfo.mockResolvedValue({
        entitlements: {
          active: {
            pro: { isActive: true },
          },
        },
      });

      const tier = await SubscriptionService.syncStatusWithRevenueCat("u1");
      expect(tier).toBe("pro");
    });

    it("returns 'free' if no relevant entitlements are active", async () => {
      mockPurchasesInstance.getCustomerInfo.mockResolvedValue({
        entitlements: { active: {} },
      });

      const tier = await SubscriptionService.syncStatusWithRevenueCat("u1");
      expect(tier).toBe("free");
    });
  });

  describe("purchaseSubscription", () => {
    it("successfully purchases a package and returns the new tier", async () => {
      const mockPackage = { identifier: "monthly_pro_plan" };
      
      // Mock offerings response
      mockPurchasesInstance.getOfferings.mockResolvedValue({
        current: {
          availablePackages: [mockPackage],
        },
      });

      // Mock purchase response
      mockPurchasesInstance.purchase.mockResolvedValue({
        customerInfo: {
          entitlements: {
            active: {
              pro: { isActive: true },
            },
          },
        },
      });

      const tier = await SubscriptionService.purchaseSubscription("u1", "monthly_pro_plan");

      expect(mockPurchasesInstance.purchase).toHaveBeenCalledWith({ rcPackage: mockPackage });
      expect(tier).toBe("pro");
    });

    it("throws an error if the requested plan is not found in offerings", async () => {
      mockPurchasesInstance.getOfferings.mockResolvedValue({
        current: { availablePackages: [] },
      });

      await expect(
        SubscriptionService.purchaseSubscription("u1", "non_existent_plan")
      ).rejects.toThrow("Plan 'non_existent_plan' not found");
    });
  });
});