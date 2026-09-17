// src/components/map/markers.ts

export interface MarkerOptions {
  color?: string;
  isMajorHub?: boolean;
  isTerminal?: boolean;
}

export function getMarkerSvgString(
  type: "origin" | "destination" | "transfer" | "stop",
  label: string,
  options?: MarkerOptions
): string {
  if (type === "origin") {
    return `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" style="background-color: rgba(16, 185, 129, 0.3);"></span>
        <span class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md" style="background-color: #10b981;"></span>
        <div class="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
          ${label}
        </div>
      </div>
    `;
  }
  if (type === "destination") {
    return `
      <div class="relative flex items-center justify-center">
        <span class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold" style="background-color: #dc2626;">🏁</span>
        <div class="absolute bottom-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
          ${label}
        </div>
      </div>
    `;
  }
  if (type === "transfer") {
    return `
      <div class="relative flex items-center justify-center">
        <span class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" style="background-color: #f59e0b;"></span>
        <div class="absolute bottom-4 bg-slate-800 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
          ${label}
        </div>
      </div>
    `;
  }

  // type === "stop"
  const color = options?.color || "#2563eb";
  const isMajor = Boolean(options?.isMajorHub || options?.isTerminal);

  return `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${
        isMajor
          ? `<span class="absolute w-7 h-7 rounded-full opacity-25 animate-ping" style="background-color: ${color};"></span>`
          : ""
      }
      <span class="${
        isMajor ? "w-4 h-4 border-2" : "w-3 h-3 border-2"
      } rounded-full border-white shadow-md transition-transform group-hover:scale-125" style="background-color: ${color};"></span>
      ${
        isMajor
          ? `
        <div class="absolute bottom-5 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none z-10">
          ${label}
        </div>`
          : `
        <div class="absolute bottom-4 bg-slate-900/90 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
          ${label}
        </div>`
      }
    </div>
  `;
}
