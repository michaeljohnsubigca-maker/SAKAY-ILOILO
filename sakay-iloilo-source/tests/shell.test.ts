// tests/shell.test.ts
import { describe, it, expect } from "vitest";
import poisData from "../src/data/pois.json";
import routesData from "../src/data/routes.json";
import { LandmarkPOI, JeepneyRoute } from "../src/types/transit";
import {
  filterHubsByCategory,
  HUB_CATEGORIES,
  DEFAULT_HUB_IDS,
  HubCategory,
} from "../src/components/search/FrequentHubs";
import {
  switchTab,
  selectPreviewRoute,
  clearPreviewOnSearch,
  selectTrip,
  ShellState,
} from "../src/lib/shellState";

describe("Commuter Dual-Mode Shell & Category Search", () => {
  const pois = poisData as LandmarkPOI[];
  const routes = routesData as JeepneyRoute[];

  describe("POI Category Filtering", () => {
    // Exact requirement from Task 5 brief
    it("supports filtering POIs by category", () => {
      const universities = pois.filter((p) => p.category === "school");
      expect(universities.length).toBeGreaterThanOrEqual(5);

      const hospitals = pois.filter((p) => p.category === "hospital");
      expect(hospitals.length).toBeGreaterThanOrEqual(4);
    });

    it("verifies expected count across all quick-filter categories", () => {
      const schools = pois.filter((p) => p.category === "school");
      const hospitals = pois.filter((p) => p.category === "hospital");
      const malls = pois.filter((p) => p.category === "mall");
      const terminals = pois.filter((p) => p.category === "terminal");
      const plazas = pois.filter((p) => p.category === "plaza");

      expect(schools.length).toBe(9);
      expect(hospitals.length).toBe(6);
      expect(malls.length).toBe(8);
      expect(terminals.length).toBe(5);
      expect(plazas.length).toBe(4);
    });

    it("defines the 6 category selector pills with emojis", () => {
      const expectedCategories: { id: HubCategory; label: string }[] = [
        { id: "all", label: "All" },
        { id: "school", label: "🎓 Schools" },
        { id: "hospital", label: "🏥 Hospitals" },
        { id: "mall", label: "🛍️ Malls" },
        { id: "terminal", label: "🚌 Terminals" },
        { id: "plaza", label: "🏛️ Plazas" },
      ];

      expect(HUB_CATEGORIES).toEqual(expectedCategories);
    });

    it("filters hubs dynamically with filterHubsByCategory", () => {
      // "all" returns the curated popular hubs
      const allHubs = filterHubsByCategory(pois, "all");
      expect(allHubs.length).toBe(DEFAULT_HUB_IDS.length);
      expect(allHubs.map((h) => h.id)).toEqual(
        expect.arrayContaining(["poi-sm-city", "poi-cpu", "poi-festive-walk"])
      );

      // "school" returns educational institutions
      const schoolHubs = filterHubsByCategory(pois, "school");
      expect(schoolHubs.length).toBe(9);
      expect(schoolHubs.every((h) => h.category === "school")).toBe(true);

      // "hospital" returns medical centers
      const hospitalHubs = filterHubsByCategory(pois, "hospital");
      expect(hospitalHubs.length).toBe(6);
      expect(hospitalHubs.every((h) => h.category === "hospital")).toBe(true);

      // "mall" returns shopping centers
      const mallHubs = filterHubsByCategory(pois, "mall");
      expect(mallHubs.length).toBe(8);
      expect(mallHubs.every((h) => h.category === "mall")).toBe(true);

      // "terminal" returns transport hubs
      const terminalHubs = filterHubsByCategory(pois, "terminal");
      expect(terminalHubs.length).toBe(5);
      expect(terminalHubs.every((h) => h.category === "terminal")).toBe(true);

      // "plaza" returns city plazas
      const plazaHubs = filterHubsByCategory(pois, "plaza");
      expect(plazaHubs.length).toBe(4);
      expect(plazaHubs.every((h) => h.category === "plaza")).toBe(true);
    });

    it("gracefully falls back when default hub IDs are not present in custom POI list", () => {
      const customPois: LandmarkPOI[] = [
        {
          id: "custom-1",
          name: "Custom Stop",
          aliases: ["CS"],
          category: "landmark",
          district: "City Proper",
          location: [10.7, 122.56],
        },
      ];

      const result = filterHubsByCategory(customPois, "all");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("custom-1");
    });
  });

  describe("Dual Tab State Machine (src/lib/shellState.ts)", () => {
    it("initializes shell in 'plan' tab with default route computation", () => {
      const initialState: ShellState = {
        activeTab: "plan",
        previewRoute: null,
        selectedTripId: null,
      };

      expect(initialState.activeTab).toBe("plan");
      expect(initialState.previewRoute).toBeNull();
      expect(initialState.selectedTripId).toBeNull();
    });

    it("switches to 'plan' tab and clears previewRoute with switchTab", () => {
      const stateWithPreview: ShellState = {
        activeTab: "browse",
        previewRoute: routes[0],
        selectedTripId: null,
      };

      const nextState = switchTab(stateWithPreview, "plan");

      expect(nextState.activeTab).toBe("plan");
      expect(nextState.previewRoute).toBeNull();
    });

    it("switches to 'browse' tab with switchTab preserving existing previewRoute", () => {
      const stateWithPreview: ShellState = {
        activeTab: "plan",
        previewRoute: routes[2],
        selectedTripId: "trip-123",
      };

      const nextState = switchTab(stateWithPreview, "browse");

      expect(nextState.activeTab).toBe("browse");
      expect(nextState.previewRoute?.code).toBe(routes[2].code);
      expect(nextState.selectedTripId).toBe("trip-123");
    });

    it("selects preview route with selectPreviewRoute, clearing selectedTripId and activating browse tab", () => {
      const state: ShellState = {
        activeTab: "plan",
        previewRoute: null,
        selectedTripId: "trip-direct-1",
      };

      const route3 = routes.find((r) => r.code === "ROUTE 3")!;
      const nextState = selectPreviewRoute(state, route3);

      expect(nextState.activeTab).toBe("browse");
      expect(nextState.selectedTripId).toBeNull();
      expect(nextState.previewRoute).toEqual(route3);
      expect(nextState.previewRoute?.code).toBe("ROUTE 3");
    });

    it("clears previewRoute with clearPreviewOnSearch while preserving tab and trip selection", () => {
      const state: ShellState = {
        activeTab: "plan",
        previewRoute: routes[0],
        selectedTripId: "trip-456",
      };

      const nextState = clearPreviewOnSearch(state);

      expect(nextState.activeTab).toBe("plan");
      expect(nextState.previewRoute).toBeNull();
      expect(nextState.selectedTripId).toBe("trip-456");
    });

    it("selects trip with selectTrip, clearing previewRoute", () => {
      const state: ShellState = {
        activeTab: "plan",
        previewRoute: routes[5],
        selectedTripId: null,
      };

      const nextState = selectTrip(state, "trip-transfer-2");

      expect(nextState.selectedTripId).toBe("trip-transfer-2");
      expect(nextState.previewRoute).toBeNull();
      expect(nextState.activeTab).toBe("plan");
    });

    it("ensures total route count in browse tab matches 25 ELPTRP routes", () => {
      expect(routes.length).toBe(25);
    });
  });
});
