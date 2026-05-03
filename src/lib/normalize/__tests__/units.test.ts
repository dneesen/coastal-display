import { describe, expect, it } from "vitest";
import { speedToKt } from "../units";

describe("speedToKt", () => {
  it("converts common NWS observation speed units to knots", () => {
    expect(speedToKt(16.668, "wmoUnit:km_h-1")).toBe(9);
    expect(speedToKt(10, "wmoUnit:m_s-1")).toBe(19);
    expect(speedToKt(10, "wmoUnit:mi_h-1")).toBe(9);
    expect(speedToKt(10, "wmoUnit:kt")).toBe(10);
  });
});
