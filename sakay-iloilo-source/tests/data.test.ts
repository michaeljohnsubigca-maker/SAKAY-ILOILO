import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import poisData from "../src/data/pois.json";
import { JeepneyRoute, LandmarkPOI } from "../src/types/transit";

describe("Transit Datasets Integrity", () => {
  it("contains valid POIs within Iloilo City bounding box", () => {
    const pois = poisData as LandmarkPOI[];
    expect(pois.length).toBeGreaterThanOrEqual(10);
    for (const poi of pois) {
      expect(poi.name).toBeTruthy();
      expect(poi.location[0]).toBeGreaterThan(10.65);
      expect(poi.location[0]).toBeLessThan(10.78);
      expect(poi.location[1]).toBeGreaterThan(122.50);
      expect(poi.location[1]).toBeLessThan(122.62);
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
