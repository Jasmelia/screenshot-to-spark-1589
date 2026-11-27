export type Tone = "Formal" | "Friendly" | "Persuasive";
export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AiRequest =
  | { kind: "email"; instructions: string; tone: Tone; recipient?: string; sender?: string }
  | { kind: "research"; mode: "topic" | "article" | "url"; input: string }
  | { kind: "chat"; messages: ChatMessage[] };

type Built = { instructions: string; messages: ChatMessage[] } | { error: string };

const MAX = 24000;

export function buildPrompt(req: AiRequest): Built {
  if (req.kind === "email") {
    const text = req.instructions?.trim();
    if (!text) return { error: "Describe what the email should say." };
    const toneGuide: Record<Tone, string> = {
      Formal: "polished, respectful and precise; no slang; clear structure",
      Friendly: "warm, approachable and conversational while still professional",
      Persuasive: "confident and benefit-led, with a clear call to action and light urgency, never pushy",
    };
    return {
      instructions: [
        "You are an expert business communications writer.",
        `Write one complete professional email in a ${req.tone} tone: ${toneGuide[req.tone]}.`,
        "Output format exactly:\nSubject: <subject line>\n\n<greeting>,\n\n<body paragraphs>\n\n<sign-off>,\n<sender name>",
        "Use specific details from the instructions; never invent facts like dates, prices or names that were not given — use a short [placeholder] in brackets instead.",
        "Keep it concise (120–220 words) unless the instructions require more. Plain text only, no markdown.",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: `Instructions: ${text.slice(0, MAX)}\nRecipient: ${req.recipient?.trim() || "not specified"}\nSender: ${req.sender?.trim() || "not specified"}`,
        },
      ],
    };
  }
  if (req.kind === "research") {
    const input = req.input?.trim();
    if (!input) return { error: "Add a topic, article text or URL to research." };
    if (req.mode === "url" && !/^https?:\/\/\S+\.\S+/.test(input))
      return { error: "Enter a full web address starting with http:// or https://." };
    const source =
      req.mode === "topic"
        ? `Topic to research: ${input}`
        : req.mode === "article"
          ? `Article text:\n"""\n${input.slice(0, MAX)}\n"""`
          : `URL: ${input}\nYou cannot browse the web. Base the analysis on what you reliably know about this site/page and its subject, and say clearly at the top that the page content itself was not fetched.`;
    return {
      instructions: [
        "You are a senior research analyst helping a professional make decisions.",
        "Produce a structured brief in markdown with exactly these sections:",
        "## Summary (3–5 sentences)\n## Key insights (4–6 bullets, each specific and evidence-based)\n## Actionable recommendations (3–5 numbered, concrete next steps)\n## Caveats (1–3 bullets on gaps, uncertainty or what to verify)",
        "Be specific to the source. Avoid generic filler. Do not fabricate statistics; if unsure, say so.",
      ].join("\n"),
      messages: [{ role: "user", content: source }],
    };
  }
  const msgs = (req.messages ?? []).filter((m) => m.content?.trim()).slice(-20);
  if (!msgs.length || msgs[msgs.length - 1]?.role !== "user") return { error: "Type a message first." };
  return {
    instructions: [
      "You are Nova, a workplace productivity assistant inside a SaaS dashboard.",
      "Help with writing, brainstorming, planning, prioritisation, meetings and productivity advice.",
      "Give practical, specific answers; use short headings, bullets or numbered steps when helpful (markdown allowed).",
      "Ask one clarifying question only if the request is truly ambiguous. Politely steer non-work topics back to work.",
    ].join("\n"),
    messages: msgs.map((m) => ({ role: m.role, content: m.content.slice(0, MAX) })),
  };
}
