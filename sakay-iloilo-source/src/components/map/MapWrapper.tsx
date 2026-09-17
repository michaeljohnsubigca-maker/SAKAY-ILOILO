// src/components/map/MapWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { TripOption, LandmarkPOI } from "@/types/transit";

const DynamicLeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
        <span className="text-xs font-semibold">Loading Iloilo Map...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  origin: [number, number] | null;
  destination: [number, number] | null;
  originName?: string;
  destinationName?: string;
  selectedTrip: TripOption | null;
  pois: LandmarkPOI[];
  onSelectPoi?: (poi: LandmarkPOI) => void;
  onMapClick?: (coords: [number, number]) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicLeafletMap {...props} />;
}
