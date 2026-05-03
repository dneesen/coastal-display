import { describe, expect, it } from "vitest";
import { distanceMiles, hasRecentSeaStateObservation, parseNdbcActiveStations } from "../stations";

describe("station suggestions", () => {
  it("parses NDBC active station XML", () => {
    const stations = parseNdbcActiveStations(`
      <stations>
        <station id="41009" lat="28.508" lon="-80.185" name="CANAVERAL 20 NM East of Cape Canaveral, FL" pgm="NDBC Meteorological/Ocean" type="buoy" met="y"/>
        <station id="bad" name="No position" type="buoy" met="y"/>
      </stations>
    `);

    expect(stations).toHaveLength(1);
    expect(stations[0].id).toBe("41009");
    expect(stations[0].type).toBe("buoy");
    expect(stations[0].met).toBe("y");
  });

  it("computes nearby distances", () => {
    expect(distanceMiles(27.6386, -80.3973, 28.508, -80.185)).toBeGreaterThan(50);
    expect(distanceMiles(27.6386, -80.3973, 27.6386, -80.3973)).toBe(0);
  });

  it("requires recent measured wave height for sea-state buoy suggestions", () => {
    const now = Date.parse("2026-05-03T16:00:00Z");
    expect(hasRecentSeaStateObservation({ stationId: "41113", WVHT: "0.9", updatedAt: "2026-05-03T15:26:00Z" }, now)).toBe(true);
    expect(hasRecentSeaStateObservation({ stationId: "41068", WVHT: "MM", updatedAt: "2026-05-03T15:08:00Z" }, now)).toBe(false);
    expect(hasRecentSeaStateObservation({ stationId: "41114", WVHT: "0.7", updatedAt: "2026-04-26T22:26:00Z" }, now)).toBe(false);
  });
});
