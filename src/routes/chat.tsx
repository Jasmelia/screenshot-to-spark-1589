import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessagesSquare, SendHorizontal, Square, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, DemoBadge, ErrorNote, Markdown, PageHeader, Thinking } from "@/components/AiBits";
import { streamAi } from "@/lib/ai-client";
import { logActivity, useDemoMode, useLocalState } from "@/lib/store";
import type { ChatMessage } from "@/lib/prompts";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — Workplace AI" },
      { name: "description", content: "Chat with an AI assistant about writing, brainstorming, planning and productivity." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Your on-demand workplace assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const starters = [
  "Help me plan a productive week with 3 big deadlines",
  "Brainstorm 5 ideas to improve team meetings",
  "Rewrite this to sound more confident: I think maybe we could try…",
  "How do I prioritise when everything feels urgent?",
];

function ChatPage() {
  const [demo] = useDemoMode();
  const [messages, setMessages] = useLocalState<ChatMessage[]>("wpa.chat", []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  async function send(text = input) {
    const content = text.trim();
    if (!content || loading) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput(""); setError(""); setLoading(true);
    abort.current = new AbortController();
    try {
      const reply = await streamAi({ kind: "chat", messages: history }, (t) =>
        setMessages([...history, { role: "assistant", content: t }]), { demo, signal: abort.current.signal });
      if (!reply) setMessages(history);
      else if (messages.length === 0) logActivity("chat", `Chat: ${content}`);
    } catch (e) {
      setError((e as Error).message);
      setMessages(history);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <PageHeader icon={MessagesSquare} title="AI Workplace Chatbot" description="Writing, brainstorming, planning and productivity advice." />
        {messages.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setError(""); }}><Trash2 /> Clear chat</Button>}
      </div>
      <div className="card-surface flex h-[calc(100vh-17rem)] min-h-[440px] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg py-8 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-lift"><Sparkles className="size-5" /></div>
              <h2 className="mt-4 text-lg font-bold">How can I help today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {starters.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-xl border bg-card p-3 text-left text-sm transition hover:border-primary hover:bg-sidebar-accent">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                {m.content ? <Markdown text={m.content} /> : <Thinking label="Thinking…" />}
                {m.content && !(loading && i === messages.length - 1) && (
                  <div className="mt-2 flex items-center gap-2"><DemoBadge /><CopyButton text={m.content} /></div>
                )}
              </div>
            </div>
          ))}
          {error && <ErrorNote message={error} />}
          <div ref={end} />
        </div>
        <form className="flex items-end gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <Textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask anything about your work…" className="max-h-40 min-h-11 resize-none" />
          {loading ? (
            <Button type="button" variant="outline" size="icon" className="size-11" onClick={() => abort.current?.abort()} aria-label="Stop"><Square /></Button>
          ) : (
            <Button type="submit" size="icon" className="size-11" disabled={!input.trim()} aria-label="Send"><SendHorizontal /></Button>
          )}
        </form>
      </div>
    </div>
  );
}
