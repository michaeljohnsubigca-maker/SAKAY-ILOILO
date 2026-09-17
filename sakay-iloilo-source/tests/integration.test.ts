// tests/integration.test.ts
import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import poisData from "../src/data/pois.json";
import { findRoutes } from "../src/lib/routing/engine";
import { JeepneyRoute, LandmarkPOI } from "../src/types/transit";

describe("End-to-End Route Planning Flow", () => {
  const routes = routesData as JeepneyRoute[];
  const pois = poisData as LandmarkPOI[];

  it("handles full commuter journey from Mohon Terminal to CPU Jaro", () => {
    const mohon = pois.find((p) => p.id === "poi-mohon-terminal")!;
    const cpu = pois.find((p) => p.id === "poi-cpu")!;

    const results = findRoutes(mohon.location, cpu.location, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const fastest = results[0];
    expect(fastest.totalFare).toBeGreaterThan(15.0);
    expect(fastest.totalDurationMinutes).toBeGreaterThan(15);
  });

  it("applies discounted fare rates end-to-end", () => {
    const mohon = pois.find((p) => p.id === "poi-mohon-terminal")!;
    const cpu = pois.find((p) => p.id === "poi-cpu")!;

    const regularResults = findRoutes(mohon.location, cpu.location, routes, "regular");
    const discountedResults = findRoutes(mohon.location, cpu.location, routes, "discounted");

    expect(regularResults.length).toBeGreaterThan(0);
    expect(discountedResults.length).toBeGreaterThan(0);
    expect(discountedResults[0].totalFare).toBeLessThan(regularResults[0].totalFare);
  });

  it("handles default initial route from CPU to SM City", () => {
    const cpu = pois.find((p) => p.id === "poi-cpu")!;
    const sm = pois.find((p) => p.id === "poi-sm-city")!;

    const results = findRoutes(cpu.location, sm.location, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const trip = results[0];
    expect(trip.legs.length).toBeGreaterThan(0);
    const rideLegs = trip.legs.filter((l) => l.type === "ride");
    expect(rideLegs.length).toBeGreaterThan(0);
  });

  it("returns empty or graceful result when coordinates are identical or out of transit bounds", () => {
    const results = findRoutes([0, 0], [0, 0], routes, "regular");
    expect(results).toEqual([]);
  });
});
