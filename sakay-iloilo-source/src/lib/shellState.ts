// src/lib/shellState.ts
import { JeepneyRoute } from "@/types/transit";

export type ShellTab = "plan" | "browse";

export interface ShellState {
  activeTab: ShellTab;
  previewRoute: JeepneyRoute | null;
  selectedTripId: string | null;
}

export function switchTab(state: ShellState, tab: ShellTab): ShellState {
  if (tab === "plan") {
    return { ...state, activeTab: "plan", previewRoute: null };
  }
  return { ...state, activeTab: "browse" };
}

export function selectPreviewRoute(state: ShellState, route: JeepneyRoute): ShellState {
  return { ...state, previewRoute: route, selectedTripId: null, activeTab: "browse" };
}

export function clearPreviewOnSearch(state: ShellState): ShellState {
  return { ...state, previewRoute: null };
}

export function selectTrip(state: ShellState, tripId: string): ShellState {
  return { ...state, selectedTripId: tripId, previewRoute: null };
}
