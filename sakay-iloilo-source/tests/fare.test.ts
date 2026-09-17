import { describe, it, expect } from "vitest";
import { calculateFare } from "../src/lib/routing/fare";

describe("LTFRB Fare Calculation Engine", () => {
  const modernRules = {
    baseFareRegular: 15.0,
    baseFareDiscounted: 12.0,
    perKmRegular: 2.0,
    perKmDiscounted: 1.6,
    baseKm: 4.0,
  };

  it("charges base fare for trips up to 4 km", () => {
    expect(calculateFare(2.5, modernRules, "regular")).toBe(15.0);
    expect(calculateFare(4.0, modernRules, "regular")).toBe(15.0);
    expect(calculateFare(3.0, modernRules, "discounted")).toBe(12.0);
  });

  it("calculates additional fare with ceiling logic for each succeeding km", () => {
    // 5.2 km -> 4km base (15) + ceil(1.2) * 2 = 15 + 4 = 19.0
    expect(calculateFare(5.2, modernRules, "regular")).toBe(19.0);
    // 6.0 km -> 4km base (15) + 2 * 2 = 19.0
    expect(calculateFare(6.0, modernRules, "regular")).toBe(19.0);
    // 6.1 km -> 4km base (15) + 3 * 2 = 21.0
    expect(calculateFare(6.1, modernRules, "regular")).toBe(21.0);
  });

  it("calculates discounted fare accurately", () => {
    // 5.2 km discounted -> 12 + ceil(1.2) * 1.6 = 12 + 3.2 = 15.2
    expect(calculateFare(5.2, modernRules, "discounted")).toBe(15.2);
  });
});
