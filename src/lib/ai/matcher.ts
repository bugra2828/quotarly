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

The expert chose a fixed set of expertise_topics on their profile — trust that choice.
Topic fit is the primary driver of the score, not a judgment call about whether their
specific job title, seniority, or company size is the "ideal" fit the journalist had
in mind. A founder can credibly comment on a SaaS/marketing/AI/business question even
without matching some unstated enterprise pedigree.

- If the query's core subject falls within one of the expert's expertise_topics,
  score it 70+ by default.
- Only drop the score hard (0-10) for an EXPLICIT, OBJECTIVE requirement stated in the
  query that the expert's profile clearly fails — a named credential or title the
  query demands verbatim ("must be a licensed CPA", "must be a CFO"), a stated
  location requirement the profile contradicts, or an excluded_topic.
- Don't invent soft disqualifiers like "their bio doesn't mention direct experience
  with X" or "unclear if they're senior enough" — without an explicit stated
  requirement they fail, let topic fit carry the score.

Err toward a higher score when the topic matches and there's no explicit disqualifying
requirement — skipping a usable expert is worse than scoring one too generously.`;

// Common abbreviations journalists actually type, which never literally
// appear in the spelled-out topic label ("Artificial Intelligence") so the
// word-split below would otherwise never catch them.
const TOPIC_ABBREVIATIONS: Record<string, string[]> = {
  "Artificial Intelligence": ["ai", "genai", "llm", "ml"],
  "PR & Communications": ["pr"],
  "Venture Capital & Fundraising": ["vc"],
  "SaaS & Software": ["saas"],
};

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
  if (keywords.some((k) => haystack.includes(k))) return true;

  // Short abbreviations need a word-boundary match — a plain substring check
  // on "ai" or "pr" would false-positive on "said" or "prize".
  const abbreviations = topics.flatMap((t) => TOPIC_ABBREVIATIONS[t] ?? []);
  return abbreviations.some((a) => new RegExp(`\\b${a}\\b`, "i").test(haystack));
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
