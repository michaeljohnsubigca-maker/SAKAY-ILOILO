# Design Specification: Iloilo City Jeepney Route Planner

**Date:** 2026-09-18  
**Project Path:** `/Users/michaeljohnsubigca/Work/JEEPNEY PROJECT`  
**Status:** Approved for Implementation Planning  

---

## 1. Executive Summary & Goals

The **Iloilo City Jeepney Route Planner** is a deployable, mobile-responsive web application designed to help commuters navigate public utility jeepneys (both modernized PUVs and traditional PUJs) across Iloilo City, Philippines.

Users enter their departure point and destination (via landmark search, map pin drop, or device GPS) to receive optimized route recommendations showing:
- **Fastest Route** (least estimated transit time)
- **Fewest Transfers** (prioritizing direct single-jeepney rides)
- **Longest / Alternate Routes** (scenic or alternative paths)
- **LTFRB Fare Estimates** (regular vs. student/senior/PWD discounted rates)
- **Service Availability** (operating hours and off-hours warnings)
- **Step-by-Step Navigation Directions** (walking legs + jeepney ride legs + transfer points)

---

## 2. Technology Stack & Deployment

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS (mobile-first, responsive)
- **Mapping & GIS:** 
  - Leaflet with React wrapper (`react-leaflet` or dynamic Leaflet container)
  - Map tiles: OpenStreetMap / CartoDB Positron (100% free, no credit card or API key required)
  - Spatial math: `@turf/turf` (Haversine distance, line snapping, point-to-line calculations)
- **Deployment Platform:** Vercel (zero-cost static/hybrid hosting with instant CI/CD from GitHub)
- **Data Persistence:** Static JSON datasets version-controlled via Git in the repository.

---

## 3. Data Architecture & Schema

All route and landmark data resides in structured static JSON files in `data/`, curated directly by the project maintainer.

### 3.1 Route Data Schema (`data/routes/*.json` or bundled `data/routes.json`)

