// src/components/brand/SakayLogo.tsx
export default function SakayLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1 shadow-sm shrink-0">
        <svg className="w-full h-full" fill="none" viewBox="0 0 44 44" aria-hidden="true">
          <path d="M22 6C20.3 6 19 7.3 19 9C19 11.2 22 14 22 14C22 14 25 11.2 25 9C25 7.3 23.7 6 22 6Z" fill="#10B981" />
          <path d="M12 16C12 13.8 13.8 12 16 12H28C30.2 12 32 13.8 32 16V24H12V16Z" fill="#FFFFFF" />
          <path d="M10 27H34V31C34 33.2 32.2 35 30 35H14C11.8 35 10 33.2 10 31V27Z" fill="#F59E0B" />
          <circle cx="15" cy="31" fill="#FFFFFF" r="2.5" />
          <circle cx="29" cy="31" fill="#FFFFFF" r="2.5" />
          <rect fill="#1E293B" height="5" rx="1" width="10" x="17" y="15" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-1">
          <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
            Sakay<span className="text-blue-600">Iloilo</span>
          </span>
          <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
            LPTRP
          </span>
        </div>
        <p className="text-[9px] font-bold tracking-wider text-slate-500 uppercase leading-none mt-0.5">
          Iloilo City PUV Guide
        </p>
      </div>
    </div>
  );
}
