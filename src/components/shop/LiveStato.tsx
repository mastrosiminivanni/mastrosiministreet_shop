"use client";

import { nonDisponibile, useCapiLive } from "@/lib/capiLive";

/** Mostra `children` finché il capo è in vendita; se nel frattempo è stato venduto (o tolto) mostra `venduto`. */
export function LiveStato({
  id,
  children,
  venduto,
}: {
  id: string;
  children: React.ReactNode;
  venduto: React.ReactNode;
}) {
  const live = useCapiLive();
  return <>{nonDisponibile(live, id) ? venduto : children}</>;
}
