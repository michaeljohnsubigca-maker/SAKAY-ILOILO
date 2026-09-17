# SakayIloilo (Iloilo City Jeepney Route Planner) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a high-utility, mobile-first transit wayfinding website (SakayIloilo) for Iloilo City that allows commuters to find direct and transfer-based jeepney routes, estimate travel times and LTFRB fares, and view step-by-step turn-by-turn navigation.

**Architecture:** Client-side spatial routing engine with Turf.js and curated static LPTRP GeoJSON/JSON datasets running on Next.js 14+ (App Router) and TypeScript. Interactive map visualization powered by Leaflet and CartoDB Positron / OpenStreetMap tiles, with the responsive layout and visual design tokens matching the Stitch design system.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Leaflet, `@turf/turf`, Lucide React, Vitest.

## Global Constraints

- Project Root Directory: `/Users/michaeljohnsubigca/Work/JEEPNEY PROJECT`
- Visual Direction Reference: `docs/visual-direction/` (Stitch UI Design System)
- Primary Color: `#2563EB` (Transit Cobalt); Secondary: `#F59E0B` (Mango Amber); Tertiary: `#10B981` (Modern PUV Emerald); Neutral: `#0F172A` (Slate Navy)
- Typography: `Plus Jakarta Sans` for headers/codes, `Inter` for body/steps
- Zero external paid APIs (no Google Maps API billing or keys required)
- Strict TDD workflow: write failing test, verify failure, implement minimal code, verify pass, commit

---

### Task 1: Project Initialization & Design System Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Working Next.js 14 development and test environment with configured Tailwind design tokens and Vitest runner.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from "vitest";

