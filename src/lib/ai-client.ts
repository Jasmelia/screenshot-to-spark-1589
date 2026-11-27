import type { AiRequest } from "./prompts";
import { demoResponse } from "./demo";

export async function streamAi(
  req: AiRequest,
  onText: (full: string) => void,
  opts: { demo: boolean; signal?: AbortSignal },
): Promise<string> {
  if (opts.demo) {
    const text = demoResponse(req);
    let out = "";
    for (const word of text.split(/(\s+)/)) {
      if (opts.signal?.aborted) break;
      out += word;
      onText(out);
      await new Promise((r) => setTimeout(r, 12));
    }
    return out;
  }
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: opts.signal ?? null,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") return "";
    throw new Error("Couldn't reach the AI service. Check your connection, or turn on demo mode.");
  }
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let out = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      out += dec.decode(value, { stream: true });
      const errAt = out.indexOf("\u0000ERR");
      if (errAt >= 0) throw new Error(out.slice(errAt + 4) || "AI error.");
      onText(out);
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return out;
    throw e;
  }
  if (!out.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return out;
}
