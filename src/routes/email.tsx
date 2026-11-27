import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Mail, RefreshCw, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton, DemoBadge, ErrorNote, PageHeader, Thinking } from "@/components/AiBits";
import { streamAi } from "@/lib/ai-client";
import { logActivity, useDemoMode } from "@/lib/store";
import type { Tone } from "@/lib/prompts";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate professional emails in Formal, Friendly or Persuasive tone, then edit and copy." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Professional, context-aware emails from your instructions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [demo] = useDemoMode();
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);

  async function generate() {
    if (!instructions.trim()) return setError("Describe what the email should say first.");
    setError(""); setLoading(true); setOutput("");
    abort.current = new AbortController();
    try {
      const text = await streamAi({ kind: "email", instructions, tone, recipient, sender }, setOutput, { demo, signal: abort.current.signal });
      if (text) logActivity("email", `${tone} email: ${instructions}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader icon={Mail} title="Smart Email Generator" description="Describe the email you need. Pick a tone. Edit the draft and copy it." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-surface space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="ins">What should the email say?</Label>
            <Textarea id="ins" rows={7} value={instructions} onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Follow up with Sarah after Tuesday's demo, thank her, attach the pricing deck and propose a call next week." />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Formal", "Friendly", "Persuasive"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Recipient</Label>
              <Input id="to" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Sarah Lee" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">Your name</Label>
              <Input id="from" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Alex" />
            </div>
          </div>
          {error && <ErrorNote message={error} />}
          {loading ? (
            <Button variant="outline" className="w-full" onClick={() => abort.current?.abort()}><Square /> Stop</Button>
          ) : (
            <Button className="w-full" size="lg" onClick={generate}><Sparkles /> Generate email</Button>
          )}
        </div>
        <div className="card-surface flex min-h-[420px] flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="font-bold">Draft</h2>
            <DemoBadge />
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" disabled={loading || !output} onClick={generate}><RefreshCw /> Regenerate</Button>
              <CopyButton text={output} />
            </div>
          </div>
          {loading && !output && <Thinking label="Writing your email…" />}
          {!loading && !output ? (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
              <div className="p-6"><Mail className="mx-auto mb-2 size-8 opacity-40" />Your email draft will appear here — fully editable.</div>
            </div>
          ) : (
            output && <Textarea aria-label="Email draft" className="flex-1 resize-none font-sans text-sm leading-relaxed" value={output} onChange={(e) => setOutput(e.target.value)} />
          )}
        </div>
      </div>
    </div>
  );
}
