import { useMemo, useSyncExternalStore } from "react";
import { romeNow } from "@/lib/market";

const subscribe = () => () => {};
// Chiave "yyyy-m-d" stabile: si calcola sul client, nessuna data bloccata al build.
const snapshot = () => {
  const d = romeNow();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** "Oggi" in fuso Italia, solo lato client (null durante il render sul server). */
export function useToday(): Date | null {
  const key = useSyncExternalStore(subscribe, snapshot, () => "");
  return useMemo(() => {
    if (!key) return null;
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m, d);
  }, [key]);
}
