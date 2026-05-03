import { describe, expect, it } from "vitest";
import { normalizeTide } from "../normalizeTide";

describe("normalizeTide", () => {
  it("normalizes points and finds upcoming high and low events", () => {
    const tide = normalizeTide(
      "8722125",
      [
        { t: "2026-05-02 00:00", v: "0.2" },
        { t: "2026-05-02 06:00", v: "1.8" },
        { t: "2026-05-02 12:00", v: "0.4" },
      ],
      [
        { t: "2099-05-02 06:00", v: "1.8", type: "H" },
        { t: "2099-05-02 12:00", v: "0.4", type: "L" },
      ],
    );

    expect(tide.stationId).toBe("8722125");
    expect(tide.points).toHaveLength(3);
    expect(tide.nextHigh?.type).toBe("high");
    expect(tide.nextLow?.type).toBe("low");
  });
});
