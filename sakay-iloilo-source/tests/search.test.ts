// tests/search.test.ts
import { describe, it, expect, vi } from "vitest";
import poisData from "../src/data/pois.json";
import { LandmarkPOI } from "../src/types/transit";
import {
  filterPois,
  handleHubSelection,
  getActiveTargetLabel,
} from "../src/components/search/TripSearch";

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

describe("1-Tap Departure/Arrival Hub Selection in TripSearch", () => {
  const pois = poisData as LandmarkPOI[];
  const cpu = pois.find((p) => p.id === "poi-cpu")!;
  const sm = pois.find((p) => p.id === "poi-sm-city")!;
  const festive = pois.find((p) => p.id === "poi-festive-walk")!;

  it("populates origin when activeInput is 'origin'", () => {
    const onSelectOrigin = vi.fn();
    const onSelectDestination = vi.fn();

    const result = handleHubSelection(cpu, "origin", onSelectOrigin, onSelectDestination);

    expect(result.target).toBe("origin");
    expect(result.name).toBe(cpu.name);
    expect(result.location).toEqual(cpu.location);

    expect(onSelectOrigin).toHaveBeenCalledTimes(1);
    expect(onSelectOrigin).toHaveBeenCalledWith(cpu.name, cpu.location);
    expect(onSelectDestination).not.toHaveBeenCalled();
  });

  it("populates destination when activeInput is 'destination'", () => {
    const onSelectOrigin = vi.fn();
    const onSelectDestination = vi.fn();

    const result = handleHubSelection(sm, "destination", onSelectOrigin, onSelectDestination);

    expect(result.target).toBe("destination");
    expect(result.name).toBe(sm.name);
    expect(result.location).toEqual(sm.location);

    expect(onSelectDestination).toHaveBeenCalledTimes(1);
    expect(onSelectDestination).toHaveBeenCalledWith(sm.name, sm.location);
    expect(onSelectOrigin).not.toHaveBeenCalled();
  });

  it("alternates target selection smoothly between origin and destination", () => {
    let currentOrigin: { name: string; coords: [number, number] } | null = null;
    let currentDestination: { name: string; coords: [number, number] } | null = null;

    const selectOrigin = (name: string, coords: [number, number]) => {
      currentOrigin = { name, coords };
    };
    const selectDestination = (name: string, coords: [number, number]) => {
      currentDestination = { name, coords };
    };

    // 1. Commuter focuses "From" -> sets activeInput = "origin"
    let activeInput: "origin" | "destination" = "origin";
    handleHubSelection(cpu, activeInput, selectOrigin, selectDestination);
    expect(currentOrigin).toEqual({ name: cpu.name, coords: cpu.location });
    expect(currentDestination).toBeNull();

    // 2. Commuter focuses "To" -> sets activeInput = "destination"
    activeInput = "destination";
    handleHubSelection(festive, activeInput, selectOrigin, selectDestination);
    expect(currentDestination).toEqual({ name: festive.name, coords: festive.location });

    // 3. Commuter focuses "From" again to change departure
    activeInput = "origin";
    handleHubSelection(sm, activeInput, selectOrigin, selectDestination);
    expect(currentOrigin).toEqual({ name: sm.name, coords: sm.location });
    // Destination is preserved
    expect(currentDestination).toEqual({ name: festive.name, coords: festive.location });
  });

  it("provides visual indicator labels for departure and destination modes", () => {
    expect(getActiveTargetLabel("origin")).toBe("Setting Departure");
    expect(getActiveTargetLabel("destination")).toBe("Setting Destination");
  });
});
