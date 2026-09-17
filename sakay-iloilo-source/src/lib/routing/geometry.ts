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
