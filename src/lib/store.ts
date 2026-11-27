import { useCallback, useEffect, useState } from "react";

export type Activity = { id: string; type: "email" | "research" | "chat"; title: string; at: number };

const ACT_KEY = "wpa.activity";
const DEMO_KEY = "wpa.demo";
const EVT = "wpa-store";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function logActivity(type: Activity["type"], title: string) {
  const list = read<Activity[]>(ACT_KEY, []);
  list.unshift({ id: `${Date.now()}`, type, title: title.slice(0, 90), at: Date.now() });
  localStorage.setItem(ACT_KEY, JSON.stringify(list.slice(0, 20)));
  window.dispatchEvent(new Event(EVT));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

export const useActivity = () => useStored<Activity[]>(ACT_KEY, []);

export function useDemoMode() {
  const demo = useStored<boolean>(DEMO_KEY, false);
  const setDemo = useCallback((v: boolean) => {
    localStorage.setItem(DEMO_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event(EVT));
  }, []);
  return [demo, setDemo] as const;
}

export function useLocalState<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setV(read(key, fallback));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v, loaded]);
  return [v, setV] as const;
}
