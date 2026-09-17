// src/components/layout/NavigationDrawer.tsx
"use client";

import { TripOption } from "@/types/transit";
import RouteCard from "../itinerary/RouteCard";
import StepByStepItinerary from "../itinerary/StepByStepItinerary";

interface NavigationDrawerProps {
  options: TripOption[];
  selectedTrip: TripOption | null;
  onSelectTrip: (trip: TripOption) => void;
}

export default function NavigationDrawer({
  options,
  selectedTrip,
  onSelectTrip,
}: NavigationDrawerProps) {
  if (options.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs">
        <p className="font-semibold">Enter your departure and destination above.</p>
        <p className="text-[11px] text-slate-400 mt-1">
          SakayIloilo will find all direct and transfer routes with estimated travel times and fares.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-700">Suggested Routes</span>
          <span className="text-[11px] font-bold text-blue-600">{options.length} found</span>
        </div>
        <div className="space-y-2">
          {options.map((trip) => (
            <RouteCard
              key={trip.id}
              trip={trip}
              isSelected={selectedTrip?.id === trip.id}
              onSelect={() => onSelectTrip(trip)}
            />
          ))}
        </div>
      </div>

      {selectedTrip && <StepByStepItinerary trip={selectedTrip} />}
    </div>
  );
}
