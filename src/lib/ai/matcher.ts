import Anthropic from "@anthropic-ai/sdk";

export type MatchResult = {
  score: number;
  reasoning: string;
  disqualifiers: string[];
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCORE_TOOL: Anthropic.Tool = {
  name: "score_match",
  description: "Score how well a journalist query matches an expert's profile.",
  input_schema: {
    type: "object",
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100 },
      reasoning: { type: "string" },
      disqualifiers: { type: "array", items: { type: "string" } },
    },
    required: ["score", "reasoning", "disqualifiers"],
  },
};

const SYSTEM_PROMPT = `You score how well a journalist's source request matches an
expert's profile, from 0 (no fit) to 100 (perfect fit).

Consider:
- Topic overlap between the query and the expert's expertise_topics.
- Any excluded_topics the expert has opted out of (hard disqualifier — score 0-10).
- Whether the expert could plausibly speak with authority (job title, company).
- Requirements in the query the expert clearly cannot meet (e.g. "must be a CFO" when
  the expert is a marketer) are disqualifiers too.

Be conservative: a vague topical overlap without real expertise should score low
(under 40), not medium.`;

// Cheap keyword pre-filter before spending a model call: skip queries that share
// no words at all with the expert's topics, to save on API costs at scale.
export function quickKeywordOverlap(
  queryText: string,
  topics: string[]
): boolean {
  if (topics.length === 0) return true; // no topics set yet — let the model decide
  const haystack = queryText.toLowerCase();
  // Topics can be multi-word labels ("SaaS & Software") that will rarely
  // appear verbatim in a query — split into individual words so any one of
  // them overlapping is enough to pass the pre-filter.
  const keywords = topics.flatMap((t) =>
    t
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2)
  );
  return keywords.some((k) => haystack.includes(k));
}

export async function matchQueryToProfile(
  queryText: string,
  profile: {
    display_name: string;
    job_title: string | null;
    company: string | null;
    bio: string | null;
    expertise_topics: string[];
    excluded_topics: string[];
  }
): Promise<MatchResult> {
  const profileSummary = `Name: ${profile.display_name}
Title: ${profile.job_title ?? "unknown"}
Company: ${profile.company ?? "unknown"}
Bio: ${profile.bio ?? "(none provided)"}
Expertise topics: ${profile.expertise_topics.join(", ") || "(none listed)"}
Excluded topics: ${profile.excluded_topics.join(", ") || "(none)"}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [SCORE_TOOL],
    tool_choice: { type: "tool", name: "score_match" },
    messages: [
      {
        role: "user",
        content: `QUERY:\n${queryText}\n\nEXPERT PROFILE:\n${profileSummary}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return { score: 0, reasoning: "no response", disqualifiers: [] };

  return toolUse.input as MatchResult;
}
