# SakayIloilo - Iloilo City Jeepney Route Planner & Live Map

SakayIloilo is a high-utility, hyper-legible public transit wayfinding web application designed for commuters navigating modernized PUVs and traditional jeepney networks under Iloilo City's Local Public Transport Route Plan (LPTRP).

## Key Features
- **Origin & Destination Search:** Instant landmark autocomplete (CPU, SM City, Festive Walk, Jaro Plaza, Molo, Plazas, Terminals), map pin click, or GPS location.
- **Direct & Multi-Hop Transfer Routing:** Finds direct routes and 1-2 transfer journeys across Iloilo's districts.
- **Route Classification:** Highlights **⚡ Fastest Route**, **🔄 Fewest Transfers**, and **🛣️ Longest / Alternate Paths**.
- **LTFRB Fare Matrix:** Automatic distance calculations with instant toggle between Regular and Student/Senior/PWD discounted fares.
- **Interactive Map:** Leaflet map with CartoDB Positron tiles, route glowing polylines, walking dashed lines, and custom SVG markers.

## LPTRP Routes Supported
- **Route 1:** Bo. Obrero to Iloilo City Proper via Lapuz
- **Route 2:** Mohon to Iloilo City Proper via Molo
- **Route 3:** Ungka ITGSI to Iloilo City Proper via CPU
- **Route 4:** Ungka ITGSI to Iloilo City Proper via Diversion Road / Festive Walk
- **Route 5:** Mandurriao to Iloilo City Proper via Festive Walk & General Luna
- **Route 10:** Buntatala Tagbak to Iloilo City Proper via Coastal Road
- **Route 12:** Mandurriao to Molo via Festive Walk
- **Route 14:** Bito-on to Jaro via Balabago
- **Route 21:** Tagbak to Festive Walk via SM City
- **Route 22:** Ungka to Mohon via C1 Road & Sooc

## Local Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests
```bash
npm test
```

## Production Build & Verification
```bash
npx tsc --noEmit
npm run build
```

## Deploying to Vercel
Push to GitHub and import the repository into Vercel. Zero environment variables required!
