import { describe, expect, it } from "vitest";
import { parseCoordinate, parseCoordinatePair } from "../coordinates";

describe("coordinates", () => {
  it("parses signed decimal coordinates", () => {
    expect(parseCoordinate("27.6386", "latitude")).toBe(27.6386);
    expect(parseCoordinate("-80.3973", "longitude")).toBe(-80.3973);
  });

  it("parses cardinal decimal coordinates", () => {
    expect(parseCoordinate("27.6386 N", "latitude")).toBe(27.6386);
    expect(parseCoordinate("80.3973W", "longitude")).toBe(-80.3973);
  });

  it("parses degree minute second coordinates", () => {
    expect(parseCoordinate('27°38\'18.96"N', "latitude")).toBeCloseTo(27.6386, 4);
    expect(parseCoordinate('80°23\'50.28"W', "longitude")).toBeCloseTo(-80.3973, 4);
  });

  it("parses pasted coordinate pairs", () => {
    expect(parseCoordinatePair("27.6386, -80.3973")).toEqual({ latitude: 27.6386, longitude: -80.3973 });
    expect(parseCoordinatePair("27.6386 N, 80.3973 W")).toEqual({ latitude: 27.6386, longitude: -80.3973 });
    expect(parseCoordinatePair("27.6386 -80.3973")).toEqual({ latitude: 27.6386, longitude: -80.3973 });
  });
});
