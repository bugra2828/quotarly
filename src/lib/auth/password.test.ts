import { describe, it, expect } from "vitest";
import { validatePassword } from "./password";

describe("validatePassword", () => {
  it("rejects passwords shorter than 10 characters", () => {
    expect(validatePassword("Abc1234")).toMatch(/at least 10/);
  });

  it("rejects passwords with no uppercase letter", () => {
    expect(validatePassword("lowercase123")).toMatch(/uppercase/);
  });

  it("rejects passwords with no number", () => {
    expect(validatePassword("NoNumbersHere")).toMatch(/number/);
  });

  it("accepts a password meeting all rules", () => {
    expect(validatePassword("Quotarly123")).toBeNull();
  });
});
