// tests/search.test.ts
import { describe, it, expect } from "vitest";
import poisData from "../src/data/pois.json";
import { LandmarkPOI } from "../src/types/transit";
import { filterPois } from "../src/components/search/TripSearch";

describe("POI Autocomplete Filter", () => {
  const pois = poisData as LandmarkPOI[];

  it("finds Central Philippine University when searching 'CPU'", () => {
    const results = filterPois("CPU", pois);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Central Philippine University");
  });

  it("finds SM City when searching 'Mandurriao' district", () => {
    const results = filterPois("Mandurriao", pois);
    expect(results.some((p) => p.name.includes("SM City"))).toBe(true);
  });

  it("returns empty array when query is empty or whitespace", () => {
    expect(filterPois("", pois)).toEqual([]);
    expect(filterPois("   ", pois)).toEqual([]);
  });

  it("matches POIs by alias case-insensitively", () => {
    const results = filterPois("festive", pois);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.includes("Festive Walk"))).toBe(true);
  });

  it("handles POIs with missing or undefined aliases safely", () => {
    const poiWithoutAliases = {
      id: "poi-custom",
      name: "Custom Test Hub",
      category: "landmark",
      district: "City Proper",
      location: [10.7, 122.56],
    } as unknown as LandmarkPOI;

    expect(() => filterPois("Custom", [poiWithoutAliases])).not.toThrow();
    expect(filterPois("Custom", [poiWithoutAliases])).toHaveLength(1);
    expect(filterPois("Nonexistent", [poiWithoutAliases])).toHaveLength(0);
  });

  it("returns empty array when no landmarks match query", () => {
    const results = filterPois("xyz123nonexistent", pois);
    expect(results).toEqual([]);
  });
});
