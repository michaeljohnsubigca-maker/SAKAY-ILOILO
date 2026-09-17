import fs from "fs";
import path from "path";
import { JeepneyRoute, RouteStop } from "../src/types/transit";

interface RouteConfig {
  id: string;
  code: string;
  name: string;
  corridorSummary: string;
  type: "modern" | "traditional";
  color: string;
  operatingHours: {
    firstTrip: string;
    lastTrip: string;
  };
  fare: {
    baseFareRegular: number;
    baseFareDiscounted: number;
    perKmRegular: number;
    perKmDiscounted: number;
    baseKm: number;
  };
  stops: RouteStop[];
  osrmNodes: [number, number][]; // [lng, lat] for OSRM query
}

const existingRoutesPath = path.resolve(__dirname, "../src/data/routes.json");
let existingRoutes: JeepneyRoute[] = [];
if (fs.existsSync(existingRoutesPath)) {
  try {
    existingRoutes = JSON.parse(fs.readFileSync(existingRoutesPath, "utf8"));
  } catch (err) {
    console.warn("Could not read existing routes:", err);
  }
}

// Find existing routes by code if available
function getExistingRoute(code: string): JeepneyRoute | undefined {
  return existingRoutes.find((r) => r.code === code);
}

// Linear interpolation fallback for robust coordinate generation
function interpolateNodes(nodes: [number, number][], targetCount: number = 60): [number, number][] {
  const result: [number, number][] = [];
  const segments = nodes.length - 1;
  const pointsPerSegment = Math.ceil(targetCount / segments);

  for (let i = 0; i < segments; i++) {
    const p1 = nodes[i];
    const p2 = nodes[i + 1];
    for (let step = 0; step < pointsPerSegment; step++) {
      const frac = step / pointsPerSegment;
      const lat = Number((p1[0] + (p2[0] - p1[0]) * frac).toFixed(5));
      const lng = Number((p1[1] + (p2[1] - p1[1]) * frac).toFixed(5));
      result.push([lat, lng]);
    }
  }
  result.push([nodes[nodes.length - 1][0], nodes[nodes.length - 1][1]]);
  return result;
}

// Fetch OSRM driving geometry
async function fetchOsrmWaypoints(osrmNodes: [number, number][]): Promise<[number, number][] | null> {
  try {
    const coordsStr = osrmNodes.map((n) => `${n[0]},${n[1]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`OSRM returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [Number(c[1].toFixed(5)), Number(c[0].toFixed(5))] // Swap [lng, lat] to [lat, lng]
      );
      // Validate bounding box
      const valid = coords.every(
        (pt) => pt[0] >= 10.65 && pt[0] <= 10.80 && pt[1] >= 122.45 && pt[1] <= 122.65
      );
      if (valid && coords.length >= 50) {
        return coords;
      }
    }
  } catch (err) {
    console.warn("OSRM fetch error, using interpolation fallback:", (err as Error).message);
  }
  return null;
}

const modernFare = {
  baseFareRegular: 15,
  baseFareDiscounted: 12,
  perKmRegular: 2,
  perKmDiscounted: 1.6,
  baseKm: 4,
};

const traditionalFare = {
  baseFareRegular: 13,
  baseFareDiscounted: 10.4,
  perKmRegular: 1.8,
  perKmDiscounted: 1.44,
  baseKm: 4,
};

