import { describe, it, expect } from "vitest";
import { computeTrend } from "./trend";

describe("computeTrend", () => {
  it("computes a positive percent change", () => {
    expect(computeTrend(12, 10)).toEqual({ percent: 20, direction: "up" });
  });

  it("computes a negative percent change", () => {
    expect(computeTrend(8, 10)).toEqual({ percent: -20, direction: "down" });
  });

  it("is flat when nothing changed", () => {
    expect(computeTrend(10, 10)).toEqual({ percent: 0, direction: "flat" });
  });

  it("is flat with no percent when both periods are zero", () => {
    expect(computeTrend(0, 0)).toEqual({ percent: null, direction: "flat" });
  });

  it("is up with no percent when there was no previous baseline", () => {
    expect(computeTrend(5, 0)).toEqual({ percent: null, direction: "up" });
  });
});
