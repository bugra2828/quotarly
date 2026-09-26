import Anthropic from "@anthropic-ai/sdk";

export type WrittenPitch = {
  subject: string;
  body: string;
  needs_verification: string[];
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PITCH_TOOL: Anthropic.Tool = {
  name: "write_pitch",
  description: "Write a journalist pitch response in the expert's voice.",
  input_schema: {
    type: "object",
    properties: {
      subject: { type: "string" },
      body: { type: "string" },
      needs_verification: {
        type: "array",
        items: { type: "string" },
        description:
          "Any claim in the body the expert must confirm before sending (facts, stats, experience the writer wasn't certain about).",
      },
    },
    required: ["subject", "body", "needs_verification"],
  },
};

function buildSystemPrompt(profile: {
  display_name: string;
  job_title: string | null;
  company: string | null;
  tone: string | null;
  sample_quotes: string[];
}): string {
  return `You are writing a journalist pitch response AS ${profile.display_name},
${profile.job_title ?? "an expert"} at ${profile.company ?? "their company"}.

Voice/tone: ${profile.tone || "professional and direct"}.
${
  profile.sample_quotes.length
    ? `Sample quotes that show how they actually speak:\n${profile.sample_quotes
        .map((q) => `- "${q}"`)
        .join("\n")}`
    : ""
}

Rules:
- Answer the journalist's question directly. 150-250 words.
- Follow any format/requirements the query specifies exactly.
- Include concrete, specific points — not generic platitudes.
- Never invent statistics, client stories, or experience. If a claim needs a
  number or fact you're not certain the expert actually has, write it with a
  "[VERIFY: ...]" placeholder instead of inventing one, and list it in
  needs_verification.
- End with a short signature: name, title, company.`;
}

export async function writePitch(
  queryText: string,
  requirements: string | null,
  profile: {
    display_name: string;
    job_title: string | null;
    company: string | null;
    tone: string | null;
    sample_quotes: string[];
    website_url: string | null;
  }
): Promise<WrittenPitch> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system: buildSystemPrompt(profile),
    tools: [PITCH_TOOL],
    tool_choice: { type: "tool", name: "write_pitch" },
    messages: [
      {
        role: "user",
        content: `JOURNALIST QUERY:\n${queryText}\n\nREQUIREMENTS:\n${
          requirements ?? "(none specified)"
        }`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    return { subject: "", body: "", needs_verification: ["generation failed"] };
  }

  return toolUse.input as WrittenPitch;
}