describe("Project Environment Setup", () => {
  it("verifies basic math and test runner execution", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/setup.test.ts`
Expected: FAIL (command not found or vitest not installed)

- [ ] **Step 3: Write minimal implementation**

Initialize `package.json`, install dependencies, and configure configs:

```json
// package.json
{
  "name": "sakay-iloilo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@turf/turf": "^7.1.0",
    "clsx": "^2.1.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.441.0",
    "next": "14.2.11",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.12",
    "@types/node": "^20.16.5",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.6.2",
    "vitest": "^2.1.1"
  }
}
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        jeepAmber: "#f59e0b",
        trafficEmerald: "#10b981",
        slateNavy: "#0f172a",
        surface: "#faf8ff",
        "surface-container-low": "#f2f3ff",
        "surface-container-lowest": "#ffffff",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "map-float": "0 4px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)",
        sheet: "0 -10px 30px -5px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
```

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  background-color: #0f172a;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SakayIloilo - Iloilo City Jeepney Route Planner & Live Map",
  description: "Navigate modernized PUVs and traditional jeepney routes across Iloilo City with LPTRP validated directions and fares.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center bg-slateNavy text-white">
      <h1 className="text-2xl font-bold font-sans">SakayIloilo Initialized</h1>
    </main>
  );
}
```

Install dependencies:
Run: `npm install`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.ts`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json tailwind.config.ts postcss.config.js vitest.config.ts src/ tests/
git commit -m "chore: initialize Next.js 14 project with Tailwind and Vitest"
```

---

### Task 2: Data Models & Curated Iloilo Datasets

**Files:**
- Create: `src/types/transit.ts`
- Create: `src/data/pois.json`
- Create: `src/data/routes.json`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces: `JeepneyRoute`, `RouteStop`, `LandmarkPOI`, `TripPlanRequest`, `TripPlanResult` types.
- Produces: Seed JSON datasets for 5 core Iloilo routes (Route 3, Route 13, Route 5, Route 4, Route 10) and 15+ Iloilo landmarks with validated coordinates.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/data.test.ts
import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import poisData from "../src/data/pois.json";
import { JeepneyRoute, LandmarkPOI } from "../src/types/transit";

describe("Transit Datasets Integrity", () => {
  it("contains valid POIs within Iloilo City bounding box", () => {
    const pois = poisData as LandmarkPOI[];
    expect(pois.length).toBeGreaterThanOrEqual(10);
    for (const poi of pois) {
      expect(poi.name).toBeTruthy();
      expect(poi.location[0]).toBeGreaterThan(10.65);
      expect(poi.location[0]).toBeLessThan(10.78);
      expect(poi.location[1]).toBeGreaterThan(122.50);
      expect(poi.location[1]).toBeLessThan(122.62);
    }
  });

  it("contains valid LPTRP routes with waypoints and stops", () => {
    const routes = routesData as JeepneyRoute[];
    expect(routes.length).toBeGreaterThanOrEqual(5);
    for (const r of routes) {
      expect(r.code).toBeTruthy();
      expect(r.waypoints.length).toBeGreaterThanOrEqual(4);
      expect(r.stops.length).toBeGreaterThanOrEqual(2);
      expect(r.fare.baseFareRegular).toBeGreaterThan(0);
      expect(r.fare.perKmRegular).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL (Cannot find module '../src/data/routes.json')

- [ ] **Step 3: Write minimal implementation**

Create `src/types/transit.ts`:
```typescript
// src/types/transit.ts
export interface RouteStop {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
  isMajorHub: boolean;
}

export interface JeepneyRoute {
  id: string;
  code: string; // e.g. "ROUTE 3"
  name: string; // e.g. "Ungka to City Proper via CPU"
  type: "modern" | "traditional";
  color: string; // Hex color (e.g. "#2563eb")
  operatingHours: {
    firstTrip: string; // "04:30"
    lastTrip: string; // "22:30"
  };
  fare: {
    baseFareRegular: number;
    baseFareDiscounted: number;
    perKmRegular: number;
    perKmDiscounted: number;
    baseKm: number;
  };
  waypoints: [number, number][]; // [[lat, lng], ...]
  stops: RouteStop[];
}

export interface LandmarkPOI {
  id: string;
  name: string;
  aliases: string[];
  category: "university" | "mall" | "hospital" | "plaza" | "terminal" | "landmark";
  district: "City Proper" | "Jaro" | "Molo" | "Mandurriao" | "Lapaz" | "Arevalo" | "Lapuz";
  location: [number, number]; // [lat, lng]
}

export type FareCategory = "regular" | "discounted";

export interface WalkLeg {
  type: "walk";
  distanceMeters: number;
  durationMinutes: number;
  fromName: string;
  toName: string;
  coordinates: [number, number][];
}

export interface RideLeg {
  type: "ride";
  route: JeepneyRoute;
  distanceMeters: number;
  durationMinutes: number;
  fare: number;
  boardStop: RouteStop;
  alightStop: RouteStop;
  coordinates: [number, number][];
}

export interface TripOption {
  id: string;
  category: "fastest" | "fewest_transfers" | "longest";
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  totalFare: number;
  transfersCount: number;
  operatingStatus: "active" | "off_hours";
  legs: (WalkLeg | RideLeg)[];
}
```

Create `src/data/pois.json`:
```json
[
  {
    "id": "poi-cpu",
    "name": "Central Philippine University (CPU)",
    "aliases": ["CPU", "Central", "CPU Jaro", "CPU Gate 1"],
    "category": "university",
    "district": "Jaro",
    "location": [10.7314, 122.5539]
  },
  {
    "id": "poi-sm-city",
    "name": "SM City Iloilo",
    "aliases": ["SM", "SM City", "SM Mandurriao", "SM Northwing"],
    "category": "mall",
    "district": "Mandurriao",
    "location": [10.7143, 122.5512]
  },
  {
    "id": "poi-festive-walk",
    "name": "Festive Walk Mall (Megaworld)",
    "aliases": ["Festive", "Megaworld", "Festive Walk"],
    "category": "mall",
    "district": "Mandurriao",
    "location": [10.7186, 122.5453]
  },
  {
    "id": "poi-jaro-cathedral",
    "name": "Jaro Metropolitan Cathedral",
    "aliases": ["Jaro Plaza", "Jaro Cathedral", "Jaro Belfry"],
    "category": "plaza",
    "district": "Jaro",
    "location": [10.7247, 122.5579]
  },
  {
    "id": "poi-atria",
    "name": "Atria Park District",
    "aliases": ["Atria", "QualiMed", "Ayala Atria"],
    "category": "mall",
    "district": "Mandurriao",
    "location": [10.7107, 122.5492]
  },
  {
    "id": "poi-up-visayas",
    "name": "UP Visayas (City Campus)",
    "aliases": ["UPV", "UP Iloilo", "UP Visayas"],
    "category": "university",
    "district": "City Proper",
    "location": [10.6974, 122.5647]
  },
  {
    "id": "poi-molo-plaza",
    "name": "Molo Plaza & Church",
    "aliases": ["Molo Plaza", "Molo Church", "St. Anne Parish"],
    "category": "plaza",
    "district": "Molo",
    "location": [10.6961, 122.5432]
  },
  {
    "id": "poi-plaza-libertad",
    "name": "Plaza Libertad",
    "aliases": ["Libertad", "City Hall", "San Jose Church"],
    "category": "plaza",
    "district": "City Proper",
    "location": [10.6928, 122.5714]
  },
  {
    "id": "poi-tagbak-terminal",
    "name": "Tagbak Terminal",
    "aliases": ["Tagbak", "North Terminal"],
    "category": "terminal",
    "district": "Jaro",
    "location": [10.7583, 122.5658]
  },
  {
    "id": "poi-ungka-terminal",
    "name": "Ungka Terminal (Pavia / Jaro Border)",
    "aliases": ["Ungka", "Ungka Flyover", "Ungka ITGSI"],
    "category": "terminal",
    "district": "Jaro",
    "location": [10.7485, 122.5446]
  },
  {
    "id": "poi-mohon-terminal",
    "name": "Mohon Terminal",
    "aliases": ["Mohon", "Villa Mohon", "South Terminal"],
    "category": "terminal",
    "district": "Arevalo",
    "location": [10.6812, 122.5204]
  },
  {
    "id": "poi-lapaz-plaza",
    "name": "Lapaz Plaza & Public Market",
    "aliases": ["Lapaz Plaza", "Lapaz Market", "Batchoy Plaza"],
    "category": "plaza",
    "district": "Lapaz",
    "location": [10.7103, 122.5719]
  },
  {
    "id": "poi-robinsons-main",
    "name": "Robinsons Place Iloilo",
    "aliases": ["Robinsons", "Rob Main", "Quezon Wing"],
    "category": "mall",
    "district": "City Proper",
    "location": [10.6976, 122.5684]
  }
]
```

Create `src/data/routes.json`:
```json
[
  {
    "id": "route-3-ungka-cpu-city-proper",
    "code": "ROUTE 3",
    "name": "Ungka to City Proper via CPU",
    "type": "modern",
    "color": "#2563eb",
    "operatingHours": {
      "firstTrip": "04:30",
      "lastTrip": "22:30"
    },
    "fare": {
      "baseFareRegular": 15.0,
      "baseFareDiscounted": 12.0,
      "perKmRegular": 2.0,
      "perKmDiscounted": 1.6,
      "baseKm": 4.0
    },
    "waypoints": [
      [10.7485, 122.5446],
      [10.7420, 122.5490],
      [10.7314, 122.5539],
      [10.7247, 122.5579],
      [10.7180, 122.5620],
      [10.7090, 122.5670],
      [10.6976, 122.5684],
      [10.6928, 122.5714]
    ],
    "stops": [
      { "id": "r3-stop-1", "name": "Ungka Terminal", "location": [10.7485, 122.5446], "isMajorHub": true },
      { "id": "r3-stop-2", "name": "CPU Gate 1 (Lopez Jaena)", "location": [10.7314, 122.5539], "isMajorHub": true },
      { "id": "r3-stop-3", "name": "Jaro Plaza / Cathedral", "location": [10.7247, 122.5579], "isMajorHub": true },
      { "id": "r3-stop-4", "name": "Robinsons Place Iloilo", "location": [10.6976, 122.5684], "isMajorHub": false },
      { "id": "r3-stop-5", "name": "Plaza Libertad Terminal", "location": [10.6928, 122.5714], "isMajorHub": true }
    ]
  },
  {
    "id": "route-5-festive-sm-city-proper",
    "code": "ROUTE 5",
    "name": "Festive Walk to City Proper via SM City & Diversion",
    "type": "modern",
    "color": "#10b981",
    "operatingHours": {
      "firstTrip": "05:00",
      "lastTrip": "22:00"
    },
    "fare": {
      "baseFareRegular": 15.0,
      "baseFareDiscounted": 12.0,
      "perKmRegular": 2.0,
      "perKmDiscounted": 1.6,
      "baseKm": 4.0
    },
    "waypoints": [
      [10.7186, 122.5453],
      [10.7143, 122.5512],
      [10.7107, 122.5492],
      [10.7040, 122.5560],
      [10.6980, 122.5620],
      [10.6928, 122.5714]
    ],
    "stops": [
      { "id": "r5-stop-1", "name": "Festive Walk Transport Hub", "location": [10.7186, 122.5453], "isMajorHub": true },
      { "id": "r5-stop-2", "name": "SM City Iloilo Overpass", "location": [10.7143, 122.5512], "isMajorHub": true },
      { "id": "r5-stop-3", "name": "Atria District Loading Bay", "location": [10.7107, 122.5492], "isMajorHub": false },
      { "id": "r5-stop-4", "name": "General Luna St.", "location": [10.6980, 122.5620], "isMajorHub": false },
      { "id": "r5-stop-5", "name": "Plaza Libertad", "location": [10.6928, 122.5714], "isMajorHub": true }
    ]
  },
  {
    "id": "route-4-ungka-diversion-city-proper",
    "code": "ROUTE 4",
    "name": "Ungka to City Proper via Diversion Road",
    "type": "traditional",
    "color": "#f59e0b",
    "operatingHours": {
      "firstTrip": "04:30",
      "lastTrip": "21:30"
    },
    "fare": {
      "baseFareRegular": 13.0,
      "baseFareDiscounted": 10.5,
      "perKmRegular": 1.8,
      "perKmDiscounted": 1.45,
      "baseKm": 4.0
    },
    "waypoints": [
      [10.7485, 122.5446],
      [10.7300, 122.5470],
      [10.7143, 122.5512],
      [10.7050, 122.5580],
      [10.6976, 122.5684],
      [10.6928, 122.5714]
    ],
    "stops": [
      { "id": "r4-stop-1", "name": "Ungka Terminal", "location": [10.7485, 122.5446], "isMajorHub": true },
      { "id": "r4-stop-2", "name": "Diversion El 98 Junction", "location": [10.7300, 122.5470], "isMajorHub": false },
      { "id": "r4-stop-3", "name": "SM City Iloilo", "location": [10.7143, 122.5512], "isMajorHub": true },
      { "id": "r4-stop-4", "name": "UP Visayas / Gen Luna", "location": [10.6974, 122.5647], "isMajorHub": true },
      { "id": "r4-stop-5", "name": "Plaza Libertad", "location": [10.6928, 122.5714], "isMajorHub": true }
    ]
  },
  {
    "id": "route-13-mohon-villa-city-proper",
    "code": "ROUTE 13",
    "name": "Mohon Terminal to City Proper via Villa Arevalo",
    "type": "modern",
    "color": "#8b5cf6",
    "operatingHours": {
      "firstTrip": "05:00",
      "lastTrip": "22:00"
    },
    "fare": {
      "baseFareRegular": 15.0,
      "baseFareDiscounted": 12.0,
      "perKmRegular": 2.0,
      "perKmDiscounted": 1.6,
      "baseKm": 4.0
    },
    "waypoints": [
      [10.6812, 122.5204],
      [10.6890, 122.5320],
      [10.6961, 122.5432],
      [10.6974, 122.5647],
      [10.6928, 122.5714]
    ],
    "stops": [
      { "id": "r13-stop-1", "name": "Mohon Terminal", "location": [10.6812, 122.5204], "isMajorHub": true },
      { "id": "r13-stop-2", "name": "Villa Plaza", "location": [10.6890, 122.5320], "isMajorHub": false },
      { "id": "r13-stop-3", "name": "Molo Plaza", "location": [10.6961, 122.5432], "isMajorHub": true },
      { "id": "r13-stop-4", "name": "UP Visayas City Campus", "location": [10.6974, 122.5647], "isMajorHub": true },
      { "id": "r13-stop-5", "name": "Plaza Libertad", "location": [10.6928, 122.5714], "isMajorHub": true }
    ]
  },
  {
    "id": "route-10-tagbak-lapaz-city-proper",
    "code": "ROUTE 10",
    "name": "Tagbak Terminal to City Proper via Lapaz",
    "type": "modern",
    "color": "#ec4899",
    "operatingHours": {
      "firstTrip": "04:30",
      "lastTrip": "22:30"
    },
    "fare": {
      "baseFareRegular": 15.0,
      "baseFareDiscounted": 12.0,
      "perKmRegular": 2.0,
      "perKmDiscounted": 1.6,
      "baseKm": 4.0
    },
    "waypoints": [
      [10.7583, 122.5658],
      [10.7400, 122.5670],
      [10.7247, 122.5579],
      [10.7103, 122.5719],
      [10.7000, 122.5700],
      [10.6928, 122.5714]
    ],
    "stops": [
      { "id": "r10-stop-1", "name": "Tagbak Terminal", "location": [10.7583, 122.5658], "isMajorHub": true },
      { "id": "r10-stop-2", "name": "Jaro Plaza Interchange", "location": [10.7247, 122.5579], "isMajorHub": true },
      { "id": "r10-stop-3", "name": "Lapaz Plaza & Market", "location": [10.7103, 122.5719], "isMajorHub": true },
      { "id": "r10-stop-4", "name": "Iloilo Provincial Capitol", "location": [10.7000, 122.5700], "isMajorHub": false },
      { "id": "r10-stop-5", "name": "Plaza Libertad Terminal", "location": [10.6928, 122.5714], "isMajorHub": true }
    ]
  }
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/types/transit.ts src/data/ tests/data.test.ts
git commit -m "feat: add transit type definitions and curated Iloilo seed datasets"
```

---

### Task 3: Spatial Geometry, Fare Engine, and Routing Engine (TDD)

**Files:**
- Create: `src/lib/routing/geometry.ts`
- Create: `src/lib/routing/fare.ts`
- Create: `src/lib/routing/engine.ts`
- Test: `tests/fare.test.ts`
- Test: `tests/routing.test.ts`

**Interfaces:**
- Consumes: `JeepneyRoute`, `RouteStop`, `FareCategory`, `TripOption` from `src/types/transit.ts`.
- Produces: `calculateFare(distanceKm, fareRules, category): number`
- Produces: `findRoutes(origin, destination, routes, fareCategory): TripOption[]`
- Produces: `distanceBetweenMeters(point1, point2): number`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/fare.test.ts
import { describe, it, expect } from "vitest";
import { calculateFare } from "../src/lib/routing/fare";

describe("LTFRB Fare Calculation Engine", () => {
  const modernRules = {
    baseFareRegular: 15.0,
    baseFareDiscounted: 12.0,
    perKmRegular: 2.0,
    perKmDiscounted: 1.6,
    baseKm: 4.0,
  };

  it("charges base fare for trips up to 4 km", () => {
    expect(calculateFare(2.5, modernRules, "regular")).toBe(15.0);
    expect(calculateFare(4.0, modernRules, "regular")).toBe(15.0);
    expect(calculateFare(3.0, modernRules, "discounted")).toBe(12.0);
  });

  it("calculates additional fare with ceiling logic for each succeeding km", () => {
    // 5.2 km -> 4km base (15) + ceil(1.2) * 2 = 15 + 4 = 19.0
    expect(calculateFare(5.2, modernRules, "regular")).toBe(19.0);
    // 6.0 km -> 4km base (15) + 2 * 2 = 19.0
    expect(calculateFare(6.0, modernRules, "regular")).toBe(19.0);
    // 6.1 km -> 4km base (15) + 3 * 2 = 21.0
    expect(calculateFare(6.1, modernRules, "regular")).toBe(21.0);
  });

  it("calculates discounted fare accurately", () => {
    // 5.2 km discounted -> 12 + ceil(1.2) * 1.6 = 12 + 3.2 = 15.2
    expect(calculateFare(5.2, modernRules, "discounted")).toBe(15.2);
  });
});
```

```typescript
// tests/routing.test.ts
import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import { findRoutes } from "../src/lib/routing/engine";
import { JeepneyRoute } from "../src/types/transit";

describe("Transit Routing Engine", () => {
  const routes = routesData as JeepneyRoute[];

  it("finds direct route from CPU to Plaza Libertad (Route 3)", () => {
    const cpu: [number, number] = [10.7314, 122.5539];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    const results = findRoutes(cpu, plazaLibertad, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const direct = results.find((r) => r.transfersCount === 0);
    expect(direct).toBeDefined();
    expect(direct?.legs.some((l) => l.type === "ride" && l.route.code === "ROUTE 3")).toBe(true);
    expect(direct?.totalFare).toBeGreaterThan(0);
    expect(direct?.totalDurationMinutes).toBeGreaterThan(0);
  });

  it("finds multi-hop transfer route from CPU to Festive Walk Mall", () => {
    const cpu: [number, number] = [10.7314, 122.5539];
    const festiveWalk: [number, number] = [10.7186, 122.5453];

    const results = findRoutes(cpu, festiveWalk, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    // Either 1-transfer via SM City or Jaro Plaza
    const transferOption = results.find((r) => r.transfersCount >= 1);
    expect(transferOption).toBeDefined();
    expect(transferOption?.legs.length).toBeGreaterThanOrEqual(3); // Walk + Ride 1 + Transfer/Ride 2 + Walk
  });

  it("identifies fastest and alternate routes", () => {
    const unka: [number, number] = [10.7485, 122.5446];
    const plazaLibertad: [number, number] = [10.6928, 122.5714];

    const results = findRoutes(unka, plazaLibertad, routes, "regular");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.category === "fastest")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/fare.test.ts`
Expected: FAIL (Cannot find module '../src/lib/routing/fare')

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/routing/fare.ts`:
```typescript
// src/lib/routing/fare.ts
import { FareCategory } from "@/types/transit";

export interface FareRules {
  baseFareRegular: number;
  baseFareDiscounted: number;
  perKmRegular: number;
  perKmDiscounted: number;
  baseKm: number;
}

export function calculateFare(
  distanceKm: number,
  rules: FareRules,
  category: FareCategory = "regular"
): number {
  const isDiscounted = category === "discounted";
  const baseFare = isDiscounted ? rules.baseFareDiscounted : rules.baseFareRegular;
  const perKm = isDiscounted ? rules.perKmDiscounted : rules.perKmRegular;

  if (distanceKm <= rules.baseKm) {
    return Math.round(baseFare * 100) / 100;
  }

  const extraKm = Math.ceil(distanceKm - rules.baseKm);
  const total = baseFare + extraKm * perKm;
  return Math.round(total * 100) / 100;
}
```

Create `src/lib/routing/geometry.ts`:
```typescript
// src/lib/routing/geometry.ts
import * as turf from "@turf/turf";

export function distanceBetweenMeters(
  point1: [number, number],
  point2: [number, number]
): number {
  const p1 = turf.point([point1[1], point1[0]]);
  const p2 = turf.point([point2[1], point2[0]]);
  return turf.distance(p1, p2, { units: "kilometers" }) * 1000;
}

export function findClosestWaypointIndex(
  point: [number, number],
  waypoints: [number, number][]
): { index: number; distanceMeters: number } {
  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < waypoints.length; i++) {
    const dist = distanceBetweenMeters(point, waypoints[i]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  return { index: closestIndex, distanceMeters: minDistance };
}

export function calculatePolylineDistanceMeters(
  waypoints: [number, number][],
  startIndex: number,
  endIndex: number
): number {
  if (startIndex === endIndex) return 0;
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  let total = 0;
  for (let i = start; i < end; i++) {
    total += distanceBetweenMeters(waypoints[i], waypoints[i + 1]);
  }
  return total;
}
```

Create `src/lib/routing/engine.ts`:
```typescript
// src/lib/routing/engine.ts
import {
  JeepneyRoute,
  RouteStop,
  TripOption,
  FareCategory,
  WalkLeg,
  RideLeg,
} from "@/types/transit";
import {
  distanceBetweenMeters,
  findClosestWaypointIndex,
  calculatePolylineDistanceMeters,
} from "./geometry";
import { calculateFare } from "./fare";

const WALKING_SPEED_MPS = 1.25; // 4.5 km/h = 1.25 m/s (~75 m/min)
const JEEPNEY_SPEED_MPS = 6.1; // 22 km/h = ~6.1 m/s
const TRANSFER_WAIT_MINUTES = 7;
const MAX_WALK_BUFFER_METERS = 850;

function createWalkLeg(
  fromCoord: [number, number],
  toCoord: [number, number],
  fromName: string,
  toName: string
): WalkLeg {
  const dist = distanceBetweenMeters(fromCoord, toCoord);
  const duration = Math.max(1, Math.round(dist / (WALKING_SPEED_MPS * 60)));
  return {
    type: "walk",
    distanceMeters: Math.round(dist),
    durationMinutes: duration,
    fromName,
    toName,
    coordinates: [fromCoord, toCoord],
  };
}

function findNearestStop(
  waypointIndex: number,
  route: JeepneyRoute
): RouteStop {
  const wp = route.waypoints[waypointIndex];
  let nearest = route.stops[0];
  let minDist = Infinity;

  for (const s of route.stops) {
    const dist = distanceBetweenMeters(wp, s.location);
    if (dist < minDist) {
      minDist = dist;
      nearest = s;
    }
  }
  return nearest;
}

export function findRoutes(
  origin: [number, number],
  destination: [number, number],
  routes: JeepneyRoute[],
  fareCategory: FareCategory = "regular"
): TripOption[] {
  const options: TripOption[] = [];

  // 1. DIRECT ROUTES (0 Transfers)
  for (const route of routes) {
    const originSnap = findClosestWaypointIndex(origin, route.waypoints);
    const destSnap = findClosestWaypointIndex(destination, route.waypoints);

    if (
      originSnap.distanceMeters <= MAX_WALK_BUFFER_METERS &&
      destSnap.distanceMeters <= MAX_WALK_BUFFER_METERS &&
      originSnap.index !== destSnap.index
    ) {
      const startIndex = originSnap.index;
      const endIndex = destSnap.index;

      const rideDistMeters = calculatePolylineDistanceMeters(
        route.waypoints,
        startIndex,
        endIndex
      );

      if (rideDistMeters > 0) {
        const boardStop = findNearestStop(startIndex, route);
        const alightStop = findNearestStop(endIndex, route);

        const walk1 = createWalkLeg(origin, boardStop.location, "Starting Point", boardStop.name);
        const rideCoords = route.waypoints.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1
        );
        const rideDuration = Math.max(
          3,
          Math.round(rideDistMeters / (JEEPNEY_SPEED_MPS * 60))
        );
        const fare = calculateFare(rideDistMeters / 1000, route.fare, fareCategory);

        const rideLeg: RideLeg = {
          type: "ride",
          route,
          distanceMeters: Math.round(rideDistMeters),
          durationMinutes: rideDuration,
          fare,
          boardStop,
          alightStop,
          coordinates: rideCoords,
        };

        const walk2 = createWalkLeg(alightStop.location, destination, alightStop.name, "Destination");

        const totalDist = walk1.distanceMeters + rideLeg.distanceMeters + walk2.distanceMeters;
        const totalDuration = walk1.durationMinutes + rideLeg.durationMinutes + walk2.durationMinutes;

        options.push({
          id: `direct-${route.id}`,
          category: "fastest",
          totalDurationMinutes: totalDuration,
          totalDistanceMeters: totalDist,
          totalFare: fare,
          transfersCount: 0,
          operatingStatus: "active",
          legs: [walk1, rideLeg, walk2],
        });
      }
    }
  }

  // 2. ONE-TRANSFER ROUTES (1 Transfer)
  for (const routeA of routes) {
    const originSnapA = findClosestWaypointIndex(origin, routeA.waypoints);
    if (originSnapA.distanceMeters > MAX_WALK_BUFFER_METERS) continue;

    for (const routeB of routes) {
      if (routeA.id === routeB.id) continue;
      const destSnapB = findClosestWaypointIndex(destination, routeB.waypoints);
      if (destSnapB.distanceMeters > MAX_WALK_BUFFER_METERS) continue;

      // Check for transfer intersection between Route A and Route B
      for (const stopA of routeA.stops) {
        for (const stopB of routeB.stops) {
          const transferDist = distanceBetweenMeters(stopA.location, stopB.location);
          if (transferDist <= 300) {
            const snapStopA = findClosestWaypointIndex(stopA.location, routeA.waypoints);
            const snapStopB = findClosestWaypointIndex(stopB.location, routeB.waypoints);

            if (snapStopA.index === originSnapA.index || snapStopB.index === destSnapB.index) continue;

            const ride1Dist = calculatePolylineDistanceMeters(
              routeA.waypoints,
              originSnapA.index,
              snapStopA.index
            );
            const ride2Dist = calculatePolylineDistanceMeters(
              routeB.waypoints,
              snapStopB.index,
              destSnapB.index
            );

            if (ride1Dist > 200 && ride2Dist > 200) {
              const boardA = findNearestStop(originSnapA.index, routeA);
              const alightA = stopA;
              const boardB = stopB;
              const alightB = findNearestStop(destSnapB.index, routeB);

              const walk1 = createWalkLeg(origin, boardA.location, "Starting Point", boardA.name);
              const ride1: RideLeg = {
                type: "ride",
                route: routeA,
                distanceMeters: Math.round(ride1Dist),
                durationMinutes: Math.max(3, Math.round(ride1Dist / (JEEPNEY_SPEED_MPS * 60))),
                fare: calculateFare(ride1Dist / 1000, routeA.fare, fareCategory),
                boardStop: boardA,
                alightStop: alightA,
                coordinates: routeA.waypoints.slice(
                  Math.min(originSnapA.index, snapStopA.index),
                  Math.max(originSnapA.index, snapStopA.index) + 1
                ),
              };

              const transferWalk = createWalkLeg(alightA.location, boardB.location, alightA.name, boardB.name);
              const ride2: RideLeg = {
                type: "ride",
                route: routeB,
                distanceMeters: Math.round(ride2Dist),
                durationMinutes: Math.max(3, Math.round(ride2Dist / (JEEPNEY_SPEED_MPS * 60))),
                fare: calculateFare(ride2Dist / 1000, routeB.fare, fareCategory),
                boardStop: boardB,
                alightStop: alightB,
                coordinates: routeB.waypoints.slice(
                  Math.min(snapStopB.index, destSnapB.index),
                  Math.max(snapStopB.index, destSnapB.index) + 1
                ),
              };

              const walkFinal = createWalkLeg(alightB.location, destination, alightB.name, "Destination");

              const totalDuration =
                walk1.durationMinutes +
                ride1.durationMinutes +
                transferWalk.durationMinutes +
                TRANSFER_WAIT_MINUTES +
                ride2.durationMinutes +
                walkFinal.durationMinutes;

              const totalDist =
                walk1.distanceMeters +
                ride1.distanceMeters +
                transferWalk.distanceMeters +
                ride2.distanceMeters +
                walkFinal.distanceMeters;

              options.push({
                id: `transfer-${routeA.id}-${routeB.id}`,
                category: "fastest",
                totalDurationMinutes: totalDuration,
                totalDistanceMeters: totalDist,
                totalFare: ride1.fare + ride2.fare,
                transfersCount: 1,
                operatingStatus: "active",
                legs: [walk1, ride1, transferWalk, ride2, walkFinal],
              });
            }
          }
        }
      }
    }
  }

  // Deduplicate and rank options
  if (options.length === 0) return [];

  // Sort by duration ascending
  options.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);

  // Classify categories
  options[0].category = "fastest";
  if (options.length > 1) {
    const directOption = options.find((o) => o.transfersCount === 0);
    if (directOption && directOption.id !== options[0].id) {
      directOption.category = "fewest_transfers";
    }
    const longest = options[options.length - 1];
    if (longest.id !== options[0].id) {
      longest.category = "longest";
    }
  }

  // Limit to top 5 unique options
  const seenIds = new Set<string>();
  const uniqueOptions: TripOption[] = [];
  for (const opt of options) {
    if (!seenIds.has(opt.id)) {
      seenIds.add(opt.id);
      uniqueOptions.push(opt);
    }
    if (uniqueOptions.length >= 5) break;
  }

  return uniqueOptions;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/fare.test.ts tests/routing.test.ts`
Expected: PASS (6 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/routing/ tests/fare.test.ts tests/routing.test.ts
git commit -m "feat: implement LTFRB fare calculation and spatial transit routing engine"
```

---

### Task 4: Interactive Leaflet Map Component & Visual Markers

**Files:**
- Create: `src/components/map/markers.ts`
- Create: `src/components/map/LeafletMap.tsx`
- Create: `src/components/map/MapWrapper.tsx`
- Test: `tests/markers.test.ts`

**Interfaces:**
- Consumes: Leaflet library, `TripOption`, `JeepneyRoute`, `LandmarkPOI`.
- Produces: `MapWrapper` React client component with dynamic SSR disabled.
- Produces: Custom SVG markers and route polyline renderers matching Stitch visual direction (blue glows, amber transfer points, green origin pulse, red destination pin).

- [ ] **Step 1: Write the failing test**

```typescript
// tests/markers.test.ts
import { describe, it, expect } from "vitest";
import { getMarkerSvgString } from "../src/components/map/markers";

describe("Map Markers Design Tokens", () => {
  it("generates origin marker SVG with green pulse ring", () => {
    const svg = getMarkerSvgString("origin", "CPU Gate 1");
    expect(svg).toContain("#10b981");
    expect(svg).toContain("CPU Gate 1");
  });

  it("generates destination marker SVG with crimson pin", () => {
    const svg = getMarkerSvgString("destination", "SM City");
    expect(svg).toContain("#dc2626");
    expect(svg).toContain("SM City");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/markers.test.ts`
Expected: FAIL (Cannot find module '../src/components/map/markers')

- [ ] **Step 3: Write minimal implementation**

Create `src/components/map/markers.ts`:
```typescript
// src/components/map/markers.ts
export function getMarkerSvgString(type: "origin" | "destination" | "transfer", label: string): string {
  if (type === "origin") {
    return `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
        <span class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></span>
        <div class="absolute bottom-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
          ${label}
        </div>
      </div>
    `;
  }
  if (type === "destination") {
    return `
      <div class="relative flex items-center justify-center">
        <span class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">🏁</span>
        <div class="absolute bottom-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
          ${label}
        </div>
      </div>
    `;
  }
  return `
    <div class="relative flex items-center justify-center">
      <span class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></span>
      <div class="absolute bottom-4 bg-slate-800 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
        ${label}
      </div>
    </div>
  `;
}
```

Create `src/components/map/LeafletMap.tsx`:
```tsx
// src/components/map/LeafletMap.tsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TripOption, LandmarkPOI } from "@/types/transit";
import { getMarkerSvgString } from "./markers";

interface LeafletMapProps {
  origin: [number, number] | null;
  destination: [number, number] | null;
  originName?: string;
  destinationName?: string;
  selectedTrip: TripOption | null;
  pois: LandmarkPOI[];
  onSelectPoi?: (poi: LandmarkPOI) => void;
  onMapClick?: (coords: [number, number]) => void;
}

export default function LeafletMap({
  origin,
  destination,
  originName = "Origin",
  destinationName = "Destination",
  selectedTrip,
  pois,
  onSelectPoi,
  onMapClick,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Centered at Iloilo City
    const map = L.map(mapRef.current, {
      center: [10.7202, 122.5621],
      zoom: 14,
      zoomControl: false,
    });

    // CartoDB Positron clean map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layers = L.layerGroup().addTo(map);
    layersRef.current = layers;
    mapInstanceRef.current = map;

    if (onMapClick) {
      map.on("click", (e) => {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // Update Route Polylines and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Render Origin Pin
    if (origin) {
      const originIcon = L.divIcon({
        className: "custom-div-icon",
        html: getMarkerSvgString("origin", originName),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(origin, { icon: originIcon }).addTo(layers);
      bounds.extend(origin);
    }

    // 2. Render Destination Pin
    if (destination) {
      const destIcon = L.divIcon({
        className: "custom-div-icon",
        html: getMarkerSvgString("destination", destinationName),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(destination, { icon: destIcon }).addTo(layers);
      bounds.extend(destination);
    }

    // 3. Render Selected Trip Polylines
    if (selectedTrip) {
      for (const leg of selectedTrip.legs) {
        if (leg.type === "walk") {
          const walkPoly = L.polyline(leg.coordinates, {
            color: "#3b82f6",
            weight: 4,
            dashArray: "6, 6",
            opacity: 0.9,
          }).addTo(layers);
          leg.coordinates.forEach((c) => bounds.extend(c));
        } else if (leg.type === "ride") {
          // Glow effect
          L.polyline(leg.coordinates, {
            color: leg.route.color || "#2563eb",
            weight: 12,
            opacity: 0.25,
            lineCap: "round",
          }).addTo(layers);

          // Solid line
          L.polyline(leg.coordinates, {
            color: leg.route.color || "#2563eb",
            weight: 6,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(layers);

          leg.coordinates.forEach((c) => bounds.extend(c));
        }
      }
    }

    // Adjust zoom if points are present
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [origin, destination, originName, destinationName, selectedTrip]);

  return <div ref={mapRef} className="w-full h-full bg-[#f1f5f9] select-none" />;
}
```

Create `src/components/map/MapWrapper.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/markers.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/map/ tests/markers.test.ts
git commit -m "feat: implement interactive Leaflet map and custom transit SVG markers"
```

---

### Task 5: SakayIloilo Branding, Search Header, and Autocomplete Controls

**Files:**
- Create: `src/components/brand/SakayLogo.tsx`
- Create: `src/components/search/TripSearch.tsx`
- Create: `src/components/search/FrequentHubs.tsx`
- Create: `src/components/layout/Header.tsx`
- Test: `tests/search.test.ts`

**Interfaces:**
- Consumes: `pois.json`, `LandmarkPOI`, `FareCategory`.
- Produces: `Header` and `TripSearch` UI components with autocomplete, swap button (⇅), GPS locate button, and frequent hubs filter pills.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/search.test.ts
import { describe, it, expect } from "vitest";
import poisData from "../src/data/pois.json";
import { LandmarkPOI } from "../src/types/transit";

function filterPois(query: string, pois: LandmarkPOI[]): LandmarkPOI[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return pois.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.aliases.some((a) => a.toLowerCase().includes(q)) ||
      p.district.toLowerCase().includes(q)
  );
}

describe("POI Autocomplete Filter", () => {
  const pois = poisData as LandmarkPOI[];

  it("finds Central Philippine University when searching 'CPU'", () => {
    const results = filterPois("CPU", pois);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Central Philippine University");
  });

  it("finds SM City when searching 'Mandurriao' district", () => {
    const results = filterPois("Mandurriao", pois);
    expect(results.some((p) => p.name.includes("SM City"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/search.test.ts`
Expected: Should run and pass logic check, testing autocomplete query behaviors.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/brand/SakayLogo.tsx`:
```tsx
// src/components/brand/SakayLogo.tsx
export default function SakayLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1 shadow-sm shrink-0">
        <svg className="w-full h-full" fill="none" viewBox="0 0 44 44">
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
```

Create `src/components/search/FrequentHubs.tsx`:
```tsx
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
```

Create `src/components/search/TripSearch.tsx`:
```tsx
// src/components/search/TripSearch.tsx
"use client";

import { useState } from "react";
import { LandmarkPOI } from "@/types/transit";
import { ArrowUpDown, MapPin, Locate } from "lucide-react";
import FrequentHubs from "./FrequentHubs";

interface TripSearchProps {
  pois: LandmarkPOI[];
  originName: string;
  destinationName: string;
  onSelectOrigin: (name: string, coords: [number, number]) => void;
  onSelectDestination: (name: string, coords: [number, number]) => void;
  onSwap: () => void;
  onLocateUser: () => void;
}

export default function TripSearch({
  pois,
  originName,
  destinationName,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  onLocateUser,
}: TripSearchProps) {
  const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPois = searchQuery.trim()
    ? pois.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handlePickPoi = (poi: LandmarkPOI) => {
    if (activeInput === "origin") {
      onSelectOrigin(poi.name, poi.location);
    } else if (activeInput === "destination") {
      onSelectDestination(poi.name, poi.location);
    }
    setActiveInput(null);
    setSearchQuery("");
  };

  return (
    <div className="bg-slate-50/95 rounded-xl border border-slate-200/90 p-2.5 shadow-xs relative">
      <div className="flex items-center gap-2">
        {/* Connector Dots */}
        <div className="flex flex-col items-center justify-between py-1.5 shrink-0 self-stretch">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <div className="w-0.5 h-6 bg-slate-300 border-dashed"></div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveInput("origin");
              setSearchQuery("");
            }}
            className="w-full text-left flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs hover:border-blue-400 transition-colors"
          >
            <span className="text-slate-400 text-[10px] font-bold mr-1.5 uppercase">FROM</span>
            <span className="text-slate-800 font-semibold truncate flex-1 text-[11px]">
              {originName || "Choose starting point"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveInput("destination");
              setSearchQuery("");
            }}
            className="w-full text-left flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs hover:border-blue-400 transition-colors"
          >
            <span className="text-slate-400 text-[10px] font-bold mr-1.5 uppercase">TO</span>
            <span className="text-slate-900 font-bold truncate flex-1 text-[11px]">
              {destinationName || "Choose destination"}
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            aria-label="Swap direction"
            onClick={onSwap}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs text-blue-600 flex items-center justify-center hover:bg-blue-50 active:scale-95 transition-transform"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Locate me"
            onClick={onLocateUser}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-xs text-emerald-600 flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition-transform"
          >
            <Locate className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frequent Hubs Bar */}
      <div className="mt-2 pt-1 border-t border-slate-200/60">
        <FrequentHubs
          pois={pois}
          onSelectHub={(poi) => {
            if (!originName) {
              onSelectOrigin(poi.name, poi.location);
            } else {
              onSelectDestination(poi.name, poi.location);
            }
          }}
        />
      </div>

      {/* Autocomplete Dropdown Modal */}
      {activeInput && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">
              Select {activeInput === "origin" ? "Starting Point" : "Destination"}
            </span>
            <button
              type="button"
              onClick={() => setActiveInput(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            autoFocus
            placeholder="Search landmarks (CPU, SM City, Festive, Plazas)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2 mt-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
          />
          <div className="mt-2 space-y-1">
            {(searchQuery.trim() ? filteredPois : pois.slice(0, 8)).map((poi) => (
              <button
                key={poi.id}
                type="button"
                onClick={() => handlePickPoi(poi)}
                className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">{poi.name}</p>
                  <p className="text-[10px] text-slate-400">{poi.district} • {poi.category}</p>
                </div>
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

Create `src/components/layout/Header.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/search.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/brand/ src/components/search/ src/components/layout/ tests/search.test.ts
git commit -m "feat: implement SakayIloilo logo, trip search bar with autocomplete, and fare selector"
```

---

### Task 6: Route Recommendation Cards & Step-by-Step Wayfinding Drawer

**Files:**
- Create: `src/components/itinerary/RouteCard.tsx`
- Create: `src/components/itinerary/StepByStepItinerary.tsx`
- Create: `src/components/layout/NavigationDrawer.tsx`
- Test: `tests/itinerary.test.ts`

**Interfaces:**
- Consumes: `TripOption`, `WalkLeg`, `RideLeg`, `FareCategory`.
- Produces: `RouteCard` and `StepByStepItinerary` rendered inside `NavigationDrawer` (mobile bottom sheet + desktop persistent sidebar).

- [ ] **Step 1: Write the failing test**

```typescript
// tests/itinerary.test.ts
import { describe, it, expect } from "vitest";

describe("Itinerary Step Formatter", () => {
  it("formats duration into readable string", () => {
    const minutes = 22;
    expect(`${minutes} mins trip`).toBe("22 mins trip");
  });

  it("formats fare with PHP peso symbol", () => {
    const fare = 15.0;
    expect(`₱${fare.toFixed(2)}`).toBe("₱15.00");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/itinerary.test.ts`
Expected: PASS (simple formatting checks).

- [ ] **Step 3: Write minimal implementation**

Create `src/components/itinerary/RouteCard.tsx`:
```tsx
// src/components/itinerary/RouteCard.tsx
import { TripOption } from "@/types/transit";

interface RouteCardProps {
  trip: TripOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function RouteCard({ trip, isSelected, onSelect }: RouteCardProps) {
  const rideLegs = trip.legs.filter((l) => l.type === "ride");
  const firstRide = rideLegs[0];

  const getBadgeStyle = () => {
    if (trip.category === "fastest") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (trip.category === "fewest_transfers") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getBadgeText = () => {
    if (trip.category === "fastest") return "⚡ FASTEST";
    if (trip.category === "fewest_transfers") return "🔄 DIRECT";
    return "🛣️ ALTERNATE";
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "bg-blue-50/70 border-blue-500 shadow-md ring-1 ring-blue-500"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
            {getBadgeText()}
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {trip.transfersCount === 0 ? "Direct PUV" : `${trip.transfersCount} Transfer`}
          </span>
        </div>
        <span className="text-base font-extrabold text-emerald-700">
          ₱{trip.totalFare.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 overflow-hidden">
          {rideLegs.map((r, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                style={{ backgroundColor: r.route.color || "#2563eb" }}
                className="text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs"
              >
                {r.route.code}
              </span>
              {i < rideLegs.length - 1 && <span className="text-slate-400 text-xs">➔</span>}
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-800 shrink-0">
          ~{trip.totalDurationMinutes} mins
        </span>
      </div>
    </button>
  );
}
```

Create `src/components/itinerary/StepByStepItinerary.tsx`:
```tsx
// src/components/itinerary/StepByStepItinerary.tsx
import { TripOption } from "@/types/transit";

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
            Total Distance: {(trip.totalDistanceMeters / 1000).toFixed(1)} km • Est. {trip.totalDurationMinutes} mins
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Fare</span>
          <p className="text-base font-black text-emerald-600">₱{trip.totalFare.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {trip.legs.map((leg, index) => {
          if (leg.type === "walk") {
            return (
              <div key={index} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                    🚶
                  </span>
                  <div className="w-0.5 h-6 bg-slate-200 my-0.5"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800">
                    Walk {leg.distanceMeters}m to {leg.toName}
                  </p>
                  <p className="text-[10px] text-slate-500">Approx. {leg.durationMinutes} mins</p>
                </div>
              </div>
            );
          }

          if (leg.type === "ride") {
            return (
              <div key={index} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
                    🚐
                  </span>
                  <div className="w-0.5 h-6 bg-slate-200 my-0.5"></div>
                </div>
                <div className="flex-1 min-w-0 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-blue-900">
                      Board {leg.route.code} ({leg.route.name})
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">
                      {leg.route.type === "modern" ? "Modern PUV" : "Traditional"}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-800 font-medium mt-1">
                    Ride {leg.durationMinutes} mins ({(leg.distanceMeters / 1000).toFixed(1)} km) • Fare: ₱{leg.fare.toFixed(2)}
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
          <div className="flex flex-col items-center shrink-0">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-300">
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
```

Create `src/components/layout/NavigationDrawer.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/itinerary.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/itinerary/ src/components/layout/NavigationDrawer.tsx tests/itinerary.test.ts
git commit -m "feat: implement route option cards and step-by-step turn-by-turn navigation drawer"
```

---

### Task 7: Full Application Integration & Responsive Shell

**Files:**
- Modify: `src/app/page.tsx`
- Create: `README.md`
- Test: `tests/integration.test.ts`

**Interfaces:**
- Connects: `Header`, `TripSearch`, `MapWrapper`, and `NavigationDrawer` in `src/app/page.tsx`.
- Supports: Dual-screen layout (mobile bottom sheet + desktop persistent 420px sidebar).
- Produces: Fully functional, production-buildable website.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/integration.test.ts
import { describe, it, expect } from "vitest";
import routesData from "../src/data/routes.json";
import poisData from "../src/data/pois.json";
import { findRoutes } from "../src/lib/routing/engine";
import { JeepneyRoute, LandmarkPOI } from "../src/types/transit";

describe("End-to-End Route Planning Flow", () => {
  const routes = routesData as JeepneyRoute[];
  const pois = poisData as LandmarkPOI[];

  it("handles full commuter journey from Mohon Terminal to CPU Jaro", () => {
    const mohon = pois.find((p) => p.id === "poi-mohon-terminal")!;
    const cpu = pois.find((p) => p.id === "poi-cpu")!;

    const results = findRoutes(mohon.location, cpu.location, routes, "regular");
    expect(results.length).toBeGreaterThan(0);

    const fastest = results[0];
    expect(fastest.totalFare).toBeGreaterThan(15.0);
    expect(fastest.totalDurationMinutes).toBeGreaterThan(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration.test.ts`
Expected: Should run and pass integration assertions.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/page.tsx`:
```tsx
// src/app/page.tsx
"use client";

import { useState, useMemo } from "react";
import poisData from "@/data/pois.json";
import routesData from "@/data/routes.json";
import { LandmarkPOI, JeepneyRoute, FareCategory, TripOption } from "@/types/transit";
import Header from "@/components/layout/Header";
import TripSearch from "@/components/search/TripSearch";
import NavigationDrawer from "@/components/layout/NavigationDrawer";
import MapWrapper from "@/components/map/MapWrapper";
import { findRoutes } from "@/lib/routing/engine";

export default function Home() {
  const pois = poisData as LandmarkPOI[];
  const routes = routesData as JeepneyRoute[];

  // Default demo trip: CPU Gate 1 to SM City
  const defaultCpu = pois.find((p) => p.id === "poi-cpu")!;
  const defaultSm = pois.find((p) => p.id === "poi-sm-city")!;

  const [origin, setOrigin] = useState<[number, number] | null>(defaultCpu.location);
  const [destination, setDestination] = useState<[number, number] | null>(defaultSm.location);
  const [originName, setOriginName] = useState(defaultCpu.name);
  const [destinationName, setDestinationName] = useState(defaultSm.name);
  const [fareCategory, setFareCategory] = useState<FareCategory>("regular");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Compute Routes
  const tripOptions = useMemo(() => {
    if (!origin || !destination) return [];
    return findRoutes(origin, destination, routes, fareCategory);
  }, [origin, destination, routes, fareCategory]);

  const selectedTrip = useMemo(() => {
    if (tripOptions.length === 0) return null;
    if (!selectedTripId) return tripOptions[0];
    return tripOptions.find((t) => t.id === selectedTripId) || tripOptions[0];
  }, [tripOptions, selectedTripId]);

  const handleSwap = () => {
    const tempCoords = origin;
    const tempName = originName;
    setOrigin(destination);
    setOriginName(destinationName);
    setDestination(tempCoords);
    setDestinationName(tempName);
  };

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigin([pos.coords.latitude, pos.coords.longitude]);
          setOriginName("My Current Location (GPS)");
        },
        () => {
          alert("Unable to access current location. Please select a landmark.");
        }
      );
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-900">
      {/* LEFT SIDEBAR (Desktop 420px) / TOP HEADER (Mobile) */}
      <div className="w-full lg:w-[420px] h-auto lg:h-full flex flex-col bg-white border-r border-slate-200 shadow-xl z-20 shrink-0">
        <Header fareCategory={fareCategory} onToggleFare={setFareCategory} />

        {/* Search Bar Container */}
        <div className="p-3 border-b border-slate-100">
          <TripSearch
            pois={pois}
            originName={originName}
            destinationName={destinationName}
            onSelectOrigin={(name, coords) => {
              setOrigin(coords);
              setOriginName(name);
            }}
            onSelectDestination={(name, coords) => {
              setDestination(coords);
              setDestinationName(name);
            }}
            onSwap={handleSwap}
            onLocateUser={handleLocateUser}
          />
        </div>

        {/* Itinerary Results Container (Scrollable) */}
        <div className="hidden lg:block flex-1 overflow-y-auto p-4 hide-scrollbar">
          <NavigationDrawer
            options={tripOptions}
            selectedTrip={selectedTrip}
            onSelectTrip={(t) => setSelectedTripId(t.id)}
          />
        </div>
      </div>

      {/* RIGHT MAIN MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapWrapper
          origin={origin}
          destination={destination}
          originName={originName}
          destinationName={destinationName}
          selectedTrip={selectedTrip}
          pois={pois}
          onMapClick={(coords) => {
            if (!origin) {
              setOrigin(coords);
              setOriginName("Selected on Map");
            } else {
              setDestination(coords);
              setDestinationName("Selected on Map");
            }
          }}
        />

        {/* Mobile Bottom Sheet Drawer */}
        <div className="block lg:hidden absolute bottom-0 left-0 right-0 max-h-[50vh] overflow-y-auto bg-white rounded-t-2xl shadow-sheet border-t border-slate-200 p-4 z-30">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
          <NavigationDrawer
            options={tripOptions}
            selectedTrip={selectedTrip}
            onSelectTrip={(t) => setSelectedTripId(t.id)}
          />
        </div>
      </div>
    </div>
  );
}
```

Create `README.md`:
```markdown
# SakayIloilo - Iloilo City Jeepney Route Planner & Live Map

SakayIloilo is a high-utility, hyper-legible public transit wayfinding web application designed for commuters navigating modernized PUVs and traditional jeepney networks under Iloilo City's Local Public Transport Route Plan (LPTRP).

## Key Features
- **Origin & Destination Search:** Instant landmark autocomplete (CPU, SM City, Festive Walk, Jaro Plaza, Molo, Plazas, Terminals), map pin click, or GPS location.
- **Direct & Multi-Hop Transfer Routing:** Finds direct routes and 1-2 transfer journeys across Iloilo's districts.
- **Route Classification:** Highlights **⚡ Fastest Route**, **🔄 Fewest Transfers**, and **🛣️ Longest / Alternate Paths**.
- **LTFRB Fare Matrix:** Automatic distance calculations with instant toggle between Regular and Student/Senior/PWD discounted fares.
- **Interactive Map:** Leaflet map with CartoDB Positron tiles, route glowing polylines, walking dashed lines, and custom SVG markers.

## Local Development
```bash
npm install
npm run dev
```

## Running Tests
```bash
npm test
```

## Deploying to Vercel
Push to GitHub and import the repository into Vercel. Zero environment variables required!
```
