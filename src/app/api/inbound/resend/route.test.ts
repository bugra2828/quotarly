import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  verify: vi.fn(),
  getEmail: vi.fn(),
  storeInboundEmail: vi.fn(),
  parseStoredEmail: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: mocks.after,
}));

vi.mock("resend", () => ({
  Resend: class {
    webhooks = { verify: mocks.verify };
    emails = { receiving: { get: mocks.getEmail } };
  },
}));

vi.mock("@/lib/inbound/process", () => ({
  storeInboundEmail: mocks.storeInboundEmail,
  parseStoredEmail: mocks.parseStoredEmail,
}));

import { POST } from "./route";

const request = () =>
  new NextRequest("https://quotarly.com/api/inbound/resend", {
    method: "POST",
    body: "{}",
  });

describe("POST /api/inbound/resend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_INBOUND_WEBHOOK_SECRET = "secret";
    mocks.verify.mockReturnValue({
      type: "email.received",
      data: { email_id: "msg-1" },
    });
    mocks.getEmail.mockResolvedValue({
      data: {
        from: "Peter <peter@sourceofsources.com>",
        subject: "SOS",
        text: "body",
        html: "",
      },
      error: null,
    });
  });

  it("stores under the provider id and parses only after responding", async () => {
    const email = { id: "row-1" };
    mocks.storeInboundEmail.mockResolvedValue({ status: "stored", email });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.storeInboundEmail).toHaveBeenCalledWith(
      expect.objectContaining({ fromEmail: "peter@sourceofsources.com" }),
      "msg-1"
    );
    expect(mocks.parseStoredEmail).not.toHaveBeenCalled();

    mocks.after.mock.calls[0][0]();
    expect(mocks.parseStoredEmail).toHaveBeenCalledWith(email);
  });

  it("acknowledges a redelivery without parsing it again", async () => {
    mocks.storeInboundEmail.mockResolvedValue({ status: "duplicate" });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, duplicate: true });
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it("returns 500 so Resend retries when the email could not be stored", async () => {
    mocks.storeInboundEmail.mockResolvedValue({ status: "error", message: "db down" });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.after).not.toHaveBeenCalled();
  });
});
