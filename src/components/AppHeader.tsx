import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useDemoMode } from "@/lib/store";

export function AppHeader() {
  const [demo, setDemo] = useDemoMode();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-3 backdrop-blur sm:px-5">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-2.5">
        <span
          className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${demo ? "bg-accent text-accent-foreground" : "bg-sidebar-accent text-sidebar-accent-foreground"}`}
        >
          {demo ? "Demo mode · sample outputs" : "Live AI"}
        </span>
        <label htmlFor="demo" className="text-sm text-muted-foreground">Demo</label>
        <Switch id="demo" checked={demo} onCheckedChange={setDemo} aria-label="Toggle demo mode" />
      </div>
    </header>
  );
}
