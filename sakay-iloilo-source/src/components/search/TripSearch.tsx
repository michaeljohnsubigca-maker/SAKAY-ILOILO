// src/components/search/TripSearch.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { LandmarkPOI } from "@/types/transit";
import { ArrowUpDown, MapPin, Locate } from "lucide-react";
import FrequentHubs from "./FrequentHubs";

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

export default function TripSearch({
  pois,
  originName,
  destinationName,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  onLocateUser,
}: TripSearchProps) {
  const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeInput) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveInput(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setActiveInput(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeInput]);

  const filteredPois = filterPois(searchQuery, pois);

  const handlePickPoi = (poi: LandmarkPOI) => {
    if (activeInput === "origin") {
      onSelectOrigin(poi.name, poi.location);
    } else if (activeInput === "destination") {
      onSelectDestination(poi.name, poi.location);
    }
    setActiveInput(null);
    setSearchQuery("");
  };

  return (
    <div className="bg-slate-50/95 rounded-xl border border-slate-200/90 p-2.5 shadow-xs relative">
      <div className="flex items-center gap-2">
        {/* Connector Dots */}
        <div className="flex flex-col items-center justify-between py-1.5 shrink-0 self-stretch">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <div className="w-0.5 h-6 bg-slate-300 border-dashed"></div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveInput("origin");
              setSearchQuery("");
            }}
            className="w-full text-left flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs hover:border-blue-400 transition-colors"
          >
            <span className="text-slate-400 text-[10px] font-bold mr-1.5 uppercase">FROM</span>
            <span className="text-slate-800 font-semibold truncate flex-1 text-[11px]">
              {originName || "Choose starting point"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveInput("destination");
              setSearchQuery("");
            }}
            className="w-full text-left flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs hover:border-blue-400 transition-colors"
          >
            <span className="text-slate-400 text-[10px] font-bold mr-1.5 uppercase">TO</span>
            <span className="text-slate-900 font-bold truncate flex-1 text-[11px]">
              {destinationName || "Choose destination"}
            </span>
          </button>
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

      {/* Frequent Hubs Bar */}
      <div className="mt-2 pt-1 border-t border-slate-200/60">
        <FrequentHubs
          pois={pois}
          onSelectHub={(poi) => {
            if (!originName) {
              onSelectOrigin(poi.name, poi.location);
            } else {
              onSelectDestination(poi.name, poi.location);
            }
          }}
        />
      </div>

      {/* Autocomplete Dropdown Modal */}
      {activeInput && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setActiveInput(null)}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Select {activeInput === "origin" ? "Starting Point" : "Destination"}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveInput(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
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
              className="w-full text-xs p-2 mt-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
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
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between text-xs"
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
