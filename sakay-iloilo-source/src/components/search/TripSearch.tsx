// src/components/search/TripSearch.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { LandmarkPOI } from "@/types/transit";
import { ArrowUpDown, MapPin, Locate, Search } from "lucide-react";
import FrequentHubs from "./FrequentHubs";

export type SearchTargetInput = "origin" | "destination";

interface TripSearchProps {
  pois: LandmarkPOI[];
  originName: string;
  destinationName: string;
  onSelectOrigin: (name: string, coords: [number, number]) => void;
  onSelectDestination: (name: string, coords: [number, number]) => void;
  onSwap: () => void;
  onLocateUser: () => void;
}

export function filterPois(query: string, pois: LandmarkPOI[]): LandmarkPOI[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return pois.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.aliases?.some((a) => a.toLowerCase().includes(q)) ||
      p.district.toLowerCase().includes(q)
  );
}

export function handleHubSelection(
  hub: LandmarkPOI,
  activeInput: SearchTargetInput,
  onSelectOrigin: (name: string, coords: [number, number]) => void,
  onSelectDestination: (name: string, coords: [number, number]) => void
): { target: SearchTargetInput; name: string; location: [number, number] } {
  if (activeInput === "origin") {
    onSelectOrigin(hub.name, hub.location);
  } else {
    onSelectDestination(hub.name, hub.location);
  }
  return { target: activeInput, name: hub.name, location: hub.location };
}

export function getActiveTargetLabel(activeInput: SearchTargetInput): string {
  return activeInput === "origin" ? "Setting Departure" : "Setting Destination";
}

export default function TripSearch({
  pois,
  originName,
  destinationName,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  onLocateUser,
}: TripSearchProps) {
  // Track active target input: "origin" | "destination"
  const [activeInput, setActiveInput] = useState<SearchTargetInput>(
    originName ? "destination" : "origin"
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  const filteredPois = filterPois(searchQuery, pois);

  const handlePickPoi = (poi: LandmarkPOI) => {
    handleHubSelection(poi, activeInput, onSelectOrigin, onSelectDestination);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-slate-50/95 rounded-xl border border-slate-200/90 p-2.5 shadow-xs relative">
      <div className="flex items-center gap-2">
        {/* Connector Dots */}
        <div className="flex flex-col items-center justify-between py-1.5 shrink-0 self-stretch">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              activeInput === "origin"
                ? "bg-emerald-500 ring-4 ring-emerald-200 scale-110"
                : "bg-emerald-400 ring-2 ring-emerald-100"
            }`}
          />
          <div className="w-0.5 h-6 bg-slate-300 border-dashed" />
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              activeInput === "destination"
                ? "bg-rose-500 ring-4 ring-rose-200 scale-110"
                : "bg-rose-400 ring-2 ring-rose-100"
            }`}
          />
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-1.5">
          {/* FROM INPUT ROW */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs transition-all ${
              activeInput === "origin"
                ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveInput("origin")}
              onFocus={() => setActiveInput("origin")}
              className="flex items-center flex-1 min-w-0 text-left mr-1 focus:outline-none"
              aria-label="Set departure location as active target"
            >
              <span
                className={`text-[10px] font-extrabold mr-1.5 uppercase shrink-0 ${
                  activeInput === "origin" ? "text-emerald-700 font-black" : "text-slate-400"
                }`}
              >
                FROM
              </span>
              <span className="text-slate-800 font-semibold truncate text-[11px]">
                {originName || "Choose starting point"}
              </span>
            </button>
            <button
              type="button"
              aria-label="Search departure landmarks"
              title="Search all landmarks by name"
              onClick={() => {
                setActiveInput("origin");
                setIsSearchOpen(true);
                setSearchQuery("");
              }}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TO INPUT ROW */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs transition-all ${
              activeInput === "destination"
                ? "bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/30 shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveInput("destination")}
              onFocus={() => setActiveInput("destination")}
              className="flex items-center flex-1 min-w-0 text-left mr-1 focus:outline-none"
              aria-label="Set destination location as active target"
            >
              <span
                className={`text-[10px] font-extrabold mr-1.5 uppercase shrink-0 ${
                  activeInput === "destination" ? "text-rose-700 font-black" : "text-slate-400"
                }`}
              >
                TO
              </span>
              <span className="text-slate-900 font-bold truncate text-[11px]">
                {destinationName || "Choose destination"}
              </span>
            </button>
            <button
              type="button"
              aria-label="Search destination landmarks"
              title="Search all landmarks by name"
              onClick={() => {
                setActiveInput("destination");
                setIsSearchOpen(true);
                setSearchQuery("");
              }}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            aria-label="Swap direction"
            onClick={onSwap}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs text-blue-600 flex items-center justify-center hover:bg-blue-50 active:scale-95 transition-transform"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Locate me"
            onClick={onLocateUser}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs text-emerald-600 flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition-transform"
          >
            <Locate className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Indicator Header & Frequent Hubs Bar */}
      <div className="mt-2 pt-1 border-t border-slate-200/60">
        <div className="flex items-center justify-between pb-1.5 text-[11px]">
          <span className="text-slate-500 font-medium">1-Tap Quick Hubs</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              activeInput === "origin"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                : "bg-rose-100 text-rose-800 border border-rose-300 shadow-xs"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeInput === "origin" ? "bg-emerald-600 animate-pulse" : "bg-rose-600 animate-pulse"
              }`}
            />
            {getActiveTargetLabel(activeInput)}
          </span>
        </div>

        <FrequentHubs
          pois={pois}
          onSelectHub={(poi) => {
            handleHubSelection(poi, activeInput, onSelectOrigin, onSelectDestination);
          }}
        />
      </div>

      {/* Autocomplete Dropdown Modal */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 z-50 max-h-64 overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Select {activeInput === "origin" ? "Starting Point (Departure)" : "Destination"}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              autoFocus
              aria-label="Search landmarks"
              placeholder="Search landmarks (CPU, SM City, Festive, Plazas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-2 mt-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
            />
            <div className="mt-2 space-y-1">
              {searchQuery.trim() && filteredPois.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No landmarks found matching your search
                </div>
              ) : (
                (searchQuery.trim() ? filteredPois : pois.slice(0, 8)).map((poi) => (
                  <button
                    key={poi.id}
                    type="button"
                    onClick={() => handlePickPoi(poi)}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{poi.name}</p>
                      <p className="text-[10px] text-slate-400">{poi.district} • {poi.category}</p>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
