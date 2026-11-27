import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, Mail, MessagesSquare, Clock, Inbox } from "lucide-react";
import { useActivity } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, summarise research and get workplace advice with AI, all from one dashboard." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, summarise research and get workplace advice with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const features = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Turn rough notes into polished emails in Formal, Friendly or Persuasive tone.", cta: "Write an email" },
  { to: "/research", icon: BookOpenText, title: "AI Research Assistant", desc: "Summaries, key insights and next steps from a topic, article or URL.", cta: "Start research" },
  { to: "/chat", icon: MessagesSquare, title: "Workplace Chatbot", desc: "Brainstorm, plan and get productivity advice in a natural conversation.", cta: "Open chat" },
] as const;

const icons = { email: Mail, research: BookOpenText, chat: MessagesSquare };

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function Dashboard() {
  const activity = useActivity();
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-lift sm:p-10">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-accent/30 blur-3xl" />
        <p className="text-sm font-semibold opacity-80">Welcome back 👋</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">Get through today’s work faster, with an assistant that writes, researches and plans.</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="rounded-xl">
            <Link to="/email">Draft an email <ArrowRight /></Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground">
            <Link to="/chat">Ask the assistant</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">Tools</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="card-surface group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-foreground"><f.icon className="size-5" /></div>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">{f.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card-surface p-5">
          <h2 className="font-bold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {[
              { to: "/email", label: "Follow up after a meeting" },
              { to: "/research", label: "Summarise an article" },
              { to: "/chat", label: "Plan my week" },
            ].map((q) => (
              <Link key={q.label} to={q.to} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm font-medium transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                {q.label} <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>
        <div className="card-surface p-5">
          <h2 className="font-bold">Recent activity</h2>
          {activity.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
              <Inbox className="mb-2 size-8 opacity-50" />
              Nothing yet. Your generated emails, research and chats will appear here.
            </div>
          ) : (
            <ul className="mt-3 divide-y">
              {activity.slice(0, 6).map((a) => {
                const Icon = icons[a.type];
                return (
                  <li key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <Icon className="size-4 text-primary" />
                    <span className="truncate text-sm">{a.title}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{timeAgo(a.at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
