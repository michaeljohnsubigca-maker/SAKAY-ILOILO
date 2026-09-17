// src/components/search/FrequentHubs.tsx
"use client";

import { useState } from "react";
import { LandmarkPOI } from "@/types/transit";

export type HubCategory = "all" | "school" | "hospital" | "mall" | "terminal" | "plaza";

export interface HubCategoryOption {
  id: HubCategory;
  label: string;
}

export const HUB_CATEGORIES: HubCategoryOption[] = [
  { id: "all", label: "All" },
  { id: "school", label: "🎓 Schools" },
  { id: "hospital", label: "🏥 Hospitals" },
  { id: "mall", label: "🛍️ Malls" },
  { id: "terminal", label: "🚌 Terminals" },
  { id: "plaza", label: "🏛️ Plazas" },
];

export const DEFAULT_HUB_IDS = [
  "poi-sm-city",
  "poi-cpu",
  "poi-festive-walk",
  "poi-jaro-cathedral",
  "poi-tagbak-terminal",
  "poi-mohon-terminal",
];

export function filterHubsByCategory(pois: LandmarkPOI[], category: HubCategory): LandmarkPOI[] {
  if (category === "all") {
    const defaultHubs = pois.filter((p) => DEFAULT_HUB_IDS.includes(p.id));
    return defaultHubs.length > 0 ? defaultHubs : pois.slice(0, 6);
  }
  return pois.filter((p) => p.category === category);
}

export interface FrequentHubsProps {
  pois: LandmarkPOI[];
  onSelectHub: (poi: LandmarkPOI) => void;
  selectedCategory?: HubCategory;
  onSelectCategory?: (category: HubCategory) => void;
  className?: string;
}

export default function FrequentHubs({
  pois,
  onSelectHub,
  selectedCategory: propCategory,
  onSelectCategory,
  className = "",
}: FrequentHubsProps) {
  const [internalCategory, setInternalCategory] = useState<HubCategory>("all");
  const activeCategory = propCategory ?? internalCategory;

  const handleCategoryClick = (cat: HubCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const displayedHubs = filterHubsByCategory(pois, activeCategory);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Category Filter Pills */}
      <div
        role="tablist"
        aria-label="POI Categories"
        className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-0.5"
      >
        {HUB_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filtered Hubs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-[10px] py-0.5">
        <span className="text-slate-400 text-[9px] font-bold uppercase shrink-0">
          {activeCategory === "all" ? "Top Hubs:" : "Hubs:"}
        </span>
        {displayedHubs.map((hub) => (
          <button
            key={hub.id}
            type="button"
            onClick={() => onSelectHub(hub)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-200 text-slate-700 font-medium whitespace-nowrap shadow-xs active:scale-95 transition-all"
          >
            {hub.aliases?.[0] || hub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
