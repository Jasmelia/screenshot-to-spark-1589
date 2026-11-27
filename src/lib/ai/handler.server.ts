import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id";
import { buildPrompt, type AiRequest } from "../prompts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleAi(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return errorResponse(500, "AI is not configured for this app.");
  let body: AiRequest;
  try {
    body = (await request.json()) as AiRequest;
  } catch {
    return errorResponse(400, "Invalid request.");
  }
  const built = buildPrompt(body);
  if ("error" in built) return errorResponse(400, built.error);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: built.instructions,
    messages: built.messages as ModelMessage[],
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
          if (part.type === "error") {
            controller.enqueue(encoder.encode(`\u0000ERR${friendly(part.error)}`));
          }
        }
      } catch (e) {
        if (!request.signal.aborted) controller.enqueue(encoder.encode(`\u0000ERR${friendly(e)}`));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function friendly(e: unknown): string {
  const status = (e as { statusCode?: number })?.statusCode;
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits are used up for this workspace. Add credits to continue, or switch to demo mode.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  return "The AI service had a problem generating a response. Please try again.";
}
