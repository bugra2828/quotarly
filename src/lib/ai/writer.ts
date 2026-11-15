import Anthropic from "@anthropic-ai/sdk";

// Interview mode. The AI never writes the pitch itself, because journalist
// request services ban AI-written answers:
//   1. askInterviewQuestions: 2-3 short questions about the journalist's request
//   2. the expert answers in their own words
//   3. assemblePitch: orders and proofreads those answers, adding nothing new

const MODEL = "claude-sonnet-5";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ExpertForWriter = {
  display_name: string;
  job_title: string | null;
  company: string | null;
};

export type InterviewQuestions = {
  subject: string;
  questions: string[];
};

const QUESTIONS_TOOL: Anthropic.Tool = {
  name: "ask_questions",
  description:
    "Give the email subject line and the 2-3 questions the expert should answer.",
  input_schema: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description: "Email subject line for the reply to the journalist.",
      },
      questions: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 3,
      },
    },
    required: ["subject", "questions"],
  },
};

export async function askInterviewQuestions(
  queryText: string,
  requirements: string | null,
  expert: ExpertForWriter
): Promise<InterviewQuestions> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You help ${expert.display_name}, ${expert.job_title ?? "an expert"} at ${
      expert.company ?? "their company"
    }, answer a journalist's request in their own words.

Do not write the answer. Instead, ask 2-3 short questions that draw out what the
journalist needs from this expert's real experience. Good questions ask for:
- one real example or story from their own work,
- one concrete number or result, if the request calls for it,
- one practical, one-sentence piece of advice.

Each question must be answerable in 1-3 sentences, specific to this request,
and written in plain English. If the request lists required points or a format,
make sure the answers will cover them.`,
    tools: [QUESTIONS_TOOL],
    tool_choice: { type: "tool", name: "ask_questions" },
    messages: [
      {
        role: "user",
        content: `JOURNALIST REQUEST:\n${queryText}\n\nREQUIREMENTS:\n${
          requirements ?? "(none specified)"
        }`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  const input = (toolUse?.input ?? {}) as Partial<InterviewQuestions>;
  const questions = (input.questions ?? [])
    .map((q) => String(q).trim())
    .filter(Boolean)
    .slice(0, 3);

  if (questions.length === 0) throw new Error("no interview questions generated");

  return { subject: String(input.subject ?? "").trim(), questions };
}

export type InterviewAnswer = { question: string; answer: string };

const PITCH_TOOL: Anthropic.Tool = {
  name: "assemble_pitch",
  description: "Return the finished email body built only from the expert's answers.",
  input_schema: {
    type: "object",
    properties: { body: { type: "string" } },
    required: ["body"],
  },
};

function signature(expert: ExpertForWriter): string {
  const role = [expert.job_title, expert.company].filter(Boolean).join(", ");
  return role ? `${expert.display_name}\n${role}` : expert.display_name;
}

/** The answers joined as-is, used when the AI output can't be trusted. */
export function plainPitch(answers: InterviewAnswer[], expert: ExpertForWriter): string {
  const paragraphs = answers.map((a) => a.answer.trim()).filter(Boolean);
  return ["Hi,", ...paragraphs, `Best,\n${signature(expert)}`].join("\n\n");
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
}

/**
 * True when the assembled body stays close to the expert's own answers. The
 * greeting, sign-off and signature are allowed on top; anything beyond a few
 * extra words means the model started writing, so the caller falls back.
 */
export function staysWithinAnswers(
  body: string,
  answers: InterviewAnswer[],
  expert: ExpertForWriter
): boolean {
  const source = new Set(
    words([...answers.map((a) => a.answer), signature(expert)].join(" "))
  );
  const allowed = new Set(["hi", "hello", "best", "thanks", "regards", "thank", "you"]);
  const added = words(body).filter((w) => !source.has(w) && !allowed.has(w));
  const answerWords = words(answers.map((a) => a.answer).join(" ")).length;
  return added.length <= Math.max(8, Math.round(answerWords * 0.1));
}

export async function assemblePitch(
  queryText: string,
  answers: InterviewAnswer[],
  expert: ExpertForWriter
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a copy editor. Turn the expert's own answers into a short
email reply to a journalist.

Strict rules:
- Use only the expert's own sentences. Do not add new sentences, facts,
  numbers, examples or opinions, and do not expand on what they wrote.
- You may put the answers in the order that best answers the request, join
  them into paragraphs, and fix spelling, grammar and punctuation.
- Keep their wording and voice. Do not make it sound more polished or formal.
- Start with "Hi," and end with "Best," followed by this signature exactly:
${signature(expert)}`,
    tools: [PITCH_TOOL],
    tool_choice: { type: "tool", name: "assemble_pitch" },
    messages: [
      {
        role: "user",
        content: `JOURNALIST REQUEST:\n${queryText}\n\nEXPERT'S ANSWERS:\n${answers
          .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`)
          .join("\n\n")}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  const body = String((toolUse?.input as { body?: string } | undefined)?.body ?? "").trim();

  if (!body || !staysWithinAnswers(body, answers, expert)) {
    return plainPitch(answers, expert);
  }
  return body;
}
