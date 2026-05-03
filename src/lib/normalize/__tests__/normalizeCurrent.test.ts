import { describe, expect, it } from "vitest";
import { normalizeCurrent } from "../normalizeCurrent";

describe("normalizeCurrent", () => {
  it("separates slack, max flood, and max ebb events", () => {
    const current = normalizeCurrent(
      "ACT1234",
      [
        { Time: "2026-05-02 00:00", Velocity_Major: "-0.8" },
        { Time: "2026-05-02 06:00", Velocity_Major: "1.2" },
      ],
      [
        { Time: "2099-05-02 01:00", Type: "slack", Velocity: "0.0" },
        { Time: "2099-05-02 06:00", Type: "Max Flood", Velocity: "1.4" },
        { Time: "2099-05-02 12:00", Type: "Max Ebb", Velocity: "-1.1" },
      ],
    );

    expect(current.points).toHaveLength(2);
    expect(current.nextSlack?.type).toBe("slack");
    expect(current.nextMaxFlood?.type).toBe("max_flood");
    expect(current.nextMaxEbb?.type).toBe("max_ebb");
  });

  it("normalizes FPI0902 max/slack event payloads from current_predictions.cp", () => {
    const current = normalizeCurrent(
      "FPI0902",
      [{ Time: "2099-05-02 15:18", Velocity_Major: "-0.18", Bin: "6" }],
      [
        { Time: "2099-05-02 03:14", Type: "ebb", Velocity_Major: "-1.61", Bin: "6" },
        { Time: "2099-05-02 06:23", Type: "slack", Velocity_Major: "-0.00", Bin: "6" },
        { Time: "2099-05-02 09:26", Type: "flood", Velocity_Major: "1.79", Bin: "6" },
      ],
    );

    expect(current.stationName).toBe("Inner Range, north of USCG station");
    expect(current.nextSlack?.velocityKt).toBe(0);
    expect(current.nextMaxFlood?.velocityKt).toBe(1.79);
    expect(current.nextMaxEbb?.velocityKt).toBe(-1.61);
  });
});
