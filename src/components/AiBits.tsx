import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/lib/store";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!text.trim()}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy — select the text and copy manually.");
        }
      }}
    >
      {done ? <Check /> : <Copy />} {done ? "Copied" : label}
    </Button>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Thinking({ label = "Generating…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-primary" /> {label}
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-ai text-sm">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export function DemoBadge() {
  const [demo] = useDemoMode();
  if (!demo) return null;
  return (
    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
      Demo sample — not live AI
    </span>
  );
}

export function PageHeader({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sidebar-accent text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
      Responsible AI: outputs are generated automatically and may contain errors, outdated or biased information. Always review and verify before professional use.
    </p>
  );
}
