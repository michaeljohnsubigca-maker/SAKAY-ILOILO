// src/components/itinerary/RouteCard.tsx
import { TripOption, RideLeg } from "@/types/transit";

interface RouteCardProps {
  trip: TripOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function getBadgeStyle(category: TripOption["category"]): string {
  if (category === "fastest") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (category === "fewest_transfers") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function getBadgeText(category: TripOption["category"]): string {
  if (category === "fastest") return "⚡ FASTEST";
  if (category === "fewest_transfers") return "🔄 DIRECT";
  return "🛣️ ALTERNATE";
}

export function formatFare(fare: number): string {
  return `₱${fare.toFixed(2)}`;
}

export function formatTransferCount(count: number): string {
  if (count === 0) return "Direct PUV";
  return count === 1 ? "1 Transfer" : `${count} Transfers`;
}

export function formatDuration(minutes: number): string {
  return `~${minutes} mins`;
}

export function isAmberColor(color?: string): boolean {
  if (!color) return false;
  const c = color.toLowerCase();
  return c === "#f59e0b" || c === "#fea619" || c.startsWith("#f5") || c.startsWith("#fe");
}

export default function RouteCard({ trip, isSelected, onSelect }: RouteCardProps) {
  const rideLegs = trip.legs.filter((l): l is RideLeg => l.type === "ride");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "bg-blue-50/70 border-blue-500 shadow-md ring-1 ring-blue-500"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${getBadgeStyle(trip.category)}`}>
            {getBadgeText(trip.category)}
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {formatTransferCount(trip.transfersCount)}
          </span>
        </div>
        <span className="text-base font-extrabold text-emerald-700">
          {formatFare(trip.totalFare)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 overflow-hidden">
          {rideLegs.map((r, i) => {
            const isAmber = isAmberColor(r.route.color);
            return (
              <div key={i} className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: r.route.color || "#2563eb" }}
                  className={`text-[10px] font-sans px-2 py-0.5 rounded shadow-xs ${
                    isAmber ? "text-slate-900 font-extrabold" : "text-white font-black"
                  }`}
                >
                  {r.route.code}
                </span>
                {i < rideLegs.length - 1 && <span className="text-slate-400 text-xs">➔</span>}
              </div>
            );
          })}
        </div>
        <span className="text-xs font-bold text-slate-800 shrink-0">
          {formatDuration(trip.totalDurationMinutes)}
        </span>
      </div>
    </button>
  );
}
