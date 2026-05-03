import { describe, expect, it } from "vitest";
import { normalizeNdbcSeaState } from "../normalizeSeaState";

describe("normalizeNdbcSeaState", () => {
  it("converts metric NDBC wave and water fields to display units", () => {
    const sea = normalizeNdbcSeaState({
      stationId: "41009",
      WVHT: "1.0",
      DPD: "8",
      MWD: "90",
      S1HT: "0.5",
      S1PD: "11",
      S1DIR: "70",
      WTMP: "25",
    });

    expect(sea?.observed?.waveHeightFt).toBe(3.3);
    expect(sea?.observed?.waveDirectionText).toBe("E");
    expect(sea?.observed?.primarySwellHeightFt).toBe(1.6);
    expect(sea?.observed?.waterTempF).toBe(77);
  });
});
