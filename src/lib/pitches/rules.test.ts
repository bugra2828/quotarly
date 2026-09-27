import { describe, it, expect } from "vitest";
import { isPastDeadline, hasUnresolvedVerifyTag, hasReachedDailyLimit } from "./rules";

describe("isPastDeadline", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("is false when there is no deadline", () => {
    expect(isPastDeadline(null, now)).toBe(false);
  });

  it("is false when the deadline is in the future", () => {
    expect(isPastDeadline("2026-01-16T00:00:00Z", now)).toBe(false);
  });

  it("is true when the deadline has already passed", () => {
    expect(isPastDeadline("2026-01-14T00:00:00Z", now)).toBe(true);
  });
});

describe("hasUnresolvedVerifyTag", () => {
  it("flags a body with an unresolved [VERIFY tag", () => {
    expect(hasUnresolvedVerifyTag("Our churn dropped [VERIFY: exact %].")).toBe(true);
  });

  it("passes a body with no verify tag", () => {
    expect(hasUnresolvedVerifyTag("Our churn dropped 40%.")).toBe(false);
  });
});

describe("hasReachedDailyLimit", () => {
  it("is false below the limit", () => {
    expect(hasReachedDailyLimit(9, 10)).toBe(false);
  });

  it("is true at the limit", () => {
    expect(hasReachedDailyLimit(10, 10)).toBe(true);
  });

  it("is true above the limit", () => {
    expect(hasReachedDailyLimit(11, 10)).toBe(true);
  });
});
