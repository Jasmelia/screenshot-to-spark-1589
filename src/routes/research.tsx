import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { BookOpenText, Eye, Pencil, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DemoBadge, ErrorNote, Markdown, PageHeader, Thinking } from "@/components/AiBits";
import { streamAi } from "@/lib/ai-client";
import { logActivity, useDemoMode } from "@/lib/store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summaries, key insights and actionable recommendations from topics, articles or URLs." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Turn topics and articles into decision-ready briefs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

type Mode = "topic" | "article" | "url";

function ResearchPage() {
  const [demo] = useDemoMode();
  const [mode, setMode] = useState<Mode>("topic");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  async function run() {
    if (!input.trim()) return setError("Add something to research first.");
    setError(""); setLoading(true); setOutput(""); setEditing(false);
    abort.current = new AbortController();
    try {
      const text = await streamAi({ kind: "research", mode, input }, setOutput, { demo, signal: abort.current.signal });
      if (text) logActivity("research", `Research: ${input}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader icon={BookOpenText} title="AI Research Assistant" description="Get a summary, key insights and recommendations you can act on." />
      <div className="card-surface space-y-4 p-5">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setError(""); }}>
          <TabsList>
            <TabsTrigger value="topic">Topic</TabsTrigger>
            <TabsTrigger value="article">Paste article</TabsTrigger>
            <TabsTrigger value="url">Website URL</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "article" ? (
          <Textarea rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste the article or report text here…" aria-label="Article text" />
        ) : (
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && run()}
            aria-label={mode === "url" ? "Website URL" : "Topic"}
            placeholder={mode === "url" ? "https://example.com/article" : "e.g. Benefits of a 4-day work week for software teams"} />
        )}
        {mode === "url" && <p className="text-xs text-muted-foreground">Note: the assistant can’t open web pages. It analyses the URL from general knowledge — paste the article text for an accurate summary.</p>}
        {error && <ErrorNote message={error} />}
        <div className="flex justify-end">
          {loading ? (
            <Button variant="outline" onClick={() => abort.current?.abort()}><Square /> Stop</Button>
          ) : (
            <Button size="lg" onClick={run}><Sparkles /> Analyse</Button>
          )}
        </div>
      </div>

      <div className="card-surface mt-5 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-bold">Research brief</h2>
          <DemoBadge />
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" disabled={!output || loading} onClick={() => setEditing((v) => !v)}>
              {editing ? <><Eye /> Preview</> : <><Pencil /> Edit</>}
            </Button>
            <CopyButton text={output} />
          </div>
        </div>
        {loading && !output && <Thinking label="Analysing…" />}
        {!loading && !output && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            <BookOpenText className="mx-auto mb-2 size-8 opacity-40" />Your summary, insights and recommendations will appear here.
          </div>
        )}
        {output && (editing
          ? <Textarea aria-label="Edit brief" rows={18} value={output} onChange={(e) => setOutput(e.target.value)} className="font-mono text-xs" />
          : <Markdown text={output} />)}
      </div>
    </div>
  );
}
