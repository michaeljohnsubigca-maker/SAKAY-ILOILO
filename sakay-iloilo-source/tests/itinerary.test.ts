// tests/itinerary.test.ts
import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatFare,
  formatTransferCount,
  getBadgeStyle,
  getBadgeText,
  isAmberColor,
} from "../src/components/itinerary/RouteCard";
import { formatDistanceKm } from "../src/components/itinerary/StepByStepItinerary";

describe("Itinerary Step Formatter", () => {
  it("formats duration into readable string", () => {
    expect(formatDuration(22)).toBe("~22 mins");
  });

  it("formats fare with PHP peso symbol", () => {
    const fare = 15.0;
    expect(`₱${fare.toFixed(2)}`).toBe("₱15.00");
    expect(formatFare(fare)).toBe("₱15.00");
  });

  it("formats transfer counts correctly with plural cases", () => {
    expect(formatTransferCount(0)).toBe("Direct PUV");
    expect(formatTransferCount(1)).toBe("1 Transfer");
    expect(formatTransferCount(2)).toBe("2 Transfers");
    expect(formatTransferCount(3)).toBe("3 Transfers");
  });

  it("detects amber color for contrast adjustment", () => {
    expect(isAmberColor("#f59e0b")).toBe(true);
    expect(isAmberColor("#fea619")).toBe(true);
    expect(isAmberColor("#F59E0B")).toBe(true);
    expect(isAmberColor("#2563eb")).toBe(false);
    expect(isAmberColor(undefined)).toBe(false);
  });

  it("formats distance into km string with 1 decimal", () => {
    expect(formatDistanceKm(1200)).toBe("1.2");
    expect(formatDistanceKm(5678)).toBe("5.7");
  });

  describe("Badge styles and labels", () => {
    it("returns fastest badge and style", () => {
      expect(getBadgeText("fastest")).toBe("⚡ FASTEST");
      expect(getBadgeStyle("fastest")).toContain("bg-emerald-50");
    });

    it("returns fewest transfers badge and style", () => {
      expect(getBadgeText("fewest_transfers")).toBe("🔄 DIRECT");
      expect(getBadgeStyle("fewest_transfers")).toContain("bg-blue-50");
    });

    it("returns alternate badge and style for other categories", () => {
      expect(getBadgeText("longest")).toBe("🛣️ ALTERNATE");
      expect(getBadgeStyle("longest")).toContain("bg-slate-50");
    });
  });
});
