import { renderHook } from "@testing-library/react";
import { useSubscription } from "./useSubscription";
import { useAppSelector } from "../../../hooks/useRedux";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock useAppSelector
vi.mock("../../../hooks/useRedux", () => ({
  useAppSelector: vi.fn(),
}));

describe("useSubscription Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to free tier when user is null (logged out)", () => {
    (useAppSelector as any).mockReturnValue(null);
    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe("free");
    expect(result.current.isFree).toBe(true);
    expect(result.current.isPro).toBe(false);
    expect(result.current.isPremium).toBe(false);
    expect(result.current.isAtLeastPro).toBe(false);

    // Free users should only see models marked as isFree
    const allFree = result.current.availableModels.every((m) => m.isFree);
    expect(allFree).toBe(true);
  });

  it("correctly identifies pro tier and grants access to pro features", () => {
    (useAppSelector as any).mockReturnValue({ subscriptionTier: "pro" });
    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe("pro");
    expect(result.current.isFree).toBe(false);
    expect(result.current.isPro).toBe(true);
    expect(result.current.isPremium).toBe(false);
    expect(result.current.isAtLeastPro).toBe(true);

    // Pro users should see Free OR Pro models
    const hasProModel = result.current.availableModels.some((m) => m.isPro);
    expect(hasProModel).toBe(true);
    
    // Should verify access to specific features
    expect(result.current.canAccess("advancedModels")).toBe(true);
    expect(result.current.canAccess("nextGenModels")).toBe(false); // Premium only
  });

  it("correctly identifies premium tier and grants access to all features", () => {
    (useAppSelector as any).mockReturnValue({ subscriptionTier: "premium" });
    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe("premium");
    expect(result.current.isPremium).toBe(true);
    expect(result.current.isAtLeastPro).toBe(true);

    // Premium users should see Premium models
    const hasPremiumModel = result.current.availableModels.some((m) => m.isPremium);
    expect(hasPremiumModel).toBe(true);
    expect(result.current.canAccess("nextGenModels")).toBe(true);
  });
});