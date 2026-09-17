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
