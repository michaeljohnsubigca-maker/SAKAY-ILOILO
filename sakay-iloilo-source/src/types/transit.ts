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
  corridorSummary?: string;
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
  stops: RouteStop[];
  waypoints: [number, number][]; // [[lat, lng], ...]
}

export type PoiCategory =
  | "mall"
  | "terminal"
  | "school"
  | "landmark"
  | "hospital"
  | "plaza"
  | "government"
  | "market";

export interface Poi {
  id: string;
  name: string;
  aliases: string[];
  category: PoiCategory;
  district: "City Proper" | "Jaro" | "Molo" | "Mandurriao" | "Lapaz" | "Arevalo" | "Lapuz" | string;
  location: [number, number]; // [lat, lng]
}

export type LandmarkPOI = Poi;

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

export interface TripPlanRequest {
  origin: [number, number] | Poi;
  destination: [number, number] | Poi;
  fareCategory?: FareCategory;
  departureTime?: string;
}

export interface TripPlanResult {
  options: TripOption[];
}
