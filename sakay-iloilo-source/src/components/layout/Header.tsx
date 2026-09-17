// src/components/layout/Header.tsx
import SakayLogo from "../brand/SakayLogo";
import { FareCategory } from "@/types/transit";

interface HeaderProps {
  fareCategory: FareCategory;
  onToggleFare: (category: FareCategory) => void;
}

export default function Header({ fareCategory, onToggleFare }: HeaderProps) {
  return (
    <header className="relative z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shadow-sm flex items-center justify-between gap-2">
      <SakayLogo />
      {/* Fare Toggle */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
        <button
          type="button"
          aria-pressed={fareCategory === "regular"}
          onClick={() => onToggleFare("regular")}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            fareCategory === "regular"
              ? "bg-white text-blue-700 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Regular
        </button>
        <button
          type="button"
          aria-pressed={fareCategory === "discounted"}
          onClick={() => onToggleFare("discounted")}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            fareCategory === "discounted"
              ? "bg-white text-blue-700 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Discounted
        </button>
      </div>
    </header>
  );
}
