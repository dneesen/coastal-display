import { describe, expect, it } from "vitest";
import { formatPressure, formatPressureDelta, formatPressureScale } from "../pressure";

describe("pressure formatting", () => {
  it("formats pressure in selected units", () => {
    expect(formatPressure(29.92, "inHg")).toBe("29.92 inHg");
    expect(formatPressure(29.92, "hPa")).toBe("1013 hPa");
    expect(formatPressure(29.92, "mb")).toBe("1013 mb");
    expect(formatPressure(29.92, "mmHg")).toBe("760 mmHg");
  });

  it("formats pressure deltas with sign and selected units", () => {
    expect(formatPressureDelta(-0.2, "inHg")).toBe("-0.20 inHg / 12h");
    expect(formatPressureDelta(0.2, "hPa")).toBe("+7 hPa / 12h");
    expect(formatPressureDelta(0.3, "inHg", 24)).toBe("+0.30 inHg / 24h");
    expect(formatPressureDelta(0.3, "inHg", 24, false)).toBe("+0.30 inHg");
    expect(formatPressureDelta(undefined, "inHg")).toBe("change unknown");
  });

  it("formats scale labels compactly", () => {
    expect(formatPressureScale(30, "inHg")).toBe("30");
    expect(formatPressureScale(30, "hPa")).toBe("1016");
  });
});
