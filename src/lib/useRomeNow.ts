import { useMemo, useSyncExternalStore } from "react";
import { romeNow } from "@/lib/market";

// Chiave al minuto: la pagina si aggiorna da sola quando si passa dalle 13:00, senza ricaricare.
const snapshot = () => {
  const d = romeNow();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
};
const subscribe = (notify: () => void) => {
  const id = setInterval(notify, 20_000);
  return () => clearInterval(id);
};

/** Data e ora in fuso Italia, solo lato client (null durante il render sul server). */
export function useRomeNow(): Date | null {
  const key = useSyncExternalStore(subscribe, snapshot, () => "");
  return useMemo(() => {
    if (!key) return null;
    const [y, m, d, h, mi] = key.split("-").map(Number);
    return new Date(y, m, d, h, mi);
  }, [key]);
}
