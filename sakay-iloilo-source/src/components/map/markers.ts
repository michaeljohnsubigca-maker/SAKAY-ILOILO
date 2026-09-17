// src/components/map/markers.ts
export function getMarkerSvgString(
  type: "origin" | "destination" | "transfer",
  label: string
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
  return `
    <div class="relative flex items-center justify-center">
      <span class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" style="background-color: #f59e0b;"></span>
      <div class="absolute bottom-4 bg-slate-800 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
        ${label}
      </div>
    </div>
  `;
}
