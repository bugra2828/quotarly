import { describe, it, expect } from "vitest";
import { quickKeywordOverlap } from "./matcher";

describe("quickKeywordOverlap", () => {
  it("lets everything through when the profile has no topics set", () => {
    expect(quickKeywordOverlap("anything at all", [])).toBe(true);
  });

  it("matches when a topic appears in the query", () => {
    expect(
      quickKeywordOverlap(
        "Looking for a founder to talk about SaaS pricing strategy",
        ["SaaS pricing", "fundraising"]
      )
    ).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(quickKeywordOverlap("Talk about FUNDRAISING trends", ["fundraising"])).toBe(
      true
    );
  });

  it("rejects when no topic appears in the query", () => {
    expect(
      quickKeywordOverlap("Looking for a chef to talk about recipes", [
        "SaaS pricing",
        "fundraising",
      ])
    ).toBe(false);
  });
});
