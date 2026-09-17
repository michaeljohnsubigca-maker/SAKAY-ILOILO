import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import poisData from "../src/data/pois.json";
import { JeepneyRoute, LandmarkPOI, Poi, PoiCategory } from "../src/types/transit";

describe("Transit Datasets Integrity", () => {
  it("contains valid POIs within Iloilo City bounding box", () => {
    const pois = poisData as LandmarkPOI[];
    expect(pois.length).toBeGreaterThanOrEqual(10);
    for (const poi of pois) {
      expect(poi.name).toBeTruthy();
      expect(poi.location[0]).toBeGreaterThanOrEqual(10.65);
      expect(poi.location[0]).toBeLessThanOrEqual(10.80);
      expect(poi.location[1]).toBeGreaterThanOrEqual(122.45);
      expect(poi.location[1]).toBeLessThanOrEqual(122.65);
    }
  });

  it("contains valid LPTRP routes with waypoints and stops", () => {
    const routes = routesData as JeepneyRoute[];
    expect(routes.length).toBeGreaterThanOrEqual(5);
    for (const r of routes) {
      expect(r.code).toBeTruthy();
      expect(r.waypoints.length).toBeGreaterThanOrEqual(4);
      expect(r.stops.length).toBeGreaterThanOrEqual(2);
      expect(r.fare.baseFareRegular).toBeGreaterThan(0);
      expect(r.fare.perKmRegular).toBeGreaterThan(0);
    }
  });
});

describe("Expanded POI Dataset", () => {
  it("contains at least 25 categorized landmarks across Iloilo City", () => {
    expect(poisData.length).toBeGreaterThanOrEqual(25);
  });

  it("includes universities, hospitals, malls, terminals, plazas, and markets", () => {
    const categories = new Set(poisData.map((p) => p.category));
    expect(categories.has("school")).toBe(true);
    expect(categories.has("hospital")).toBe(true);
    expect(categories.has("mall")).toBe(true);
    expect(categories.has("terminal")).toBe(true);
    expect(categories.has("plaza")).toBe(true);
    expect(categories.has("market")).toBe(true);
  });

  it("contains CPU, UPV, WVSU, St. Paul Hospital, and Festive Walk Hub", () => {
    const names = poisData.map((p) => p.name.toLowerCase());
    expect(names.some((n) => n.includes("central philippine university"))).toBe(true);
    expect(names.some((n) => n.includes("up visayas"))).toBe(true);
    expect(names.some((n) => n.includes("west visayas state university"))).toBe(true);
    expect(names.some((n) => n.includes("st. paul"))).toBe(true);
    expect(names.some((n) => n.includes("festive walk"))).toBe(true);
  });
});

describe("Transit Types", () => {
  it("supports corridorSummary on JeepneyRoute and PoiCategory on Poi", () => {
    const route: Partial<JeepneyRoute> = {
      corridorSummary: "Ungka Terminal to City Proper via CPU",
    };
    expect(route.corridorSummary).toBe("Ungka Terminal to City Proper via CPU");

    const category: PoiCategory = "school";
    const poi: Poi = {
      id: "test-poi",
      name: "Test University",
      aliases: ["Test"],
      category,
      district: "Jaro",
      location: [10.7, 122.5],
    };
    expect(poi.category).toBe("school");
  });
});

describe("ELPTRP 25 Routes Dataset", () => {
  const routes = routesData as JeepneyRoute[];

  it("contains all 25 official ELPTRP routes", () => {
    expect(routes.length).toBe(25);
    const codes = new Set(routes.map((r) => r.code));
    for (let i = 1; i <= 25; i++) {
      expect(codes.has(`ROUTE ${i}`)).toBe(true);
    }
  });

  it("ensures every route has high-precision road geometry with >50 waypoints", () => {
    for (const route of routes) {
      expect(route.waypoints.length).toBeGreaterThanOrEqual(50);
      expect(route.stops.length).toBeGreaterThanOrEqual(3);
      expect(route.corridorSummary).toBeDefined();
      expect(route.corridorSummary!.length).toBeGreaterThan(10);
    }
  });

  it("ensures all route waypoints and stops lie within the Iloilo City bounding box", () => {
    for (const route of routes) {
      for (const [lat, lng] of route.waypoints) {
        expect(lat).toBeGreaterThanOrEqual(10.65);
        expect(lat).toBeLessThanOrEqual(10.8);
        expect(lng).toBeGreaterThanOrEqual(122.45);
        expect(lng).toBeLessThanOrEqual(122.65);
      }
      for (const stop of route.stops) {
        const [lat, lng] = stop.location;
        expect(lat).toBeGreaterThanOrEqual(10.65);
        expect(lat).toBeLessThanOrEqual(10.8);
        expect(lng).toBeGreaterThanOrEqual(122.45);
        expect(lng).toBeLessThanOrEqual(122.65);
      }
    }
  });
});


