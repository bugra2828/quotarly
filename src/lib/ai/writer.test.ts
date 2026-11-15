import { describe, it, expect } from "vitest";
import { plainPitch, staysWithinAnswers } from "./writer";

const expert = { display_name: "Ada Park", job_title: "CEO", company: "Loopdesk" };
const answers = [
  {
    question: "What broke first when your support team grew?",
    answer: "Handoffs broke first, not headcount. Tickets bounced between three people.",
  },
  {
    question: "One piece of advice?",
    answer: "hire a systems person before your 20th agent",
  },
];

describe("staysWithinAnswers", () => {
  it("accepts a proofread, reordered version with greeting and signature", () => {
    const body =
      "Hi,\n\nHire a systems person before your 20th agent. Handoffs broke first, not headcount. Tickets bounced between three people.\n\nBest,\nAda Park\nCEO, Loopdesk";
    expect(staysWithinAnswers(body, answers, expert)).toBe(true);
  });

  it("rejects a body where the model added its own content", () => {
    const body =
      "Hi,\n\nHandoffs broke first, not headcount. In my experience, scaling customer support demands rigorous process documentation, clear escalation paths, dedicated tooling investments and a culture of continuous improvement across every region we operate in.\n\nBest,\nAda Park\nCEO, Loopdesk";
    expect(staysWithinAnswers(body, answers, expert)).toBe(false);
  });
});

describe("plainPitch", () => {
  it("joins the answers as-is between a greeting and the signature", () => {
    expect(plainPitch(answers, expert)).toBe(
      "Hi,\n\nHandoffs broke first, not headcount. Tickets bounced between three people.\n\nhire a systems person before your 20th agent\n\nBest,\nAda Park\nCEO, Loopdesk"
    );
  });
});
