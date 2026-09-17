// tests/markers.test.ts
import { describe, it, expect } from "vitest";
import { getMarkerSvgString } from "../src/components/map/markers";

describe("Map Markers Design Tokens", () => {
  it("generates origin marker SVG with green pulse ring", () => {
    const svg = getMarkerSvgString("origin", "CPU Gate 1");
    expect(svg).toContain("#10b981");
    expect(svg).toContain("CPU Gate 1");
  });

  it("generates destination marker SVG with crimson pin", () => {
    const svg = getMarkerSvgString("destination", "SM City");
    expect(svg).toContain("#dc2626");
    expect(svg).toContain("SM City");
  });
});
