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

export interface TripPlanRequest {
  origin: [number, number] | LandmarkPOI;
  destination: [number, number] | LandmarkPOI;
  fareCategory?: FareCategory;
  departureTime?: string;
}

export interface TripPlanResult {
  options: TripOption[];
}
