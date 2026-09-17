# Design Specification: SakayIloilo (Iloilo City Jeepney Route Planner)

**Date:** 2026-09-18  
**Project Path:** `/Users/michaeljohnsubigca/Work/JEEPNEY PROJECT`  
**Visual Direction Source:** `docs/visual-direction/` (Stitch UI Design System)  
**Status:** Approved for Implementation Planning  

---

## 1. Executive Summary & Goals

**SakayIloilo** is a high-utility, hyper-legible public transit wayfinding web application designed for urban commuters, students, workers, and tourists navigating Iloilo City's traditional jeepney networks (PUJs) and modernized Public Utility Vehicles (PUVs/Buses) operating under the Local Public Transport Route Plan (LPTRP).

Users enter departure and destination points (via landmark search, map pin drop, or device GPS) to receive optimized route recommendations showing:
- **Fastest Route** (least estimated transit time)
- **Fewest Transfers** (prioritizing direct single-jeepney rides)
- **Longest / Alternate Routes** (alternative paths across districts)
- **LTFRB Fare Estimates** (instant toggle between Regular and Student/Senior/PWD discounted rates)
- **Service Availability** (operating hours like 4:30 AM – 10:30 PM and off-hours warnings)
- **Step-by-Step Navigation Directions** (walking legs + boarding badges + transfer points + destination flags)

---

