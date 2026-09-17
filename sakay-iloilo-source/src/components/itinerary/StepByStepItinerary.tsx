// src/components/itinerary/StepByStepItinerary.tsx
import { TripOption } from "@/types/transit";
import { formatFare } from "./RouteCard";

export function formatDistanceKm(meters: number): string {
  return (meters / 1000).toFixed(1);
}

interface StepByStepItineraryProps {
  trip: TripOption;
}

export default function StepByStepItinerary({ trip }: StepByStepItineraryProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span className="text-xs font-extrabold text-slate-800">Trip Guidance</span>
          <p className="text-[10px] text-slate-500">
            Total Distance: {formatDistanceKm(trip.totalDistanceMeters)} km • Est. {trip.totalDurationMinutes} mins
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Fare</span>
          <p className="text-base font-black text-emerald-600">{formatFare(trip.totalFare)}</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {trip.legs.map((leg, index) => {
          if (leg.type === "walk") {
            const isTransfer = index > 0 && index < trip.legs.length - 1;
            return (
              <div key={index} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center shrink-0 self-stretch mt-0.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                      isTransfer
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    {isTransfer ? "🔄" : "🚶"}
                  </span>
                  <div className="w-0.5 flex-1 bg-slate-200 my-0.5 min-h-[16px]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800">
                    {isTransfer
                      ? `Transfer: Walk ${leg.distanceMeters}m to ${leg.toName}`
                      : `Walk ${leg.distanceMeters}m to ${leg.toName}`}
                  </p>
                  <p className="text-[10px] text-slate-500">Approx. {leg.durationMinutes} mins</p>
                </div>
              </div>
            );
          }

          if (leg.type === "ride") {
            return (
              <div key={index} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center shrink-0 self-stretch mt-0.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300 shrink-0">
                    🚐
                  </span>
                  <div className="w-0.5 flex-1 bg-slate-200 my-0.5 min-h-[16px]"></div>
                </div>
                <div className="flex-1 min-w-0 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-blue-900">
                      Board {leg.route.code} ({leg.route.name})
                    </p>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                        leg.route.type === "modern"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-amber-500 text-slate-900 font-extrabold"
                      }`}
                    >
                      {leg.route.type === "modern" ? "Modern PUV" : "Traditional"}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-800 font-medium mt-1">
                    Ride {leg.durationMinutes} mins ({formatDistanceKm(leg.distanceMeters)} km) • Fare: {formatFare(leg.fare)}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Board at: <strong className="text-slate-800">{leg.boardStop.name}</strong>
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Alight at: <strong className="text-slate-800">{leg.alightStop.name}</strong>
                  </p>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Arrival Step */}
        <div className="flex items-start gap-2.5">
          <div className="flex flex-col items-center shrink-0 mt-0.5">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-300 shrink-0">
              🏁
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-900">Arrive at Destination</p>
          </div>
        </div>
      </div>
    </div>
  );
}
