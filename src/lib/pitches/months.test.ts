import { describe, expect, it } from "vitest";
import { groupByMonth, parseMonthKey } from "./months";

describe("parseMonthKey", () => {
  it("returns the UTC range and label of a month", () => {
    const month = parseMonthKey("2026-11");

    expect(month?.label).toBe("November 2026");
    expect(month?.start.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(month?.end.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("rolls December over into the next year", () => {
    expect(parseMonthKey("2026-12")?.end.toISOString()).toBe(
      "2027-01-01T00:00:00.000Z"
    );
  });

  it.each([undefined, "", "2026-13", "2026-00", "2026-1", "nope", "2026-11&x=1"])(
    "rejects %s",
    (value) => {
      expect(parseMonthKey(value)).toBeNull();
    }
  );
});

describe("groupByMonth", () => {
  it("counts per month, newest first", () => {
    expect(
      groupByMonth([
        "2026-09-27T18:03:30+00:00",
        "2026-11-05T11:44:49+00:00",
        "2026-10-02T08:00:00+00:00",
        "2026-11-01T00:00:00+00:00",
      ])
    ).toEqual([
      { key: "2026-11", count: 2, label: "November 2026" },
      { key: "2026-10", count: 1, label: "October 2026" },
      { key: "2026-09", count: 1, label: "September 2026" },
    ]);
  });

  it("uses the same UTC boundary as parseMonthKey", () => {
    expect(groupByMonth(["2026-10-31T23:59:59+00:00"])[0].key).toBe("2026-10");
  });

  it("returns nothing for no timestamps", () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
