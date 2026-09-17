// src/app/page.tsx
"use client";

import { useState, useMemo } from "react";
import poisData from "@/data/pois.json";
import routesData from "@/data/routes.json";
import { LandmarkPOI, JeepneyRoute, FareCategory } from "@/types/transit";
import Header from "@/components/layout/Header";
import TripSearch from "@/components/search/TripSearch";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import RouteDirectory from "@/components/directory/RouteDirectory";
import MapWrapper from "@/components/map/MapWrapper";
import { findRoutes } from "@/lib/routing/engine";
import {
  switchTab,
  selectPreviewRoute,
  clearPreviewOnSearch,
  selectTrip,
  ShellState,
  ShellTab,
} from "@/lib/shellState";
import { Compass, Navigation } from "lucide-react";

export default function Home() {
  const pois = poisData as LandmarkPOI[];
  const routes = routesData as JeepneyRoute[];

  // Commuter Shell State Machine: activeTab, previewRoute, selectedTripId
  const [shellState, setShellState] = useState<ShellState>({
    activeTab: "plan",
    previewRoute: null,
    selectedTripId: null,
  });
  const { activeTab, previewRoute, selectedTripId } = shellState;

  // Default demo trip: CPU Gate 1 to SM City
  const defaultCpu = pois.find((p) => p.id === "poi-cpu")!;
  const defaultSm = pois.find((p) => p.id === "poi-sm-city")!;

  const [origin, setOrigin] = useState<[number, number] | null>(defaultCpu.location);
  const [destination, setDestination] = useState<[number, number] | null>(defaultSm.location);
  const [originName, setOriginName] = useState(defaultCpu.name);
  const [destinationName, setDestinationName] = useState(defaultSm.name);
  const [fareCategory, setFareCategory] = useState<FareCategory>("regular");

  // Compute Routes for Trip Planner
  const tripOptions = useMemo(() => {
    if (!origin || !destination) return [];
    return findRoutes(origin, destination, routes, fareCategory);
  }, [origin, destination, routes, fareCategory]);

  // When previewing a route from browse tab, clear selectedTrip so previewRoute displays
  const selectedTrip = useMemo(() => {
    if (previewRoute) return null;
    if (tripOptions.length === 0) return null;
    if (!selectedTripId) return tripOptions[0];
    return tripOptions.find((t) => t.id === selectedTripId) || tripOptions[0];
  }, [tripOptions, selectedTripId, previewRoute]);

  const handleSwap = () => {
    const tempCoords = origin;
    const tempName = originName;
    setOrigin(destination);
    setOriginName(destinationName);
    setDestination(tempCoords);
    setDestinationName(tempName);
    setShellState((prev) => clearPreviewOnSearch(prev));
  };

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigin([pos.coords.latitude, pos.coords.longitude]);
          setOriginName("My Current Location (GPS)");
          setShellState((prev) => clearPreviewOnSearch(prev));
        },
        () => {
          alert("Unable to access current location. Please select a landmark.");
        }
      );
    }
  };

  const handleTabSwitch = (tab: ShellTab) => {
    setShellState((prev) => switchTab(prev, tab));
  };

  const handleSelectRoute = (route: JeepneyRoute) => {
    setShellState((prev) => selectPreviewRoute(prev, route));
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-900">
      {/* LEFT SIDEBAR (Desktop 420px) / TOP HEADER (Mobile) */}
      <div className="w-full lg:w-[420px] h-auto lg:h-full flex flex-col bg-white border-r border-slate-200 shadow-xl z-20 shrink-0">
        <Header fareCategory={fareCategory} onToggleFare={setFareCategory} />

        {/* Dual Tab Switcher Segmented Control (Desktop only - mobile has switcher in bottom sheet) */}
        <div className="hidden lg:block p-2.5 bg-slate-50/90 border-b border-slate-200/80">
          <div
            role="tablist"
            aria-label="Commuter Navigation Mode"
            className="flex p-1 bg-slate-200/70 rounded-xl gap-1 text-xs font-bold"
          >
            <button
              type="button"
              role="tab"
              id="tab-plan"
              aria-selected={activeTab === "plan"}
              aria-controls="panel-plan"
              onClick={() => handleTabSwitch("plan")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "plan"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Plan Trip</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-browse"
              aria-selected={activeTab === "browse"}
              aria-controls="panel-browse"
              onClick={() => handleTabSwitch("browse")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "browse"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Browse Routes ({routes.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        {activeTab === "plan" ? (
          <div
            id="panel-plan"
            role="tabpanel"
            aria-labelledby="tab-plan"
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Search Bar Container */}
            <div className="p-3 border-b border-slate-100">
              <TripSearch
                pois={pois}
                originName={originName}
                destinationName={destinationName}
                onSelectOrigin={(name, coords) => {
                  setOrigin(coords);
                  setOriginName(name);
                  setShellState((prev) => clearPreviewOnSearch(prev));
                }}
                onSelectDestination={(name, coords) => {
                  setDestination(coords);
                  setDestinationName(name);
                  setShellState((prev) => clearPreviewOnSearch(prev));
                }}
                onSwap={handleSwap}
                onLocateUser={handleLocateUser}
              />
            </div>

            {/* Itinerary Results Container (Scrollable) */}
            <div className="hidden lg:block flex-1 overflow-y-auto p-4 hide-scrollbar">
              <NavigationDrawer
                options={tripOptions}
                selectedTrip={selectedTrip}
                onSelectTrip={(t) => {
                  setShellState((prev) => selectTrip(prev, t.id));
                }}
              />
            </div>
          </div>
        ) : (
          <div
            id="panel-browse"
            role="tabpanel"
            aria-labelledby="tab-browse"
            className="hidden lg:flex flex-1 overflow-hidden min-h-0 flex-col"
          >
            <RouteDirectory
              routes={routes}
              selectedRoute={previewRoute}
              onSelectRoute={handleSelectRoute}
            />
          </div>
        )}
      </div>

      {/* RIGHT MAIN MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Desktop Top HUD */}
        <div className="hidden lg:flex absolute top-3 right-3 z-10 items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-map-float border border-slate-200 text-xs font-semibold text-slate-700 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
          <span>Iloilo City LPTRP Network</span>
          {previewRoute ? (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-bold">
                {previewRoute.code}: {previewRoute.name}
              </span>
            </>
          ) : selectedTrip ? (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">
                {selectedTrip.totalDurationMinutes} min (~₱{selectedTrip.totalFare.toFixed(2)})
              </span>
            </>
          ) : null}
        </div>

        <MapWrapper
          origin={origin}
          destination={destination}
          originName={originName}
          destinationName={destinationName}
          selectedTrip={selectedTrip}
          previewRoute={previewRoute}
          pois={pois}
          onMapClick={(coords) => {
            setShellState((prev) => clearPreviewOnSearch(prev));
            if (!origin) {
              setOrigin(coords);
              setOriginName("Selected on Map");
            } else {
              setDestination(coords);
              setDestinationName("Selected on Map");
            }
          }}
        />

        {/* Mobile Bottom Sheet Drawer */}
        <div
          className={`block lg:hidden absolute bottom-0 left-0 right-0 max-h-[60vh] bg-white rounded-t-2xl shadow-sheet border-t border-slate-200 z-30 flex flex-col ${
            activeTab === "browse" ? "overflow-hidden" : ""
          }`}
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />

          {/* Dual Tab Switcher in Mobile Bottom Sheet Header */}
          <div className="px-3 pb-2 shrink-0 border-b border-slate-100">
            <div
              role="tablist"
              aria-label="Mobile Commuter Navigation Mode"
              className="flex p-1 bg-slate-200/70 rounded-xl gap-1 text-xs font-bold"
            >
              <button
                type="button"
                role="tab"
                id="mobile-tab-plan"
                aria-selected={activeTab === "plan"}
                aria-controls="mobile-panel-plan"
                onClick={() => handleTabSwitch("plan")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "plan"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Plan Trip</span>
              </button>
              <button
                type="button"
                role="tab"
                id="mobile-tab-browse"
                aria-selected={activeTab === "browse"}
                aria-controls="mobile-panel-browse"
                onClick={() => handleTabSwitch("browse")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "browse"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Browse Routes ({routes.length})</span>
              </button>
            </div>
          </div>

          {/* Mobile Tab Panels */}
          {activeTab === "plan" ? (
            <div
              id="mobile-panel-plan"
              role="tabpanel"
              aria-labelledby="mobile-tab-plan"
              className="flex-1 overflow-y-auto p-4 pt-2 hide-scrollbar"
            >
              <NavigationDrawer
                options={tripOptions}
                selectedTrip={selectedTrip}
                onSelectTrip={(t) => {
                  setShellState((prev) => selectTrip(prev, t.id));
                }}
              />
            </div>
          ) : (
            <div
              id="mobile-panel-browse"
              role="tabpanel"
              aria-labelledby="mobile-tab-browse"
              className="flex-1 min-h-0 overflow-hidden flex flex-col"
            >
              <RouteDirectory
                routes={routes}
                selectedRoute={previewRoute}
                onSelectRoute={handleSelectRoute}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
