import { describe, expect, it } from "vitest";
import { defaultDisplayProfile } from "../../config/defaultDisplayProfile";
import { profileFromSearchParams, profileToSearchParams } from "../profileParams";

describe("profile params", () => {
  it("round-trips profile fields used by the display-data endpoint", () => {
    const profile = {
      ...defaultDisplayProfile,
      location: { ...defaultDisplayProfile.location, label: "Test Harbor", latitude: 30.1, longitude: -81.2 },
      stations: { ...defaultDisplayProfile.stations, tideStationId: "1234567", currentStationId: "c1", buoyStationId: "b1" },
      units: { ...defaultDisplayProfile.units, pressure: "hPa" as const },
      display: { ...defaultDisplayProfile.display, timeFormat: "24h" as const },
    };

    const parsed = profileFromSearchParams(profileToSearchParams(profile));

    expect(parsed.location.label).toBe("Test Harbor");
    expect(parsed.location.latitude).toBe(30.1);
    expect(parsed.location.longitude).toBe(-81.2);
    expect(parsed.stations.tideStationId).toBe("1234567");
    expect(parsed.stations.currentStationId).toBe("c1");
    expect(parsed.stations.buoyStationId).toBe("b1");
    expect(parsed.units.pressure).toBe("hPa");
    expect(parsed.display.timeFormat).toBe("24h");
  });

  it("accepts cardinal coordinate params", () => {
    const parsed = profileFromSearchParams(new URLSearchParams("lat=27.6386N&lon=80.3973W"));

    expect(parsed.location.latitude).toBe(27.6386);
    expect(parsed.location.longitude).toBe(-80.3973);
  });
});