```typescript
export interface RouteStop {
  id: string;
  name: string; // e.g., "CPU Gate 1", "Jaro Plaza", "SM City Iloilo"
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
    firstTrip: string; // "05:00" (24-hour format)
    lastTrip: string; // "22:00"
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

### 3.2 Landmarks / POI Schema (`data/pois.json`)

Curated list of Iloilo City landmarks for zero-latency autocomplete:

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

Initial seed landmarks will include:
- **Universities:** CPU, UP Visayas (City Campus), University of San Agustin (USA), WVSU, ISAT-U, St. Paul University.
- **Malls & Commercial Hubs:** SM City Iloilo, Festive Walk Mall / Megaworld, Robinsons Place Iloilo, Atria Park District, Gaisano ICC.
- **Plazas & Districts:** Jaro Plaza, Molo Plaza, Plaza Libertad, Lapaz Plaza, Mandurriao Plaza, Villa Arevalo Plaza.
- **Terminals & Key Junctions:** Tagbak Terminal, Ungka Terminal, Mohon Terminal, Infante, General Luna.

---

## 4. Routing & Recommendation Engine

The routing engine executes entirely on the client side, offering instant computation with no backend network latency.

### 4.1 Step 1: Origin & Destination Snapping
- Commuter selects Origin ($O$) and Destination ($D$).
- For each route in the database, calculate the minimum distance from $O$ and $D$ to the route waypoints using Turf.js.
- A route is considered accessible if its path passes within a walking buffer ($R_{walk} \le 600\text{m}$, expandable up to $1,000\text{m}$).

### 4.2 Step 2: Direct Routes (0 Transfers)
- Check all routes accessible at both $O$ and $D$.
- Verify directionality: the boarding waypoint index must precede the alighting waypoint index along the route path (or handle bidirectional travel).
- Calculate:
  - Walk to boarding stop: $d_{walk1}$
  - Ride segment: $d_{ride}$
  - Walk from alighting stop to destination: $d_{walk2}$

### 4.3 Step 3: Multi-Leg Routes (1 Transfer)
- Pair candidate routes accessible from $O$ ($Route_A$) with routes accessible from $D$ ($Route_B$).
- Identify transfer intersections where $Route_A$ waypoints/stops come within $250\text{m}$ of $Route_B$ waypoints/stops (e.g. SM City, Festive Walk, Jaro Plaza, Plaza Libertad).
- Validate transfer validity: verify that riding $Route_A$ makes forward progress toward $D$ rather than backtracking.
- Calculate:
  - Walk $O \to Stop_{A1}$
  - Ride $Route_A \to Transfer$
  - Transfer buffer wait (~7 mins) + Walk between transfer stops ($d_{transfer\_walk}$)
  - Ride $Route_B \to Stop_{B2}$
  - Walk $Stop_{B2} \to D$

### 4.4 Step 4: Time, Distance, and Classification
- **Walking Speed:** $4.5\text{ km/h}$ (~$75\text{ m/min}$).
- **Jeepney Urban Speed:** $22\text{ km/h}$ (~$367\text{ m/min}$) accounting for passenger boarding and traffic.
- **Transfer Penalty:** $+7$ minutes added per transfer.
- **Ranking Categories:**
  - ⚡ **Fastest Route:** Lowest total duration ($T_{total} = T_{walk} + T_{ride} + T_{wait}$).
  - 🔄 **Fewest Transfers:** Direct routes prioritized.
  - 🛣️ **Longest / Alternate Route:** Valid routes with longest path or alternative routing.

### 4.5 Step 5: Fare Calculation
For each jeepney leg with riding distance $d$ km:
- **Regular:** $d \le 4\text{ km} \implies \text{baseFareRegular}$; else $\text{baseFareRegular} + \lceil d - 4 \rceil \times \text{perKmRegular}$.
- **Discounted:** $d \le 4\text{ km} \implies \text{baseFareDiscounted}$; else $\text{baseFareDiscounted} + \lceil d - 4 \rceil \times \text{perKmDiscounted}$.
- Total fare is the sum of fares for each boarding leg.

---

## 5. User Experience & Interface Design

### 5.1 Main Layout
- **Full-Screen Map:** Interactive Leaflet canvas centered on Iloilo City coordinates (`10.7202, 122.5621`).
- **Floating Search Card:**
  - Origin Input (with GPS "My Location" button, landmark autocomplete, and "Pick on map").
  - Destination Input (with landmark autocomplete and "Pick on map").
  - Swap Button (⇅) to reverse start and end locations.
  - Fare Type Toggle (Regular / Student, Senior & PWD).

### 5.2 Results Drawer / Bottom Sheet
- Displays route options grouped with badges:
  - `FASTEST` (Green badge)
  - `DIRECT` (Blue badge)
  - `ALTERNATE` (Gray badge)
- Key metrics at a glance:
  - Total Estimated Time (e.g. `~24 mins`)
  - Estimated Fare (e.g. `₱15.00`)
  - Route codes (e.g. `[Route 3: CPU - Ungka]` or `[Route 13] ➔ [Route 5]`)
  - Operating Hours status (e.g. `Operating Now` or `Off-hours`).

### 5.3 Detailed Trip Inspection
- Clicking any route card:
  - Pans and zooms the map to fit the full journey bounds.
  - Highlights the route polylines in vivid colors.
  - Renders dashed lines for walking legs.
  - Renders transfer nodes with clear icons.
  - Expands step-by-step turn-by-turn guidance:
    1. 🚶 Walk 120m to CPU Gate 1 (~2 mins)
    2. 🚐 Board Route 3 (CPU - Ungka) Modern PUV towards City Proper (14 mins, 4.2 km)
    3. 🔄 Alight at Jaro Plaza; walk 50m to transfer bay (~1 min)
    4. 🚐 Board Route 10 towards Lapaz (7 mins, 2.1 km)
    5. 🏁 Arrive at destination.

---

## 6. Curated Seed Dataset (Initial V1 Routes)

The initial version will include key representative Iloilo routes modeled after the LPTRP network:
1. **Route 3:** Ungka Terminal to City Proper via CPU / Jaro
2. **Route 13:** Mohon Terminal to City Proper via Villa Arevalo / Infante
3. **Route 5:** Festive Walk / Megaworld to City Proper via SM City & Diversion Road
4. **Route 4:** Ungka Terminal to City Proper via Diversion Road
5. **Route 10:** Tagbak Terminal to City Proper via Lapaz

Each route includes validated street coordinates, landmark stops, operating schedules, and official LTFRB fare parameters.

---

## 7. Future Roadmap (Parked for V2+)

- **Collaborator Visual Route Creator:** Web-based visual polyline drawing and stop placement tool with JSON export.
- **Live Crowdsourced Availability / Crowding:** Reporting if jeepneys are full or infrequent.
- **Real-Time GTFS-RT Telemetry:** GPS vehicle tracking if city modernized PUVs deploy public APIs.

---

## 8. Verification & Acceptance Criteria

1. **Routing Accuracy:** Querying Origin and Destination pairs across Iloilo (e.g., CPU to SM City, Mohon to Festive Walk) correctly identifies direct and 1-transfer routes.
2. **Fare Precision:** Distance-based calculations match standard LTFRB fare matrices for regular and discounted passengers.
3. **Performance:** Route search completes under 100ms on client mobile browsers.
4. **Map Fluidity:** Leaflet tiles load reliably without API keys, zooming and panning smoothly.
5. **Deployment:** Zero-config build and deployment on Vercel with responsive mobile and desktop viewports.
