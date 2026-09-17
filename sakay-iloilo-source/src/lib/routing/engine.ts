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

function getDirectedPolylineSlice(
  waypoints: [number, number][],
  startIndex: number,
  endIndex: number
): [number, number][] {
  if (startIndex <= endIndex) {
    return waypoints.slice(startIndex, endIndex + 1);
  } else {
    return waypoints.slice(endIndex, startIndex + 1).reverse();
  }
}

function findNearestStop(
  waypointIndex: number,
  route: JeepneyRoute
): RouteStop {
  const wp = route.waypoints[waypointIndex] || [0, 0];
  if (!route.stops || route.stops.length === 0) {
    return {
      id: `${route.id}-stop-fallback-${waypointIndex}`,
      name: `${route.name} Stop`,
      location: wp,
      isMajorHub: false,
    };
  }

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
        const rideCoords = getDirectedPolylineSlice(
          route.waypoints,
          startIndex,
          endIndex
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
                coordinates: getDirectedPolylineSlice(
                  routeA.waypoints,
                  originSnapA.index,
                  snapStopA.index
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
                coordinates: getDirectedPolylineSlice(
                  routeB.waypoints,
                  snapStopB.index,
                  destSnapB.index
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

  // Perform deduplication by unique ID first
  const seenIds = new Set<string>();
  const uniqueOptions: TripOption[] = [];
  for (const opt of options) {
    if (!seenIds.has(opt.id)) {
      seenIds.add(opt.id);
      uniqueOptions.push(opt);
    }
    if (uniqueOptions.length >= 5) break;
  }

  // Classify categories
  for (let i = 0; i < uniqueOptions.length; i++) {
    if (i === 0) {
      uniqueOptions[i].category = "fastest";
    } else if (uniqueOptions[i].transfersCount === 0) {
      uniqueOptions[i].category = "fewest_transfers";
    } else {
      uniqueOptions[i].category = "longest";
    }
  }

  if (uniqueOptions.length > 1) {
    const last = uniqueOptions[uniqueOptions.length - 1];
    if (last.id !== uniqueOptions[0].id) {
      const otherDirect = uniqueOptions.slice(0, -1).some((o) => o.transfersCount === 0);
      if (last.transfersCount !== 0 || otherDirect) {
        last.category = "longest";
      }
    }
  }

  return uniqueOptions;
}
