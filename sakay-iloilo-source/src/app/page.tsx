// src/app/page.tsx
"use client";

import { useState, useMemo } from "react";
import poisData from "@/data/pois.json";
import routesData from "@/data/routes.json";
import { LandmarkPOI, JeepneyRoute, FareCategory } from "@/types/transit";
import Header from "@/components/layout/Header";
import TripSearch from "@/components/search/TripSearch";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import MapWrapper from "@/components/map/MapWrapper";
import { findRoutes } from "@/lib/routing/engine";
import { Compass } from "lucide-react";

export default function Home() {
  const pois = poisData as LandmarkPOI[];
  const routes = routesData as JeepneyRoute[];

  // Default demo trip: CPU Gate 1 to SM City
  const defaultCpu = pois.find((p) => p.id === "poi-cpu")!;
  const defaultSm = pois.find((p) => p.id === "poi-sm-city")!;

  const [origin, setOrigin] = useState<[number, number] | null>(defaultCpu.location);
  const [destination, setDestination] = useState<[number, number] | null>(defaultSm.location);
  const [originName, setOriginName] = useState(defaultCpu.name);
  const [destinationName, setDestinationName] = useState(defaultSm.name);
  const [fareCategory, setFareCategory] = useState<FareCategory>("regular");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Compute Routes
  const tripOptions = useMemo(() => {
    if (!origin || !destination) return [];
    return findRoutes(origin, destination, routes, fareCategory);
  }, [origin, destination, routes, fareCategory]);

  const selectedTrip = useMemo(() => {
    if (tripOptions.length === 0) return null;
    if (!selectedTripId) return tripOptions[0];
    return tripOptions.find((t) => t.id === selectedTripId) || tripOptions[0];
  }, [tripOptions, selectedTripId]);

  const handleSwap = () => {
    const tempCoords = origin;
    const tempName = originName;
    setOrigin(destination);
    setOriginName(destinationName);
    setDestination(tempCoords);
    setDestinationName(tempName);
  };

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigin([pos.coords.latitude, pos.coords.longitude]);
          setOriginName("My Current Location (GPS)");
        },
        () => {
          alert("Unable to access current location. Please select a landmark.");
        }
      );
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-900">
      {/* LEFT SIDEBAR (Desktop 420px) / TOP HEADER (Mobile) */}
      <div className="w-full lg:w-[420px] h-auto lg:h-full flex flex-col bg-white border-r border-slate-200 shadow-xl z-20 shrink-0">
        <Header fareCategory={fareCategory} onToggleFare={setFareCategory} />

        {/* Search Bar Container */}
        <div className="p-3 border-b border-slate-100">
          <TripSearch
            pois={pois}
            originName={originName}
            destinationName={destinationName}
            onSelectOrigin={(name, coords) => {
              setOrigin(coords);
              setOriginName(name);
            }}
            onSelectDestination={(name, coords) => {
              setDestination(coords);
              setDestinationName(name);
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
            onSelectTrip={(t) => setSelectedTripId(t.id)}
          />
        </div>
      </div>

      {/* RIGHT MAIN MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Desktop Top HUD */}
        <div className="hidden lg:flex absolute top-3 right-3 z-10 items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-map-float border border-slate-200 text-xs font-semibold text-slate-700 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
          <span>Iloilo City LPTRP Network</span>
          {selectedTrip && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">
                {selectedTrip.totalDurationMinutes} min (~₱{selectedTrip.totalFare.toFixed(2)})
              </span>
            </>
          )}
        </div>

        <MapWrapper
          origin={origin}
          destination={destination}
          originName={originName}
          destinationName={destinationName}
          selectedTrip={selectedTrip}
          pois={pois}
          onMapClick={(coords) => {
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
        <div className="block lg:hidden absolute bottom-0 left-0 right-0 max-h-[50vh] overflow-y-auto bg-white rounded-t-2xl shadow-sheet border-t border-slate-200 p-4 z-30">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
          <NavigationDrawer
            options={tripOptions}
            selectedTrip={selectedTrip}
            onSelectTrip={(t) => setSelectedTripId(t.id)}
          />
        </div>
      </div>
    </div>
  );
}
