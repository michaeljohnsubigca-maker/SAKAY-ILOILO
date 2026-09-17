// tests/directory.test.ts
import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import { JeepneyRoute } from "../src/types/transit";
import {
  filterRoutes,
  formatOperatingHours,
  formatFareInfo,
  getTypeBadgeLabel,
} from "../src/components/directory/RouteDirectory";

describe("Route Directory Filtering", () => {
  const routes = routesData as JeepneyRoute[];

  // Requirement from Task 4 brief
  it("filters routes by keyword (e.g. 'mandurriao')", () => {
    const query = "mandurriao";
    const filtered = routes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        (r.corridorSummary && r.corridorSummary.toLowerCase().includes(query))
    );
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((r) => r.code === "ROUTE 12")).toBe(true);
  });

  describe("filterRoutes helper function", () => {
    it("filters routes by keyword using filterRoutes helper", () => {
      const results = filterRoutes(routes, "mandurriao");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.code === "ROUTE 12")).toBe(true);
    });

    it("filters routes by route code (e.g. 'ROUTE 5')", () => {
      const results = filterRoutes(routes, "ROUTE 5");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe("ROUTE 5");
    });

    it("filters routes by route number (e.g. '25')", () => {
      const results = filterRoutes(routes, "25");
      expect(results.some((r) => r.code === "ROUTE 25")).toBe(true);
    });

    it("filters routes by corridor text / street name (e.g. 'Benigno Aquino')", () => {
      const results = filterRoutes(routes, "Benigno Aquino");
      expect(results.length).toBeGreaterThan(0);
      // Route 3 passes along Benigno Aquino Ave
      expect(results.some((r) => r.code === "ROUTE 3")).toBe(true);
    });

    it("filters routes by stop name (e.g. 'Plaza Libertad')", () => {
      const results = filterRoutes(routes, "Plaza Libertad");
      expect(results.length).toBeGreaterThan(0);
    });

    it("filters routes by type 'modern'", () => {
      const results = filterRoutes(routes, "", "modern");
      expect(results.length).toBe(20);
      expect(results.every((r) => r.type === "modern")).toBe(true);
    });

    it("filters routes by type 'traditional'", () => {
      const results = filterRoutes(routes, "", "traditional");
      expect(results.length).toBe(5);
      expect(results.every((r) => r.type === "traditional")).toBe(true);
    });

    it("returns all 25 routes when type is 'all' and query is empty", () => {
      const results = filterRoutes(routes, "", "all");
      expect(results.length).toBe(25);
    });

    it("combines keyword search and type filter", () => {
      const modernResults = filterRoutes(routes, "jaro", "modern");
      const traditionalResults = filterRoutes(routes, "jaro", "traditional");

      expect(modernResults.every((r) => r.type === "modern")).toBe(true);
      expect(traditionalResults.every((r) => r.type === "traditional")).toBe(true);
    });

    it("trims whitespace and handles case-insensitivity", () => {
      const results1 = filterRoutes(routes, "   unGka   ");
      const results2 = filterRoutes(routes, "ungka");
      expect(results1.length).toBe(results2.length);
      expect(results1.length).toBeGreaterThan(0);
    });

    it("returns empty array when query does not match any route", () => {
      const results = filterRoutes(routes, "nonexistent-query-xyz");
      expect(results).toEqual([]);
    });
  });

  describe("Directory formatting helpers", () => {
    it("formats operating hours string", () => {
      const hours = { firstTrip: "05:00", lastTrip: "22:00" };
      expect(formatOperatingHours(hours)).toBe("05:00 - 22:00");
    });

    it("formats fare information with base fare, base km, and per km", () => {
      const fare = {
        baseFareRegular: 15,
        baseFareDiscounted: 12,
        perKmRegular: 2,
        perKmDiscounted: 1.6,
        baseKm: 4,
      };
      const formatted = formatFareInfo(fare);
      expect(formatted).toContain("₱15.00");
      expect(formatted).toContain("4 km");
      expect(formatted).toContain("₱2.00/km");
    });

    it("returns correct badge label for route types", () => {
      expect(getTypeBadgeLabel("modern")).toBe("Modern PUV");
      expect(getTypeBadgeLabel("traditional")).toBe("Traditional");
    });
  });
});
