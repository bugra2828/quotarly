import Anthropic from "@anthropic-ai/sdk";

export type ParsedQuery = {
  title: string;
  body: string;
  category: string | null;
  outlet_name: string | null;
  outlet_domain: string | null;
  journalist_name: string | null;
  reply_email: string | null;
  requirements: string | null;
  deadline: string | null; // ISO 8601, or null if not found
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACT_QUERIES_TOOL: Anthropic.Tool = {
  name: "extract_queries",
  description:
    "Extract individual journalist source requests from a HARO/SOS/Help A B2B Writer style newsletter.",
  input_schema: {
    type: "object",
    properties: {
      queries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            category: { type: ["string", "null"] },
            outlet_name: { type: ["string", "null"] },
            outlet_domain: { type: ["string", "null"] },
            journalist_name: { type: ["string", "null"] },
            reply_email: { type: ["string", "null"] },
            requirements: { type: ["string", "null"] },
            deadline: { type: ["string", "null"] },
          },
          required: ["title", "body"],
        },
      },
    },
    required: ["queries"],
  },
};

function buildSystemPrompt(today: string): string {
  return `You extract individual journalist/editor source requests from a
newsletter digest (HARO, SOS/Source of Sources, Help A B2B Writer, etc).

Today's date is ${today}.

Rules:
- Each newsletter contains multiple unrelated requests; split them into separate items.
- Skip ads, sponsored sections, footers, unsubscribe links, and platform boilerplate.
- "reply_email" is the address journalists are told to respond to, if present.
- "deadline" must be an ISO 8601 date/time, resolved relative to today's date above
  (e.g. "this Friday" or "end of week" -> the correct upcoming date, not a past one).
  Only use null if there is truly no time reference in the text.
- Keep "body" close to the original wording — do not summarize away requirements.
- If you cannot find any real requests, return an empty queries array.`;
}

export async function parseNewsletter(rawText: string): Promise<ParsedQuery[]> {
  const today = new Date().toISOString().slice(0, 10);
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    // A busy digest can hold a dozen+ requests; 4096 ran close enough to the
    // cap on a real newsletter (3446 used) that a slightly longer one would
    // get silently truncated mid-JSON and come back as zero queries.
    max_tokens: 16384,
    system: buildSystemPrompt(today),
    tools: [EXTRACT_QUERIES_TOOL],
    tool_choice: { type: "tool", name: "extract_queries" },
    messages: [
      {
        role: "user",
        content: rawText.slice(0, 50_000),
      },
    ],
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error(
      `parseNewsletter output truncated at max_tokens (used ${message.usage.output_tokens})`
    );
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return [];

  const input = toolUse.input as { queries?: ParsedQuery[] };
  return input.queries ?? [];
}
