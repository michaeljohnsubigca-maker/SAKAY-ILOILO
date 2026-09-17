import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import { findRoutes } from "../src/lib/routing/engine";
import { JeepneyRoute } from "../src/types/transit";

describe("Transit Routing Engine", () => {
  const routes = routesData as JeepneyRoute[];

  it("finds direct route from CPU to Plaza Libertad (Route 3)", () => {
    const cpu: [number, number] = [10.7314, 122.5539];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    const results = findRoutes(cpu, plazaLibertad, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const direct = results.find((r) => r.transfersCount === 0);
    expect(direct).toBeDefined();
    expect(direct?.legs.some((l) => l.type === "ride" && l.route.code === "ROUTE 3")).toBe(true);
    expect(direct?.totalFare).toBeGreaterThan(0);
    expect(direct?.totalDurationMinutes).toBeGreaterThan(0);
  });

  it("finds multi-hop transfer route from CPU to Festive Walk Mall", () => {
    const cpu: [number, number] = [10.7314, 122.5539];
    const festiveWalk: [number, number] = [10.7186, 122.5453];

    const results = findRoutes(cpu, festiveWalk, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    // Either 1-transfer via SM City or Jaro Plaza
    const transferOption = results.find((r) => r.transfersCount >= 1);
    expect(transferOption).toBeDefined();
    expect(transferOption?.legs.length).toBeGreaterThanOrEqual(3); // Walk + Ride 1 + Transfer/Ride 2 + Walk
  });

  it("identifies fastest and alternate routes", () => {
    const unka: [number, number] = [10.7485, 122.5446];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    const results = findRoutes(unka, plazaLibertad, routes, "regular");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.category === "fastest")).toBe(true);
  });

  it("slices polyline coordinates forward in the direction of commuter travel (reverse route)", () => {
    const plazaLibertad: [number, number] = [10.6928, 122.5714];
    const cpu: [number, number] = [10.7314, 122.5539];

    const results = findRoutes(plazaLibertad, cpu, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const direct = results.find(
      (r) => r.transfersCount === 0 && r.legs.some((l) => l.type === "ride" && l.route.code === "ROUTE 3")
    );
    expect(direct).toBeDefined();

    const rideLeg = direct?.legs.find((l) => l.type === "ride");
    expect(rideLeg).toBeDefined();
    if (rideLeg && rideLeg.type === "ride") {
      const firstCoord = rideLeg.coordinates[0];
      const lastCoord = rideLeg.coordinates[rideLeg.coordinates.length - 1];
      // Commuter boarded at Plaza Libertad and alights at CPU:
      expect(firstCoord[0]).toBeCloseTo(10.6928, 2);
      expect(lastCoord[0]).toBeCloseTo(10.7314, 2);
    }
  });

  it("handles routes with empty stops without crashing", () => {
    const routeWithNoStops: JeepneyRoute = {
      ...routes[0],
      id: "no-stops-route",
      stops: [],
    };
    const cpu: [number, number] = [10.7314, 122.5539];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    expect(() => {
      const results = findRoutes(cpu, plazaLibertad, [routeWithNoStops], "regular");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].legs.some((l) => l.type === "ride")).toBe(true);
    }).not.toThrow();
  });

  it("classifies fastest, fewest_transfers, and longest properly after deduplication", () => {
    const unka: [number, number] = [10.7485, 122.5446];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    const results = findRoutes(unka, plazaLibertad, routes, "regular");
    expect(results.length).toBeGreaterThanOrEqual(2);

    // options[0] should be fastest
    expect(results[0].category).toBe("fastest");

    // Deduplication should ensure all IDs are unique
    const ids = results.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    // Last option should be longest
    expect(results[results.length - 1].category).toBe("longest");
  });
});