## 2. Technology Stack & Deployment

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS with custom design tokens from the **Iloilo Transit Wayfinding System**
- **Mapping & GIS:** 
  - [Leaflet](https://leafletjs.com/) with React wrapper
  - Base Map Tiles: OpenStreetMap / CartoDB Positron (clean, high-contrast, zero-cost, no API keys needed)
  - Spatial math: `@turf/turf` (Haversine distance, line snapping, point-to-line calculations)
- **Icons & Typography:**
  - Headings & Route Codes: `Plus Jakarta Sans` (weights 600, 700, 800)
  - Body & Transit Steps: `Inter` (weights 400, 500, 600, 700)
  - Icons: Google Material Symbols Outlined / Heroicons / Lucide React
- **Deployment Platform:** Vercel (free static/hybrid hosting with automated GitHub CI/CD)
- **Data Persistence:** Static JSON datasets version-controlled via Git in the repository.

---

## 3. Visual Identity & Design System (SakayIloilo)

The visual direction directly implements the approved Stitch design specifications stored in `docs/visual-direction/`:

### 3.1 Color Palette
- **Primary (`#2563EB` - Transit Cobalt / `#004AC6`):** Drives primary actions, system states, user location indicators, navigation cues, and active transit paths.
- **Secondary (`#F59E0B` - Mango Amber / `#FEA619`):** Iconic traditional jeepney highlight, transfer indicators, Route code pills, and landmark badges.
- **Tertiary (`#10B981` - Modern PUV Emerald / `#007D55`):** Signals modernized air-conditioned PUVs, eco/low-fare route options, and active operating status.
- **Slate Navy (`#0F172A` / `#131B2E`):** Grounds all typography and key structural boundaries, eliminating OLED glare while retaining maximum outdoor contrast.
- **Surfaces:**
  - Base Canvas: `#FAF8FF` / `#F1F5F9`
  - Container Low: `#F2F3FF` / `#F8FAFC`
  - Container Lowest (Cards): `#FFFFFF`
  - Border / Outline: `#E2E8F0` / `#CBD5E1`

### 3.2 SakayIloilo Logo & Branding
- **Logo Symbol:** Custom SVG mark featuring a stylized Jeepney front with green destination pin, crisp white windshield, mango amber bumper, headlights, and route sign.
- **Title Lockup:** `Sakay` (Slate `#0F172A`) + `Iloilo` (Cobalt `#2563EB`), paired with an `LPTRP` validation pill and `Iloilo City PUV Guide` sub-caption.

### 3.3 Elevation & Shapes
- **Elevation 1 (Cards & Lists):** Surface white with 1px border `#E2E8F0` and subtle ambient shadow.
- **Elevation 2 (Floating Search & Controls):** `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)`.
- **Elevation 3 (Mobile Bottom Sheet Drawer):** `box-shadow: 0 -10px 30px -5px rgba(15, 23, 42, 0.15)`.
- **Border Radii:** Buttons (`0.5rem` / `rounded-lg`), Cards & Drawers (`1rem` / `rounded-2xl`), Route badges & Pills (`9999px` / `rounded-full`).

---

## 4. User Interface Layout & Interactions

The application is architected with a responsive dual-mode layout:

### 4.1 Mobile Experience (Screen width < 1024px)
- **Top Sticky Header:**
  - SakayIloilo brandmark + Fare toggle pill (Regular vs Discounted).
  - Compact Route Search Card:
    - Origin input (green ring pip) + Destination input (red ring pip).
    - Swap button (⇅) with tactile tap animation.
    - Frequent Hubs horizontal scroll chip bar (`SM City`, `CPU`, `Festive Walk`, `Jaro Plaza`, `Tagbak`, `Mohon`).
    - Live PUV Operations ticker (`4:30 AM – 10:30 PM`).
- **Interactive Full-Screen Map:**
  - Vector-styled streets with district typography overlays (`JARO`, `MANDURRIAO`, `MOLO`, `CITY PROPER`, `LA PAZ`).
  - Origin pulsing green marker (`START: CPU GATE 1`) and Destination flag pin (`SM City Northwing`).
  - Colored route line with glow effect (`#2563EB`) and dashed walking links (`#10B981` / `#3B82F6`).
  - Floating map controls: Re-center (GPS), Zoom In/Out, Traffic overlay toggle.
- **Bottom Navigation Sheet:**
  - Drag handle (36×4px rounded bar).
  - Quick route summary: `ROUTE 3 PUV`, `22 min trip`, `₱15.00` fare badge.
  - Step-by-Step Wayfinding Itinerary with vertical timeline spine:
    - 🚶 Step 1: Walk 120m to CPU Gate 1 (~2 mins)
    - 🚐 Step 2: Board Route 3 Modern PUV (Unit arrival estimate, route via Jaro Plaza ➔ El 98 ➔ Diversion)
    - 🔄 Step 3: Transfer / Alight junction indicator
    - 🏁 Step 4: Arrive at destination.

### 4.2 Desktop Experience (Screen width ≥ 1024px)
- **Persistent Left Wayfinding Sidebar (420px):**
  - Brand header with LPTRP validation badge and operating hours ticker.
  - Search inputs with origin/destination swap and landmark autocomplete dropdown.
  - Frequent Hubs grid.
  - Suggested Route Cards list with filter tabs (`Fastest`, `Fewest Transfers`, `All Routes`).
  - Active itinerary step-by-step accordion with fare summary and route code badges.
- **Top Floating HUD:**
  - Quick landmark shortcut pills (`SM City`, `CPU Jaro`, `Festive Walk`, `Jaro Plaza`, `Atria District`, `UP Visayas`).
  - Live traffic and operational status capsule.
- **Remaining Canvas Map Viewport:**
  - Expansive Leaflet map canvas rendering high-detail route paths and landmark pins.

---

## 5. Data Architecture & Schema

All route and landmark data resides in structured static JSON files in `data/`, maintained directly in the repository.

### 5.1 Route Schema (`data/routes/*.json` or bundled `data/routes.json`)

```typescript
export interface RouteStop {
  id: string;
  name: string; // e.g. "CPU Gate 1", "Jaro Plaza", "SM City Iloilo"
  location: [number, number]; // [latitude, longitude]
  isMajorHub: boolean; // true if major transfer junction
}

export interface JeepneyRoute {
  id: string; // e.g. "route-3-ungka-cpu-city-proper"
  code: string; // e.g. "ROUTE 3"
  name: string; // e.g. "Ungka to City Proper via CPU"
  type: "modern" | "traditional"; // PUV classification
  color: string; // Hex color for line rendering (e.g. "#2563eb")
  operatingHours: {
    firstTrip: string; // "04:30" (24-hour format)
    lastTrip: string; // "22:30"
  };
  fare: {
    baseFareRegular: number; // ₱15.00 for modern, ₱13.00 for traditional
    baseFareDiscounted: number; // ₱12.00 for modern, ₱10.50 for traditional
    perKmRegular: number; // ₱2.00
    perKmDiscounted: number; // ₱1.60
    baseKm: number; // 4.0
  };
  waypoints: [number, number][]; // Street polyline coordinates: [[lat, lng], ...]
  stops: RouteStop[];
}
```

### 5.2 Landmarks / POI Schema (`data/pois.json`)

```typescript
export interface LandmarkPOI {
  id: string;
  name: string; // e.g. "Central Philippine University"
  aliases: string[]; // ["CPU", "Central", "Jaro CPU"]
  category: "university" | "mall" | "hospital" | "plaza" | "terminal" | "landmark";
  district: "City Proper" | "Jaro" | "Molo" | "Mandurriao" | "Lapaz" | "Arevalo" | "Lapuz";
  location: [number, number]; // [lat, lng]
}
```

---

## 6. Routing, Fare & Ranking Logic

The routing engine executes client-side using Turf.js:

1. **Origin & Destination Snapping:** Calculates minimum Haversine distance from origin and destination to all route polylines (walking buffer: 500m default, expandable to 1,000m).
2. **Direct Routes (0 Transfers):** Matches routes passing both origin and destination in the correct travel order.
3. **1-Transfer Routes (1 Transfer):** Evaluates route pairs ($Route_A$ near origin, $Route_B$ near destination) that intersect within 250m at transfer hubs (e.g. SM City, Jaro Plaza, Festive Walk).
4. **Calculations:**
   - Walking Speed: 4.5 km/h (~75 m/min).
   - Jeepney Speed: 22 km/h (~367 m/min).
   - Transfer Wait Penalty: +7 mins per transfer.
   - Fare Formula: Base fare for first 4 km + $\lceil d - 4 \rceil \times \text{perKmRate}$ for succeeding distance.
5. **Route Classification:**
   - ⚡ **Fastest:** Minimum total duration.
   - 🔄 **Fewest Transfers:** Direct single-jeepney routes prioritized.
   - 🛣️ **Alternate / Longest:** Alternative scenic or detour paths across districts.

---

## 7. Curated Seed Dataset (Initial V1 Routes)

Modeled after official LPTRP Iloilo routes:
1. **Route 3:** Ungka Terminal to City Proper via CPU / Jaro Plaza
2. **Route 13:** Mohon Terminal to City Proper via Villa Arevalo / Infante
3. **Route 5:** Festive Walk / Megaworld to City Proper via SM City & Diversion Road
4. **Route 4:** Ungka Terminal to City Proper via Diversion Road
5. **Route 10:** Tagbak Terminal to City Proper via Lapaz Plaza

---

## 8. Git & Deployment Plan

1. Codebase resides in `/Users/michaeljohnsubigca/Work/JEEPNEY PROJECT`.
2. Clean Next.js 14 App Router structure with TypeScript and Tailwind CSS.
3. Deployable directly to Vercel via GitHub with zero backend server dependencies.