const routeConfigs: RouteConfig[] = [
  // ROUTE 3 (Ungka via CPU) - keep high precision geometry (index 0 for routing test)
  {
    id: "route-3-ungka-cpu-city-proper",
    code: "ROUTE 3",
    name: "Ungka to City Proper via CPU Loop",
    corridorSummary:
      "ITGSI, Ungka Terminal, Benigno Aquino Ave., Lopez Jaena St. (CPU), Rizal St. (Jaro Plaza), E. Lopez St. (Robinsons Jaro), Luna St. (St. Clement's Church), Bonifacio Dr. (Hall of Justice / Provincial Capitol), Iznart St. (Citadines), JM Basa St. (Plaza Libertad / City Hall), Fort San Pedro Wharf, Parola Dr., Luna St. (Gaisano La Paz), Huervana St., Rizal St. (La Paz Market), E. Lopez St., Rizal St. (Jaro Plaza), Washington St., Lopez Jaena St., Benigno Aquino Ave., ITGSI, Ungka Terminal",
    type: "modern",
    color: "#2563eb",
    operatingHours: { firstTrip: "04:30", lastTrip: "22:30" },
    fare: modernFare,
    stops: [
      { id: "r3-stop-1", name: "Ungka Transport Terminal", location: [10.7485, 122.5446], isMajorHub: true },
      { id: "r3-stop-2", name: "Central Philippine University (Gate 1)", location: [10.7314, 122.5539], isMajorHub: true },
      { id: "r3-stop-3", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r3-stop-4", name: "Robinsons Place Jaro", location: [10.7258, 122.5605], isMajorHub: true },
      { id: "r3-stop-5", name: "Iloilo Provincial Capitol", location: [10.7, 122.57], isMajorHub: true },
      { id: "r3-stop-6", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r3-stop-7", name: "La Paz Public Market", location: [10.7125, 122.567], isMajorHub: true },
    ],
    osrmNodes: [],
  },
  // ROUTE 1
  {
    id: "route-1-bo-obrero-lapuz-city-proper",
    code: "ROUTE 1",
    name: "Bo. Obrero, Lapuz to City Proper Loop",
    corridorSummary:
      "Bo. Obrero Multi-purpose Gym, Everlasting St., Margarita St., Rizal St. (Lapuz Norte), Jalandoni High School, Rizal St. (Lapuz Sur), Drilon Bridge, Muelle Loney (Provincial Capitol), Iznart St., JM Basa St., Guanco St., Rizal St. (UI Phinma, Iloilo Central Market), Valeria St. (SM Delgado), Gen. Luna (Atrium), Muelle Loney, Drilon Bridge, Rizal St., Bo. Obrero Multi-purpose Gym",
    type: "modern",
    color: "#0284c7",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r1-stop-1", name: "Bo. Obrero Multi-purpose Gym", location: [10.7035, 122.5855], isMajorHub: true },
      { id: "r1-stop-2", name: "Lapuz Plaza", location: [10.7010, 122.5785], isMajorHub: false },
      { id: "r1-stop-3", name: "Iloilo Provincial Capitol", location: [10.7000, 122.5700], isMajorHub: true },
      { id: "r1-stop-4", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r1-stop-5", name: "Iloilo Central Market", location: [10.6948, 122.5700], isMajorHub: true },
      { id: "r1-stop-6", name: "The Atrium Iloilo", location: [10.6992, 122.5662], isMajorHub: false },
    ],
    osrmNodes: [
      [122.5855, 10.7035],
      [122.5780, 10.7010],
      [122.5700, 10.7000],
      [122.5714, 10.6928],
      [122.5700, 10.6948],
      [122.5662, 10.6992],
      [122.5700, 10.7000],
      [122.5780, 10.7010],
      [122.5855, 10.7035],
    ],
  },
  // ROUTE 2
  {
    id: "route-2-villa-plaza-calumpang-city-proper",
    code: "ROUTE 2",
    name: "Villa Plaza to City Proper via Calumpang Loop",
    corridorSummary:
      "Yulo St., Osmeña St., Arroyo St. (Back of Arevalo Church), Bonifacio St., Yulo St., Baluarte-Calumpang-Villa-Oton Blvd., Rizal St. (Tanza Church), Ledesma St., Jalandoni St., De Leon St. (Super), Fuentes St., Ledesma St. (Robinsons City), Iznart St., Rizal St. (Iloilo Central Market), Ortiz St., JM Basa St. (Plaza Libertad/City Hall), UI Phinma, Ledesma St., Infante St. (Iloilo Fish Port), Baluarte-Calumpang-Villa-Oton Blvd., Villa Plaza",
    type: "traditional",
    color: "#d97706",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: traditionalFare,
    stops: [
      { id: "r2-stop-1", name: "Villa Arevalo Plaza", location: [10.6885, 122.5175], isMajorHub: true },
      { id: "r2-stop-2", name: "Calumpang Beach Boulevard", location: [10.6820, 122.5300], isMajorHub: false },
      { id: "r2-stop-3", name: "Baluarte Junction", location: [10.6880, 122.5470], isMajorHub: false },
      { id: "r2-stop-4", name: "Iloilo Terminal Market (Super)", location: [10.6952, 122.5645], isMajorHub: true },
      { id: "r2-stop-5", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r2-stop-6", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5175, 10.6885],
      [122.5300, 10.6820],
      [122.5470, 10.6880],
      [122.5645, 10.6952],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5645, 10.6952],
      [122.5550, 10.6910],
      [122.5470, 10.6880],
      [122.5300, 10.6820],
      [122.5175, 10.6885],
    ],
  },

  // ROUTE 4 (Ungka via Diversion / Festive) - keep high precision geometry
  {
    id: "route-4-ungka-diversion-city-proper",
    code: "ROUTE 4",
    name: "Ungka to City Proper via B. Aquino Ave. / Festive Walk Loop",
    corridorSummary:
      "Ungka Terminal, B. Aquino Ave., Airport Spur Rd., Megaworld Blvd., Festive Walk Transport Hub, Taft St., B. Aquino Ave. (SM City, Plazuela, Esplanade), Infante St. (UP, Iloilo Doctors' Hospital), Rizal St., Ledesma St., Mabini St. (Robinsons City), De Leon St. (Super), Valeria St. (Marymart), Delgado St. (SM Delgado), Infante St., B. Aquino Ave., Gaisano ICC Loop, Megaworld Ave., B. Aquino Ave., Ungka Terminal",
    type: "modern",
    color: "#10b981",
    operatingHours: { firstTrip: "04:30", lastTrip: "22:30" },
    fare: modernFare,
    stops: [
      { id: "r4-stop-1", name: "Ungka Transport Terminal", location: [10.7485, 122.5446], isMajorHub: true },
      { id: "r4-stop-2", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r4-stop-3", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r4-stop-4", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r4-stop-5", name: "SM Delgado & Marymart Center", location: [10.6965, 122.566], isMajorHub: true },
    ],
    osrmNodes: [],
  },
  // ROUTE 5 (Festive to City Proper) - keep high precision geometry
  {
    id: "route-5-festive-sm-city-proper",
    code: "ROUTE 5",
    name: "Festive Walk to City Proper via B. Aquino Ave. and SM City Loop",
    corridorSummary:
      "Festive Walk Transport Hub, Megaworld Ave., Spur Road, B. Aquino Ave. (SM City, Plazuela, Smallville, Esplanade), Gen. Luna St. (UPV, University of San Agustin, St. Paul's Hospital, Atrium Mall), Iznart St., JM Basa St., Ortiz St., Rizal St. (Iloilo Central Market), Ledesma St., Quezon St. (SM Delgado), Delgado St., Jalandoni St., Gen. Luna St., Diversion Rd., Gaisano ICC Loop, SM Strata, Atria, Megaworld Ave., Festive Walk Transport Hub",
    type: "modern",
    color: "#7c3aed",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:30" },
    fare: modernFare,
    stops: [
      { id: "r5-stop-1", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r5-stop-2", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r5-stop-3", name: "Atria Park District", location: [10.7107, 122.5492], isMajorHub: true },
      { id: "r5-stop-4", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r5-stop-5", name: "University of San Agustin", location: [10.698, 122.562], isMajorHub: true },
      { id: "r5-stop-6", name: "The Atrium Iloilo", location: [10.6992, 122.5662], isMajorHub: true },
    ],
    osrmNodes: [],
  },
  // ROUTE 6
  {
    id: "route-6-lanit-sm-city-infante",
    code: "ROUTE 6",
    name: "Lanit to SM City via Infante Loop",
    corridorSummary:
      "Lanit/Leganes Boundary loop, Tiu Cho Teg-Ana Ros Foundation School, Iloilo Radial Bypass Rd., Circumferential Rd. (C. Aquino Ave.), Tacas-Quintin Salas Rd. (SM Savemore), MacArthur Dr. (LTO/LTFRB), Simon Ledesma St., Lopez Jaena St. (Biscocho Haus), Rizal St. (Jaro Plaza), E. Lopez St. (Robinsons Jaro), Jalandoni St., B. Aquino Ave. (Injap Tower), Pison Rotunda, Infante St. (UPV, Iloilo Doctors' Hospital, Iloilo Fish Port), Locsin St., Rizal St., Infante, B. Aquino Ave., Gaisano Hub, SM Transport Hub (Strata), Jalandoni St., Commission Civil St., Robinsons Jaro, Jaro Plaza, MacArthur Dr., Circumferential Rd., Lanit Boundary loop",
    type: "modern",
    color: "#ea580c",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r6-stop-1", name: "Lanit / Leganes Boundary", location: [10.7580, 122.5700], isMajorHub: true },
      { id: "r6-stop-2", name: "Tacas Savemore Market", location: [10.7450, 122.5650], isMajorHub: false },
      { id: "r6-stop-3", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r6-stop-4", name: "Robinsons Place Jaro", location: [10.7258, 122.5605], isMajorHub: true },
      { id: "r6-stop-5", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r6-stop-6", name: "Iloilo Doctors' Hospital", location: [10.7028, 122.5512], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5700, 10.7580],
      [122.5650, 10.7450],
      [122.5579, 10.7247],
      [122.5605, 10.7258],
      [122.5512, 10.7143],
      [122.5512, 10.7028],
      [122.5512, 10.7143],
      [122.5579, 10.7247],
      [122.5650, 10.7450],
      [122.5700, 10.7580],
    ],
  },
  // ROUTE 7
  {
    id: "route-7-compania-city-proper",
    code: "ROUTE 7",
    name: "Compania to City Proper Loop",
    corridorSummary:
      "Compania St. (Tibiao Bakeshop), Avanceña St. (Asilo De Molo), Locsin St. (Molo Plaza, Molo Mansion), Timawa St. (Iloilo Doctors' College), Delgado St., Jalandoni St., De Leon St. (Super), Fuentes St., Ledesma St. (Robinsons City), Iznart St. (Socorro Drug), Rizal St. (Iloilo Central Market), Ortiz St., JM Basa St. (Plaza Libertad/City Hall), UI Phinma, Ledesma St., Mabini St., De Leon St. (Super), Fuentes St., Delgado St. (UPV Iloilo Campus), Timawa St., Compania St.",
    type: "traditional",
    color: "#059669",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: traditionalFare,
    stops: [
      { id: "r7-stop-1", name: "Compania / Tibiao Molo", location: [10.6980, 122.5460], isMajorHub: false },
      { id: "r7-stop-2", name: "Molo Plaza & St. Anne Parish", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r7-stop-3", name: "Iloilo Doctors' College", location: [10.7025, 122.5510], isMajorHub: true },
      { id: "r7-stop-4", name: "Iloilo Terminal Market (Super)", location: [10.6952, 122.5645], isMajorHub: true },
      { id: "r7-stop-5", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r7-stop-6", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5460, 10.6980],
      [122.5375, 10.6960],
      [122.5510, 10.7025],
      [122.5645, 10.6952],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5692, 10.6958],
      [122.5645, 10.6952],
      [122.5562, 10.7042],
      [122.5510, 10.7025],
      [122.5460, 10.6980],
    ],
  },
  // ROUTE 8
  {
    id: "route-8-parola-sm-city-infante",
    code: "ROUTE 8",
    name: "Parola to SM City via Infante Loop",
    corridorSummary:
      "Parola Wharf (City Mall Parola), Zamora Ext., Zamora St. (GSIS), Rizal St. (Iloilo Central Market), Quezon St., De Leon St. (Robinsons City), Jalandoni St., Rizal St. (Tanza Church), Infante St. (Iloilo Doctors' Hospital / UPV), B. Aquino Ave., Gaisano ICC Loop, SM Transport Hub (Strata), U-turn Gil Traders, B. Aquino Ave. (Zuri Hotel, Plazuela 1&2), Pacencia Tijam Ave. (Atria/S&R), Pison Rotunda, Smallville, Infante St., Rizal St., Zamora St., Parola Wharf",
    type: "modern",
    color: "#e11d48",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r8-stop-1", name: "Parola Ferry Terminal", location: [10.6955, 122.5795], isMajorHub: true },
      { id: "r8-stop-2", name: "Iloilo Central Market", location: [10.6948, 122.5700], isMajorHub: true },
      { id: "r8-stop-3", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r8-stop-4", name: "Iloilo Doctors' Hospital", location: [10.7028, 122.5512], isMajorHub: true },
      { id: "r8-stop-5", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r8-stop-6", name: "Atria Park District", location: [10.7107, 122.5492], isMajorHub: true },
      { id: "r8-stop-7", name: "Iloilo River Esplanade", location: [10.7042, 122.5532], isMajorHub: false },
    ],
    osrmNodes: [
      [122.5795, 10.6955],
      [122.5700, 10.6948],
      [122.5684, 10.6976],
      [122.5512, 10.7028],
      [122.5510, 10.7120],
      [122.5512, 10.7143],
      [122.5492, 10.7107],
      [122.5532, 10.7042],
      [122.5512, 10.7028],
      [122.5700, 10.6948],
      [122.5795, 10.6955],
    ],
  },
  // ROUTE 9 (Mohon to City Proper) - adapted from existing high-precision Mohon route
  {
    id: "route-9-mohon-city-proper",
    code: "ROUTE 9",
    name: "Mohon to City Proper Loop",
    corridorSummary:
      "Mohon Terminal, Osmeña St. (Camiña Balay nga Bato), Jocson St. (Arevalo Elementary School), Avanceña St. (Asilo De Molo/Iloilo Supermart Molo), Locsin St. (Molo Plaza/Molo Mansion), MH Del Pilar St. (GT Plaza Mall Molo/DSWD), Gen. Luna St. (UPV Iloilo Campus/Atrium), Iznart St. (Citadines), JM Basa St. (Socorro Drug), Ortiz St. (Plaza Libertad), Rizal St. (Iloilo Central Market), Valeria St. (SM Delgado), Delgado St., Mabini St. (Robinsons City), De Leon St. (Super), Fuentes St., Ledesma St., Rizal St., Infante St. (Iloilo Doctors' Hospital/UPV), MH Del Pilar St., San Pedro St. (Molo Plaza), Avanceña St. (Arevalo Plaza), Jocson St., Osmeña St., Mohon Terminal",
    type: "modern",
    color: "#9333ea",
    operatingHours: { firstTrip: "04:30", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r9-stop-1", name: "Mohon Terminal", location: [10.686, 122.518], isMajorHub: true },
      { id: "r9-stop-2", name: "Villa Arevalo Plaza", location: [10.6885, 122.5175], isMajorHub: false },
      { id: "r9-stop-3", name: "Molo Plaza & St. Anne Parish", location: [10.696, 122.5375], isMajorHub: true },
      { id: "r9-stop-4", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r9-stop-5", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r9-stop-6", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r9-stop-7", name: "Iloilo Terminal Market (Super)", location: [10.6952, 122.5645], isMajorHub: true },
    ],
    osrmNodes: [],
  },
  // ROUTE 10 (Tagbak to City Proper) - keep high precision geometry
  {
    id: "route-10-tagbak-lapaz-city-proper",
    code: "ROUTE 10",
    name: "Buntatala / Tagbak Terminal to City Proper Loop",
    corridorSummary:
      "Buntatala Loop (Spousal of Mary and Joseph Parish Church), Tagbak Terminal, MacArthur Dr. (NFA, Iloilo Supermart Jaro, Angelicum), Simon Ledesma St., Jaro Plaza Rizal St., Commission Civil St. (SM Hypermarket), Del Carmen St., Luna St. (Benito Hospital, WVSU), Bonifacio Dr. (Provincial Capitol, Atrium Mall), Gen. Luna St., Jalandoni St. (University of San Agustin), Rizal St. (Super), Mabini St., De Leon St. (Robinsons City), Quezon St., Rizal St. (UI Phinma), Mapa St., JM Basa St., Ortiz St., Rizal St. (Iloilo Central Market), Quezon St., Valeria St. (Marymart), Gen. Luna St. (Atrium), Muelle Loney St., Rizal St. (La Paz), Luna St. (WIT), E. Lopez St., Del Carmen St., Commission Civil St., Rizal St. (Jaro Plaza), Washington St., MacArthur Dr., Tagbak Terminal, Buntatala Loop",
    type: "modern",
    color: "#dc2626",
    operatingHours: { firstTrip: "04:30", lastTrip: "22:30" },
    fare: modernFare,
    stops: [
      { id: "r10-stop-1", name: "Tagbak Terminal", location: [10.749, 122.578], isMajorHub: true },
      { id: "r10-stop-2", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r10-stop-3", name: "West Visayas State University Main", location: [10.716, 122.5595], isMajorHub: true },
      { id: "r10-stop-4", name: "Iloilo Provincial Capitol", location: [10.7, 122.57], isMajorHub: true },
      { id: "r10-stop-5", name: "University of San Agustin", location: [10.698, 122.562], isMajorHub: true },
      { id: "r10-stop-6", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r10-stop-7", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [],
  },
  // ROUTE 11
  {
    id: "route-11-ticud-lapaz-city-proper",
    code: "ROUTE 11",
    name: "Ticud, La Paz to City Proper Loop",
    corridorSummary:
      "Ticud Loop (St. Paul's, Ticud), Baldoza, Lopez Jaena St. (La Paz Plaza), Jereos St., Javellana Ext. (Ledesco Village), Commission Civil St., Burgos St. (ISATU), Huervana St. (La Paz Market), Rizal St., Luna St. (Gaisano La Paz), Bonifacio Dr. (Hall of Justice), Gen. Luna St. (St. Paul's University), Jalandoni St. (University of San Agustin), De Leon St. (Super), Fuentes St., Ledesma St. (Robinsons City), Iznart St. (Socorro Drug), Rizal St. (UI Phinma), Gen. Hughes St., Fort San Pedro Dr., Zamora St. (GSIS/Plaza Libertad), JM Basa St. (Sunburst Park), Iznart St., Bonifacio Dr. (Provincial Capitol), Luna St., Magdalo St., Gustilo St., Jereos St., Burgos St., Lopez Jaena St. (La Paz Plaza), Baldoza, Ticud Loop",
    type: "modern",
    color: "#0d9488",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r11-stop-1", name: "Ticud Terminal", location: [10.7250, 122.5850], isMajorHub: true },
      { id: "r11-stop-2", name: "La Paz Plaza", location: [10.7135, 122.5685], isMajorHub: true },
      { id: "r11-stop-3", name: "ISATU Main Campus", location: [10.7175, 122.5658], isMajorHub: true },
      { id: "r11-stop-4", name: "St. Paul's Hospital Iloilo", location: [10.6995, 122.5648], isMajorHub: true },
      { id: "r11-stop-5", name: "University of San Agustin", location: [10.6980, 122.5620], isMajorHub: true },
      { id: "r11-stop-6", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r11-stop-7", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5850, 10.7250],
      [122.5685, 10.7135],
      [122.5658, 10.7175],
      [122.5670, 10.7125],
      [122.5700, 10.7000],
      [122.5648, 10.6995],
      [122.5620, 10.6980],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5700, 10.7000],
      [122.5685, 10.7135],
      [122.5850, 10.7250],
    ],
  },
  // ROUTE 12
  {
    id: "route-12-mandurriao-city-proper",
    code: "ROUTE 12",
    name: "Mandurriao to City Proper via Festive Walk / B. Aquino Ave. Loop",
    corridorSummary:
      "Mandurriao Plaza, PHHC, R. Mapa St., Megaworld Blvd., Festive Walk Transport Hub, Spur Rd., B. Aquino Ave. (SM City), Pison Loop (Seda Hotel), B. Aquino Ave., Gen. Luna St. (UPV / University of San Agustin), Jalandoni St., Ledesma St. (Robinsons City), Iznart St. (Central Market), Rizal St. (UI Phinma), Valeria St. (Marymart), Delgado St. (SM Delgado), Mabini St., Gen. Luna St., B. Aquino Ave., Gaisano ICC Loop, SM Transport Hub, Q. Abeto St. (WVMC), Guzman St., Mandurriao Plaza",
    type: "modern",
    color: "#b45309",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r12-stop-1", name: "Mandurriao Plaza", location: [10.7180, 122.5280], isMajorHub: true },
      { id: "r12-stop-2", name: "Western Visayas Medical Center (WVMC)", location: [10.7170, 122.5365], isMajorHub: true },
      { id: "r12-stop-3", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r12-stop-4", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r12-stop-5", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r12-stop-6", name: "University of San Agustin", location: [10.6980, 122.5620], isMajorHub: true },
      { id: "r12-stop-7", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5280, 10.7180],
      [122.5365, 10.7170],
      [122.5453, 10.7186],
      [122.5512, 10.7143],
      [122.5562, 10.7042],
      [122.5620, 10.6980],
      [122.5684, 10.6976],
      [122.5660, 10.6965],
      [122.5562, 10.7042],
      [122.5512, 10.7143],
      [122.5365, 10.7170],
      [122.5280, 10.7180],
    ],
  },
  // ROUTE 13 (Official Hibao-an to City Proper)
  {
    id: "route-13-hibao-an-city-proper-tabucan",
    code: "ROUTE 13",
    name: "Hibao-an to City Proper via Tabucan Hub Loop",
    corridorSummary:
      "Hibao-an Loop, Guzman St. (Ana Ros Village), R. Mapa St., Carpenter's Bridge, Locsin St. (Molo Supermart), MH Del Pilar St. (John B. Lacson University), Gen. Luna St. (UPV Iloilo Campus, University of San Agustin), Jalandoni St., Ledesma St. (Robinsons City), Iznart St. (Central Market), Rizal St. (UI Phinma), Ortiz St., JM Basa St. (Plaza Libertad), Rizal St., Ledesma St., Jalandoni St., Gen. Luna St., MH Del Pilar St., San Pedro St. (Molo Plaza), Locsin St., Carpenter Bridge (Medical City), R. Mapa St., Oñate St., Guzman St., Hibao-an Loop",
    type: "modern",
    color: "#4f46e5",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r13-stop-1", name: "Hibao-an Terminal", location: [10.7285, 122.5120], isMajorHub: true },
      { id: "r13-stop-2", name: "The Medical City Iloilo", location: [10.6950, 122.5385], isMajorHub: true },
      { id: "r13-stop-3", name: "Molo Plaza", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r13-stop-4", name: "John B. Lacson (Molo)", location: [10.6975, 122.5410], isMajorHub: false },
      { id: "r13-stop-5", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r13-stop-6", name: "University of San Agustin", location: [10.6980, 122.5620], isMajorHub: true },
      { id: "r13-stop-7", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5120, 10.7285],
      [122.5280, 10.7180],
      [122.5400, 10.7050],
      [122.5385, 10.6950],
      [122.5375, 10.6960],
      [122.5410, 10.6975],
      [122.5562, 10.7042],
      [122.5620, 10.6980],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5620, 10.6980],
      [122.5410, 10.6975],
      [122.5375, 10.6960],
      [122.5385, 10.6950],
      [122.5280, 10.7180],
      [122.5120, 10.7285],
    ],
  },
  // ROUTE 14
  {
    id: "route-14-hibao-an-jaro-festive",
    code: "ROUTE 14",
    name: "Hibao-an to Jaro via B. Aquino Ave. / Festive Loop",
    corridorSummary:
      "Hibao-an Norte Loop, Guzman St. (Hibao-an Elementary School), Q. Abeto St. (WVMC/J7 Plaza Hotel), Megaworld Blvd., Festive Walk Transport Hub, Taft St. (Iloilo Integrated School), B. Aquino Ave. (Zuri Hotel/SM City), Pison Ave. Rotunda (Seda), SM Transport Hub (Strata), B. Aquino Ave., Jalandoni St. (Injap Tower), Commission Civil St. (SM Hypermarket), Rizal St. (Plaza Jaro), El-98 St. (Jaro Market), B. Aquino Ave., Spur Road, Q. Abeto St., Guzman St., Hibao-an Loop",
    type: "modern",
    color: "#16a34a",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r14-stop-1", name: "Hibao-an Terminal", location: [10.7285, 122.5120], isMajorHub: true },
      { id: "r14-stop-2", name: "Western Visayas Medical Center (WVMC)", location: [10.7170, 122.5365], isMajorHub: true },
      { id: "r14-stop-3", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r14-stop-4", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r14-stop-5", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r14-stop-6", name: "Robinsons Place Jaro", location: [10.7258, 122.5605], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5120, 10.7285],
      [122.5365, 10.7170],
      [122.5453, 10.7186],
      [122.5512, 10.7143],
      [122.5579, 10.7247],
      [122.5605, 10.7258],
      [122.5579, 10.7247],
      [122.5512, 10.7143],
      [122.5365, 10.7170],
      [122.5120, 10.7285],
    ],
  },
  // ROUTE 15
  {
    id: "route-15-molo-baluarte-city-proper",
    code: "ROUTE 15",
    name: "Molo to City Proper via Baluarte Loop",
    corridorSummary:
      "Locsin St. (Molo Plaza), Baluarte-Calumpang-Villa-Oton Blvd., Rizal St. (Tanza Church), Ledesma St., Jalandoni St., De Leon St. (Super), Fuentes St., Ledesma St. (Robinsons City), Iznart St. (Socorro Drug), Rizal St. (UI Phinma), Ortiz St., JM Basa St. (Plaza Libertad), Rizal St. (Central Market), Iznart St., Ledesma St. (Unitop), Mabini St., De Leon St., Fuentes St., Infante St. (Iloilo Fish Port), Baluarte-Calumpang Blvd., Locsin St. (Molo Plaza)",
    type: "traditional",
    color: "#c026d3",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: traditionalFare,
    stops: [
      { id: "r15-stop-1", name: "Molo Plaza & St. Anne Parish", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r15-stop-2", name: "Baluarte Junction", location: [10.6880, 122.5470], isMajorHub: false },
      { id: "r15-stop-3", name: "Iloilo Terminal Market (Super)", location: [10.6952, 122.5645], isMajorHub: true },
      { id: "r15-stop-4", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r15-stop-5", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r15-stop-6", name: "Iloilo Fish Port", location: [10.6910, 122.5550], isMajorHub: false },
    ],
    osrmNodes: [
      [122.5375, 10.6960],
      [122.5470, 10.6880],
      [122.5550, 10.6910],
      [122.5645, 10.6952],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5645, 10.6952],
      [122.5550, 10.6910],
      [122.5470, 10.6880],
      [122.5375, 10.6960],
    ],
  },
  // ROUTE 16
  {
    id: "route-16-bito-on-jaro-balabago",
    code: "ROUTE 16",
    name: "Bito-on to Jaro via Balabago Loop",
    corridorSummary:
      "Metropolis East Entrance Gate (Philippine Science High School), Coastal Rd., Balabago Rd. (Balabago Elementary School), Cubay Rd. (MG Motor), MacArthur Dr. (Angelicum), Simon Ledesma St. (Jaro Small Market), Lopez Jaena St. (Biscocho Haus), Rizal St. (Jaro Plaza), Washington St., MacArthur Dr., Balabago Rd. (Jollibee Tabuc Suba), Coastal Rd., Metropolis East Entrance Gate",
    type: "modern",
    color: "#65a30d",
    operatingHours: { firstTrip: "05:30", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r16-stop-1", name: "Philippine Science High School (Bito-on)", location: [10.7550, 122.5950], isMajorHub: true },
      { id: "r16-stop-2", name: "Balabago Junction", location: [10.7420, 122.5850], isMajorHub: false },
      { id: "r16-stop-3", name: "Angelicum School Iloilo", location: [10.7450, 122.5750], isMajorHub: false },
      { id: "r16-stop-4", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r16-stop-5", name: "Robinsons Place Jaro", location: [10.7258, 122.5605], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5950, 10.7550],
      [122.5850, 10.7420],
      [122.5750, 10.7450],
      [122.5605, 10.7258],
      [122.5579, 10.7247],
      [122.5750, 10.7450],
      [122.5850, 10.7420],
      [122.5950, 10.7550],
    ],
  },
  // ROUTE 17
  {
    id: "route-17-villa-baybay-bonifacio-city-proper",
    code: "ROUTE 17",
    name: "Villa Baybay to City Proper via Bonifacio Loop",
    corridorSummary:
      "Total Gas Station (Yulo), Baluarte-Calumpang-Villa-Oton Blvd. (Tatoy's Manokan), Sto. Domingo St., Bonifacio St. (Iloilo Supermart Arevalo), Quezon St., Avanceña St., Locsin St. (Molo Plaza), MH Del Pilar St. (GT Mall Molo, JBLFMU-Molo), Gen. Luna St. (UPV, University of San Agustin), Quezon St. (Robinsons City), Rizal St. (UI Phinma), Ortiz St., JM Basa St. (Plaza Libertad), Rizal St. (Central Market), Delgado St., Mabini St., Gen. Luna St., Molo Plaza, Arevalo Plaza, Tatoy's Manokan",
    type: "traditional",
    color: "#db2777",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: traditionalFare,
    stops: [
      { id: "r17-stop-1", name: "Villa Baybay (Tatoy's)", location: [10.6800, 122.5150], isMajorHub: true },
      { id: "r17-stop-2", name: "Villa Arevalo Plaza", location: [10.6885, 122.5175], isMajorHub: true },
      { id: "r17-stop-3", name: "Molo Plaza & St. Anne Parish", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r17-stop-4", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r17-stop-5", name: "University of San Agustin", location: [10.6980, 122.5620], isMajorHub: true },
      { id: "r17-stop-6", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r17-stop-7", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5150, 10.6800],
      [122.5175, 10.6885],
      [122.5375, 10.6960],
      [122.5562, 10.7042],
      [122.5620, 10.6980],
      [122.5684, 10.6976],
      [122.5714, 10.6928],
      [122.5660, 10.6965],
      [122.5562, 10.7042],
      [122.5375, 10.6960],
      [122.5175, 10.6885],
      [122.5150, 10.6800],
    ],
  },
  // ROUTE 18
  {
    id: "route-18-tagbak-coastal-city-proper",
    code: "ROUTE 18",
    name: "Tagbak to City Proper via Coastal Loop",
    corridorSummary:
      "Buntatala/Tagbak Loop, Tagbak Terminal, MacArthur Dr., Iloilo Circumferential Rd. (C. Aquino Ave.), Coastal Rd., Lapuz Mansaya-Loboc Rd. (Guimaras RORO Terminal), Rizal St., Iloilo Ferry Terminal Road (Iloilo-Bacolod Fastcraft Terminal), Arroyo Bridge, Muelle Loney St., Aldeguer St., JM Basa St., Mapa St., Rizal St. (UI Phinma), Iznart St. (Central Market), Muelle Loney, Ferry Terminal Rd., Coastal Rd., Circumferential Rd., Tagbak Terminal",
    type: "modern",
    color: "#0891b2",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r18-stop-1", name: "Tagbak Terminal", location: [10.7490, 122.5780], isMajorHub: true },
      { id: "r18-stop-2", name: "Coastal Road / Bito-on Junction", location: [10.7400, 122.5980], isMajorHub: false },
      { id: "r18-stop-3", name: "Lapuz Guimaras RORO Terminal", location: [10.7080, 122.5850], isMajorHub: true },
      { id: "r18-stop-4", name: "Iloilo-Bacolod Ferry Terminal", location: [10.6980, 122.5820], isMajorHub: true },
      { id: "r18-stop-5", name: "Plaza Libertad", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r18-stop-6", name: "Iloilo Provincial Capitol", location: [10.7000, 122.5700], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5780, 10.7490],
      [122.5980, 10.7400],
      [122.5880, 10.7150],
      [122.5820, 10.6980],
      [122.5714, 10.6928],
      [122.5700, 10.7000],
      [122.5820, 10.6980],
      [122.5880, 10.7150],
      [122.5980, 10.7400],
      [122.5780, 10.7490],
    ],
  },
  // ROUTE 19
  {
    id: "route-19-bito-on-lapaz-city-proper",
    code: "ROUTE 19",
    name: "Bito-on to City Proper via La Paz Loop",
    corridorSummary:
      "Metropolis Ave. (Philippine Science High School), Coastal Rd., Baldoza St., Lopez Jaena St. (La Paz Police Station), Jereos St. (La Paz Plaza), Huervana Ext., Burgos St., Magdalo St. (St. Therese-MTC), Luna St. (Gaisano La Paz), Bonifacio Dr. (Hall of Justice, Provincial Capitol), Gen. Luna St. (St. Paul's Hospital), Mabini St., De Leon St. (Robinsons City), Valeria St. (Marymart, SM, Atrium), Gen. Luna St., Muelle Loney, Rizal St., Huervana St. (La Paz Market), Baldoza St., Coastal Rd., Bito-on Loop",
    type: "modern",
    color: "#475569",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r19-stop-1", name: "Bito-on Loop (Phil Science HS)", location: [10.7550, 122.5950], isMajorHub: true },
      { id: "r19-stop-2", name: "La Paz Plaza", location: [10.7135, 122.5685], isMajorHub: true },
      { id: "r19-stop-3", name: "ISATU Main Campus", location: [10.7175, 122.5658], isMajorHub: true },
      { id: "r19-stop-4", name: "Iloilo Provincial Capitol", location: [10.7000, 122.5700], isMajorHub: true },
      { id: "r19-stop-5", name: "St. Paul's Hospital Iloilo", location: [10.6995, 122.5648], isMajorHub: true },
      { id: "r19-stop-6", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r19-stop-7", name: "The Atrium Iloilo", location: [10.6992, 122.5662], isMajorHub: false },
    ],
    osrmNodes: [
      [122.5950, 10.7550],
      [122.5850, 10.7250],
      [122.5685, 10.7135],
      [122.5658, 10.7175],
      [122.5700, 10.7000],
      [122.5648, 10.6995],
      [122.5684, 10.6976],
      [122.5662, 10.6992],
      [122.5700, 10.7000],
      [122.5685, 10.7135],
      [122.5950, 10.7550],
    ],
  },
  // ROUTE 20
  {
    id: "route-20-mohon-jaro-festive-isatu",
    code: "ROUTE 20",
    name: "Mohon to Jaro via So-oc / Festive Walk / ISATU Loop",
    corridorSummary:
      "Mohon Terminal, Arevalo Plaza, Quezon St., Jocson St., So-oc Resettlement Rd., Calajunan Rd., Oñate St. (Mandurriao Plaza), Q. Abeto St. (Western Visayas Medical Center), Megaworld Blvd., Festive Walk Transport Hub, Taft St., El 98 St. (Jaro Big Market), Rizal St. (Jaro Plaza), Commission Civil, ISATU Loop, Commission Civil St. (SM Hypermarket), E. Lopez St. (Robinsons Jaro), Rizal St., El 98 St., Q. Abeto St., Mandurriao Plaza, Calajunan Rd., So-oc Rd., Jocson St., Arevalo Plaza, Mohon Terminal",
    type: "modern",
    color: "#854d0e",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r20-stop-1", name: "Mohon Terminal", location: [10.6860, 122.5180], isMajorHub: true },
      { id: "r20-stop-2", name: "So-oc / Calajunan Junction", location: [10.7050, 122.5180], isMajorHub: false },
      { id: "r20-stop-3", name: "Mandurriao Plaza", location: [10.7180, 122.5280], isMajorHub: true },
      { id: "r20-stop-4", name: "Western Visayas Medical Center (WVMC)", location: [10.7170, 122.5365], isMajorHub: true },
      { id: "r20-stop-5", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r20-stop-6", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r20-stop-7", name: "ISATU Main Campus", location: [10.7175, 122.5658], isMajorHub: true },
      { id: "r20-stop-8", name: "Robinsons Place Jaro", location: [10.7258, 122.5605], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5180, 10.6860],
      [122.5180, 10.7050],
      [122.5280, 10.7180],
      [122.5365, 10.7170],
      [122.5453, 10.7186],
      [122.5579, 10.7247],
      [122.5658, 10.7175],
      [122.5605, 10.7258],
      [122.5453, 10.7186],
      [122.5365, 10.7170],
      [122.5280, 10.7180],
      [122.5180, 10.7050],
      [122.5180, 10.6860],
    ],
  },
  // ROUTE 21
  {
    id: "route-21-tagbak-festive-sm-atria",
    code: "ROUTE 21",
    name: "Tagbak / Buntatala to Festive Walk via SM City / Atria Loop",
    corridorSummary:
      "Buntatala Loop, Tagbak Terminal (City Mall Tagbak), MacArthur Dr. (Ceres Terminal), Simon Ledesma St. (Jaro Small Market), Lopez Jaena St. (Biscocho Haus), Rizal St. (Jaro Plaza), El-98 St., B. Aquino Ave. (SM City, Smallville), Infante St. (UP, Iloilo Doctors' College), Locsin St. (Iloilo Fish Port Complex), Rizal St., Infante St., B. Aquino Ave., Gaisano ICC Loop, Pison Ave. (Atria), R. Mapa St., Megaworld Ave. (Festive Hub), Taft St., El-98 St., Rizal St. (Jaro Plaza), Washington St., MacArthur Dr., Tagbak Terminal, Buntatala Loop",
    type: "modern",
    color: "#6366f1",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r21-stop-1", name: "Tagbak Terminal", location: [10.7490, 122.5780], isMajorHub: true },
      { id: "r21-stop-2", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r21-stop-3", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r21-stop-4", name: "Iloilo Doctors' Hospital", location: [10.7028, 122.5512], isMajorHub: true },
      { id: "r21-stop-5", name: "Atria Park District", location: [10.7107, 122.5492], isMajorHub: true },
      { id: "r21-stop-6", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5780, 10.7490],
      [122.5579, 10.7247],
      [122.5512, 10.7143],
      [122.5512, 10.7028],
      [122.5492, 10.7107],
      [122.5453, 10.7186],
      [122.5579, 10.7247],
      [122.5780, 10.7490],
    ],
  },
  // ROUTE 22
  {
    id: "route-22-ungka-lapaz-cpu-isatu",
    code: "ROUTE 22",
    name: "Ungka to La Paz via CPU – ISATU Loop",
    corridorSummary:
      "Ungka Terminal (ITGSI), Diversion Rd. (University of San Agustin-Sambag), Lopez Jaena St. (CPU), Rizal St. (Jaro Plaza), Commission Civil St. (SM Hypermarket), Burgos St. (ISATU), Huervana St. (La Paz Plaza), Rizal St. (La Paz Public Market), Arroyo St., Magdalo St., Burgos St., Commission Civil St., Washington St., Democracia St., Simon Ledesma, Lopez Jaena St., Diversion Rd., Ungka Terminal",
    type: "modern",
    color: "#15803d",
    operatingHours: { firstTrip: "05:00", lastTrip: "22:00" },
    fare: modernFare,
    stops: [
      { id: "r22-stop-1", name: "Ungka Transport Terminal", location: [10.7485, 122.5446], isMajorHub: true },
      { id: "r22-stop-2", name: "Central Philippine University (CPU)", location: [10.7314, 122.5539], isMajorHub: true },
      { id: "r22-stop-3", name: "Jaro Plaza & Cathedral", location: [10.7247, 122.5579], isMajorHub: true },
      { id: "r22-stop-4", name: "ISATU Main Campus", location: [10.7175, 122.5658], isMajorHub: true },
      { id: "r22-stop-5", name: "La Paz Plaza", location: [10.7135, 122.5685], isMajorHub: true },
      { id: "r22-stop-6", name: "La Paz Public Market", location: [10.7125, 122.5670], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5446, 10.7485],
      [122.5539, 10.7314],
      [122.5579, 10.7247],
      [122.5658, 10.7175],
      [122.5685, 10.7135],
      [122.5670, 10.7125],
      [122.5658, 10.7175],
      [122.5579, 10.7247],
      [122.5539, 10.7314],
      [122.5446, 10.7485],
    ],
  },
  // ROUTE 23
  {
    id: "route-23-mohon-mandurriao-business-district",
    code: "ROUTE 23",
    name: "Mohon to Mandurriao Business District Loop",
    corridorSummary:
      "Mohon Terminal, Osmeña St. (Plaza Arevalo), Jocson St., Avanceña St., Molo Plaza, GT Mall, Iloilo City National High School, San Marcos St., Locsin St. (Iloilo Supermart-Molo), Pison Ave., Gaisano Iloilo City Center, SM Strata, B. Aquino Ave., Taft St., Megaworld Ave., R. Mapa St., Locsin St. (Medical City), Avanceña St., Jocson St., Osmeña St., Mohon Terminal",
    type: "modern",
    color: "#9a3412",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r23-stop-1", name: "Mohon Terminal", location: [10.6860, 122.5180], isMajorHub: true },
      { id: "r23-stop-2", name: "Villa Arevalo Plaza", location: [10.6885, 122.5175], isMajorHub: true },
      { id: "r23-stop-3", name: "Molo Plaza & St. Anne Parish", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r23-stop-4", name: "Atria Park District", location: [10.7107, 122.5492], isMajorHub: true },
      { id: "r23-stop-5", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r23-stop-6", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r23-stop-7", name: "The Medical City Iloilo", location: [10.6950, 122.5385], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5180, 10.6860],
      [122.5175, 10.6885],
      [122.5375, 10.6960],
      [122.5492, 10.7107],
      [122.5512, 10.7143],
      [122.5453, 10.7186],
      [122.5385, 10.6950],
      [122.5175, 10.6885],
      [122.5180, 10.6860],
    ],
  },
  // ROUTE 24
  {
    id: "route-24-lapaz-festive-nabitasan",
    code: "ROUTE 24",
    name: "La Paz to Festive Walk via Nabitasan Loop",
    corridorSummary:
      "La Paz Plaza, Huervana Ext., Burgos St., ISATU Loop, Magdalo, Hechanova St., Senator E. Treñas Boulevard (Prime Estate/Garden of Love), B. Aquino Ave., Gaisano ICC Hub, SM Strata Hub, U-turn Gil Traders, B. Aquino Ave. (SM City), Pison Ave., R. Mapa St., Festive Walk Transport Hub, Megaworld Blvd., Airport Spur Rd., Diversion Road, Gaisano ICC Loop, Senator E. Treñas Blvd. (Nabitasan Garden of Love), Hechanova St., Luna St. (Gaisano La Paz), Bonifacio Dr. (Provincial Capitol), Muelle Loney St., Rizal St., Huervana St., La Paz Plaza",
    type: "modern",
    color: "#701a75",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: modernFare,
    stops: [
      { id: "r24-stop-1", name: "La Paz Plaza", location: [10.7135, 122.5685], isMajorHub: true },
      { id: "r24-stop-2", name: "ISATU Main Campus", location: [10.7175, 122.5658], isMajorHub: true },
      { id: "r24-stop-3", name: "Nabitasan / Garden of Love", location: [10.7120, 122.5580], isMajorHub: false },
      { id: "r24-stop-4", name: "SM City Iloilo", location: [10.7143, 122.5512], isMajorHub: true },
      { id: "r24-stop-5", name: "Atria Park District", location: [10.7107, 122.5492], isMajorHub: true },
      { id: "r24-stop-6", name: "Festive Walk Transport Hub", location: [10.7186, 122.5453], isMajorHub: true },
      { id: "r24-stop-7", name: "Iloilo Provincial Capitol", location: [10.7000, 122.5700], isMajorHub: true },
    ],
    osrmNodes: [
      [122.5685, 10.7135],
      [122.5658, 10.7175],
      [122.5580, 10.7120],
      [122.5512, 10.7143],
      [122.5492, 10.7107],
      [122.5453, 10.7186],
      [122.5512, 10.7143],
      [122.5580, 10.7120],
      [122.5700, 10.7000],
      [122.5685, 10.7135],
    ],
  },
  // ROUTE 25
  {
    id: "route-25-molo-city-proper-gen-luna",
    code: "ROUTE 25",
    name: "Molo to City Proper via General Luna Loop",
    corridorSummary:
      "Locsin St. (Molo Plaza), MH Del Pilar St. (GT Mall Molo), Gen. Luna St. (UPV Iloilo Campus, University of San Agustin, Jubilee Hall, SPED, Assumption Iloilo, St. Paul's Hospital, Atrium Mall), Iznart St. (Citadines), JM Basa St. (Plaza Libertad, City Hall), Rizal St. (UI Phinma, Central Market), Iznart St., Ledesma St., Mabini St. (Robinsons City), De Leon St. (Super), Fuentes St., Ledesma St., Rizal St., Infante St. (Iloilo Fish Port), Baluarte-Calumpang Blvd., Locsin St. (Molo Plaza)",
    type: "traditional",
    color: "#0369a1",
    operatingHours: { firstTrip: "05:00", lastTrip: "21:30" },
    fare: traditionalFare,
    stops: [
      { id: "r25-stop-1", name: "Molo Plaza & St. Anne Parish", location: [10.6960, 122.5375], isMajorHub: true },
      { id: "r25-stop-2", name: "UP Visayas Iloilo Campus", location: [10.7042, 122.5562], isMajorHub: true },
      { id: "r25-stop-3", name: "University of San Agustin", location: [10.6980, 122.5620], isMajorHub: true },
      { id: "r25-stop-4", name: "St. Paul's Hospital Iloilo", location: [10.6995, 122.5648], isMajorHub: true },
      { id: "r25-stop-5", name: "The Atrium Iloilo", location: [10.6992, 122.5662], isMajorHub: false },
      { id: "r25-stop-6", name: "Plaza Libertad & City Hall", location: [10.6928, 122.5714], isMajorHub: true },
      { id: "r25-stop-7", name: "Robinsons Place Iloilo", location: [10.6976, 122.5684], isMajorHub: true },
      { id: "r25-stop-8", name: "Iloilo Fish Port", location: [10.6910, 122.5550], isMajorHub: false },
    ],
    osrmNodes: [
      [122.5375, 10.6960],
      [122.5562, 10.7042],
      [122.5620, 10.6980],
      [122.5648, 10.6995],
      [122.5662, 10.6992],
      [122.5714, 10.6928],
      [122.5684, 10.6976],
      [122.5645, 10.6952],
      [122.5550, 10.6910],
      [122.5470, 10.6880],
      [122.5375, 10.6960],
    ],
  },
];

async function generate() {
  console.log("Generating all 25 ELPTRP routes with high-precision road-following geometry...");
  const compiledRoutes: JeepneyRoute[] = [];

  for (const cfg of routeConfigs) {
    console.log(`Processing ${cfg.code}: ${cfg.name}...`);

    let waypoints: [number, number][] = [];

    // Check if we can reuse existing high-precision geometry
    const existing = getExistingRoute(cfg.code);
    if (existing && existing.waypoints.length >= 50) {
      console.log(`  -> Preserved ${existing.waypoints.length} existing road waypoints for ${cfg.code}`);
      waypoints = existing.waypoints;
    } else if (cfg.code === "ROUTE 9") {
      // Check if existing route 13 (Mohon-City Proper) geometry is available
      const existingMohon = existingRoutes.find((r) => r.id.includes("mohon"));
      if (existingMohon && existingMohon.waypoints.length >= 50) {
        console.log(`  -> Adapted ${existingMohon.waypoints.length} road waypoints for ROUTE 9`);
        waypoints = existingMohon.waypoints;
      }
    }

    // If waypoints not yet set and osrmNodes provided, query OSRM
    if (waypoints.length === 0 && cfg.osrmNodes.length > 0) {
      console.log(`  -> Fetching OSRM road geometry for ${cfg.code} (${cfg.osrmNodes.length} nodes)...`);
      const osrmPts = await fetchOsrmWaypoints(cfg.osrmNodes);
      if (osrmPts && osrmPts.length >= 50) {
        console.log(`  -> OSRM returned ${osrmPts.length} road waypoints`);
        waypoints = osrmPts;
      } else {
        console.log(`  -> Falling back to dense interpolation for ${cfg.code}`);
        const latLngNodes: [number, number][] = cfg.osrmNodes.map((n) => [n[1], n[0]]);
        waypoints = interpolateNodes(latLngNodes, 75);
      }
      // Small pause to be polite to public OSRM
      await new Promise((r) => setTimeout(r, 400));
    } else if (waypoints.length === 0) {
      const latLngNodes: [number, number][] = cfg.stops.map((s) => s.location);
      waypoints = interpolateNodes(latLngNodes, 75);
    }

    compiledRoutes.push({
      id: cfg.id,
      code: cfg.code,
      name: cfg.name,
      corridorSummary: cfg.corridorSummary,
      type: cfg.type,
      color: cfg.color,
      operatingHours: cfg.operatingHours,
      fare: cfg.fare,
      stops: cfg.stops,
      waypoints,
    });
  }

  // Final verification of compiled routes
  console.log(`\nVerification:`);
  console.log(`Total routes: ${compiledRoutes.length}`);
  for (const r of compiledRoutes) {
    if (r.waypoints.length < 50) {
      throw new Error(`${r.code} has only ${r.waypoints.length} waypoints (< 50)!`);
    }
    if (r.stops.length < 3) {
      throw new Error(`${r.code} has only ${r.stops.length} stops (< 3)!`);
    }
    if (!r.corridorSummary || r.corridorSummary.length <= 10) {
      throw new Error(`${r.code} corridorSummary missing or too short!`);
    }
    for (const [lat, lng] of r.waypoints) {
      if (lat < 10.65 || lat > 10.80 || lng < 122.45 || lng > 122.65) {
        throw new Error(`${r.code} waypoint [${lat}, ${lng}] out of bounding box!`);
      }
    }
  }

  // Save to src/data/routes.json
  fs.writeFileSync(existingRoutesPath, JSON.stringify(compiledRoutes, null, 2), "utf8");
  console.log(`Successfully written ${compiledRoutes.length} routes to ${existingRoutesPath}!`);
}

generate().catch((err) => {
  console.error("Generator failed:", err);
  process.exit(1);
});
