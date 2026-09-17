// src/components/search/FrequentHubs.tsx
import { LandmarkPOI } from "@/types/transit";

interface FrequentHubsProps {
  pois: LandmarkPOI[];
  onSelectHub: (poi: LandmarkPOI) => void;
}

const HUB_IDS = ["poi-sm-city", "poi-cpu", "poi-festive-walk", "poi-jaro-cathedral", "poi-tagbak-terminal", "poi-mohon-terminal"];

export default function FrequentHubs({ pois, onSelectHub }: FrequentHubsProps) {
  const hubs = pois.filter((p) => HUB_IDS.includes(p.id));

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 text-[10px]">
      <span className="text-slate-400 text-[9px] font-bold uppercase shrink-0">Hubs:</span>
      {hubs.map((hub) => (
        <button
          key={hub.id}
          type="button"
          onClick={() => onSelectHub(hub)}
          className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium whitespace-nowrap shadow-xs active:scale-95 transition-all"
        >
          {hub.aliases[0] || hub.name}
        </button>
      ))}
    </div>
  );
}
