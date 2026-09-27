import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { isValidSignature, mapPlan } from "./webhook";

const secret = "test-secret";

function sign(body: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("isValidSignature", () => {
  it("accepts a correctly signed body", () => {
    const body = JSON.stringify({ hello: "world" });
    expect(isValidSignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = JSON.stringify({ hello: "world" });
    const signature = sign(body);
    const tampered = JSON.stringify({ hello: "world!" });
    expect(isValidSignature(tampered, signature, secret)).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(isValidSignature("{}", null, secret)).toBe(false);
  });

  it("rejects a signature of a different length instead of throwing", () => {
    expect(() => isValidSignature("{}", "short", secret)).not.toThrow();
    expect(isValidSignature("{}", "short", secret)).toBe(false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const body = "{}";
    const wrongSignature = crypto
      .createHmac("sha256", "wrong-secret")
      .update(body)
      .digest("hex");
    expect(isValidSignature(body, wrongSignature, secret)).toBe(false);
  });
});

describe("mapPlan", () => {
  it("maps product names case-insensitively to plan ids", () => {
    expect(mapPlan("Quotarly Starter")).toBe("starter");
    expect(mapPlan("Quotarly Pro")).toBe("pro");
    expect(mapPlan("Quotarly Agency")).toBe("agency");
  });

  it("falls back to the raw product name when unrecognized", () => {
    expect(mapPlan("Mystery Plan")).toBe("Mystery Plan");
  });
});
