import type { AiRequest } from "./prompts";

export function demoResponse(req: AiRequest): string {
  if (req.kind === "email") {
    const topic = req.instructions.trim().split(/[.\n]/)[0]?.slice(0, 70) || "our recent discussion";
    const to = req.recipient?.trim() || "[Recipient]";
    const from = req.sender?.trim() || "[Your name]";
    const bodies = {
      Formal: `I am writing regarding ${topic.toLowerCase()}. I would like to outline the key points and propose next steps so that we can proceed efficiently.\n\nPlease let me know a convenient time this week to discuss the details. I would be glad to provide any further information you may require.`,
      Friendly: `I hope your week is going well! I wanted to reach out about ${topic.toLowerCase()} and share a quick update.\n\nWould you have a few minutes to chat this week? Happy to work around your schedule — just let me know what suits you.`,
      Persuasive: `I wanted to share an opportunity around ${topic.toLowerCase()} that I believe could make a real difference for your team — saving time and reducing effort from day one.\n\nCould we book a 15-minute call by [date] to walk through it? I'm confident you'll see the value quickly.`,
    };
    const signoff = { Formal: "Kind regards", Friendly: "Cheers", Persuasive: "Best regards" }[req.tone];
    return `Subject: ${req.tone === "Persuasive" ? "Quick idea: " : "Regarding "}${topic}\n\nDear ${to},\n\n${bodies[req.tone]}\n\n${signoff},\n${from}`;
  }
  if (req.kind === "research") {
    const subject = req.input.trim().slice(0, 60);
    return `> Demo mode sample — not generated from your input.\n\n## Summary\n"${subject}" touches on how teams adopt new tools and processes. The core theme is balancing efficiency gains against change-management effort, with the strongest results coming from clear goals and gradual rollout.\n\n## Key insights\n- Early pilots with a small team surface practical issues faster than broad launches.\n- Measurable goals (time saved, error rates) make success easier to prove.\n- Adoption stalls without training and visible leadership support.\n- Integration with existing workflows matters more than feature count.\n\n## Actionable recommendations\n1. Define two or three success metrics before starting.\n2. Run a 4-week pilot with one motivated team.\n3. Collect feedback weekly and adjust.\n4. Share early wins to build momentum.\n\n## Caveats\n- This is sample output; verify against real sources.`;
  }
  return `**Demo mode response** — not generated from your message.\n\nHere's a simple way to approach it:\n\n1. **Clarify the goal** — write one sentence describing the outcome you want.\n2. **Break it down** — list 3–5 concrete steps.\n3. **Prioritise** — pick the step with the biggest impact and do it first.\n4. **Time-box** — block 45 minutes in your calendar to start.\n\nTurn off demo mode to get a tailored answer.`;
}
