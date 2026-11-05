import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ insertResult: vi.fn(), insert: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: (row: unknown) => {
        mocks.insert(row);
        return { select: () => ({ single: mocks.insertResult }) };
      },
    }),
  }),
}));
vi.mock("@/lib/ai/parser", () => ({ parseNewsletter: vi.fn() }));
vi.mock("@/lib/ai/pipeline", () => ({ runMatchingForQueries: vi.fn() }));
vi.mock("@/lib/email/notify", () => ({ sendOpsAlert: vi.fn() }));

import { storeInboundEmail } from "./process";

const email = {
  fromEmail: "peter@sourceofsources.com",
  subject: "SOS",
  textBody: "body",
  htmlBody: "",
};

describe("storeInboundEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves the provider id and returns the stored email", async () => {
    mocks.insertResult.mockResolvedValue({ data: { id: "row-1" }, error: null });

    const result = await storeInboundEmail(email, "msg-1");

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ provider_message_id: "msg-1", source: "sos" })
    );
    expect(result).toEqual({
      status: "stored",
      email: { ...email, id: "row-1", source: "sos" },
    });
  });

  it("reports a unique violation as a duplicate", async () => {
    mocks.insertResult.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });

    expect(await storeInboundEmail(email, "msg-1")).toEqual({ status: "duplicate" });
  });

  it("reports any other insert failure as an error", async () => {
    mocks.insertResult.mockResolvedValue({
      data: null,
      error: { code: "23514", message: "check violation" },
    });

    expect(await storeInboundEmail(email, "msg-1")).toEqual({
      status: "error",
      message: "check violation",
    });
  });
});
