// src/components/directory/RouteDirectory.tsx
"use client";

import { useState, useMemo } from "react";
import { JeepneyRoute } from "@/types/transit";
import defaultRoutes from "@/data/routes.json";
import { isAmberColor } from "@/components/itinerary/RouteCard";
import {
  Search,
  X,
  Clock,
  Banknote,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Compass,
} from "lucide-react";

export type RouteTypeFilter = "all" | "modern" | "traditional";

export interface RouteDirectoryProps {
  routes?: JeepneyRoute[];
  selectedRoute?: JeepneyRoute | null;
  onSelectRoute?: (route: JeepneyRoute) => void;
  className?: string;
}

export function formatOperatingHours(hours?: { firstTrip: string; lastTrip: string }): string {
  if (!hours) return "05:00 - 22:00";
  return `${hours.firstTrip} - ${hours.lastTrip}`;
}

export function formatFareInfo(fare?: JeepneyRoute["fare"]): string {
  if (!fare) return "₱15.00 base • +₱2.00/km";
  return `₱${fare.baseFareRegular.toFixed(2)} base (${fare.baseKm} km) • +₱${fare.perKmRegular.toFixed(2)}/km`;
}

export function getTypeBadgeLabel(type: "modern" | "traditional"): string {
  return type === "modern" ? "Modern PUV" : "Traditional";
}

export function filterRoutes(
  routes: JeepneyRoute[],
  query: string,
  typeFilter: RouteTypeFilter = "all"
): JeepneyRoute[] {
  const cleanQuery = query.trim().toLowerCase();

  return routes.filter((route) => {
    // Type filter
    if (typeFilter !== "all" && route.type !== typeFilter) {
      return false;
    }

    if (!cleanQuery) return true;

    // Match code (e.g. "ROUTE 5" or "5")
    const matchCode = route.code.toLowerCase().includes(cleanQuery);

    // Match name (e.g. "Ungka to City Proper")
    const matchName = route.name.toLowerCase().includes(cleanQuery);

    // Match corridor summary (e.g. "Benigno Aquino", "Mandurriao")
    const matchCorridor = route.corridorSummary
      ? route.corridorSummary.toLowerCase().includes(cleanQuery)
      : false;

    // Match stop names
    const matchStops = route.stops?.some((s) =>
      s.name.toLowerCase().includes(cleanQuery)
    );

    return matchCode || matchName || matchCorridor || matchStops;
  });
}

export default function RouteDirectory({
  routes: propRoutes,
  selectedRoute,
  onSelectRoute,
  className = "",
}: RouteDirectoryProps) {
  const allRoutes = (propRoutes || defaultRoutes) as JeepneyRoute[];
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RouteTypeFilter>("all");
  const [expandedRouteIds, setExpandedRouteIds] = useState<Set<string>>(new Set());

  const filteredRoutes = useMemo(() => {
    return filterRoutes(allRoutes, searchQuery, typeFilter);
  }, [allRoutes, searchQuery, typeFilter]);

  const counts = useMemo(() => {
    return {
      all: allRoutes.length,
      modern: allRoutes.filter((r) => r.type === "modern").length,
      traditional: allRoutes.filter((r) => r.type === "traditional").length,
    };
  }, [allRoutes]);

  const toggleExpand = (routeId: string) => {
    setExpandedRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  return (
    <div className={`flex flex-col h-full bg-white font-body ${className}`}>
      {/* Search Bar & Filter Controls Header */}
      <div className="p-3 border-b border-slate-100 space-y-2.5 bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-xs">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by route, corridor, or street..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 font-medium transition-all outline-none"
            aria-label="Search routes by corridor or street"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            aria-pressed={typeFilter === "all"}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              typeFilter === "all"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span>All Routes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                typeFilter === "all" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("modern")}
            aria-pressed={typeFilter === "modern"}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              typeFilter === "modern"
                ? "bg-[#10b981] text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                typeFilter === "modern" ? "bg-white" : "bg-[#10b981]"
              }`}
            />
            <span>Modern PUV</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                typeFilter === "modern"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-200 text-emerald-900"
              }`}
            >
              {counts.modern}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter("traditional")}
            aria-pressed={typeFilter === "traditional"}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              typeFilter === "traditional"
                ? "bg-[#f59e0b] text-slate-900 shadow-xs font-black"
                : "bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                typeFilter === "traditional" ? "bg-slate-900" : "bg-[#f59e0b]"
              }`}
            />
            <span>Traditional</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                typeFilter === "traditional"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-200 text-amber-950"
              }`}
            >
              {counts.traditional}
            </span>
          </button>
        </div>

        {/* Results Count Line */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
          <span>
            Showing <strong className="text-slate-800">{filteredRoutes.length}</strong> of{" "}
            {allRoutes.length} routes
          </span>
          {(searchQuery || typeFilter !== "all") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Routes List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 hide-scrollbar">
        {filteredRoutes.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 font-sans">No matching routes</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              We couldn't find any LPTRP routes matching &ldquo;{searchQuery}&rdquo;. Try another
              street, terminal, or route code.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Show All Routes
            </button>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isSelected =
              selectedRoute?.id === route.id ||
              selectedRoute?.code === route.code;
            const isExpanded = expandedRouteIds.has(route.id);
            const isAmber = isAmberColor(route.color);

            return (
              <div
                key={route.id}
                role="article"
                aria-current={isSelected ? "true" : undefined}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/50"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Header Row: Badge, Type Chip, Stop Count */}
                <div className="flex items-center justify-between gap-2 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Route Code Badge */}
                    <span
                      style={{ backgroundColor: route.color || "#2563eb" }}
                      className={`text-[11px] font-sans px-2.5 py-0.5 rounded-md shadow-xs ${
                        isAmber ? "text-slate-900 font-black" : "text-white font-black"
                      }`}
                    >
                      {route.code}
                    </span>

                    {/* Type Chip */}
                    {route.type === "modern" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Modern PUV
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Traditional
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400">
                    {route.stops.length} stops
                  </span>
                </div>

                {/* Route Name */}
                <h3 className="font-sans font-bold text-sm text-slate-900 leading-snug mt-0.5">
                  {route.name}
                </h3>

                {/* Metadata Details: Operating Hours & Fare */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-slate-600 mt-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {formatOperatingHours(route.operatingHours)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-600 text-[11px]">
                      {formatFareInfo(route.fare)}
                    </span>
                  </div>
                </div>

                {/* Expandable Corridor Description Toggle */}
                {route.corridorSummary && (
                  <div className="mt-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(route.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`corridor-${route.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>
                        {isExpanded ? "Hide Corridor Details" : "View Corridor & Stops"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div
                        id={`corridor-${route.id}`}
                        className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-2 animate-in fade-in duration-150"
                      >
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                            <Compass className="w-3 h-3 text-blue-600" />
                            <span>Official Corridor Summary</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-body">
                            {route.corridorSummary}
                          </p>
                        </div>

                        {route.stops && route.stops.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                              Key Stops Along Route
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {route.stops.map((stop) => (
                                <span
                                  key={stop.id}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                                    stop.isMajorHub
                                      ? "bg-blue-50 text-blue-800 border-blue-200 font-bold"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {stop.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Inspect Button */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isSelected ? "Inspecting on map" : "Inspect full route"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectRoute?.(route)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs ${
                      isSelected
                        ? "bg-blue-700 text-white ring-2 ring-blue-400"
                        : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isSelected ? "Active on Map" : "Inspect Route"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
