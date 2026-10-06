"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useSyncExternalStore } from "react";
import { impostaTema, iscriviTema, leggiTema, seguiTelefono, type Tema } from "@/lib/theme";

/** Interruttore tema chiaro / scuro. Alla prima visita il tema è quello del telefono; il pulsante fissa la scelta. */
export function ThemeToggle() {
  const tema = useSyncExternalStore<Tema>(iscriviTema, leggiTema, () => "dark");
  useEffect(() => seguiTelefono(), []);
  const scuro = tema === "dark";
  return (
    <button
      type="button"
      onClick={() => impostaTema(scuro ? "light" : "dark")}
      aria-label={scuro ? "Passa al tema chiaro" : "Passa al tema scuro"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 hover:border-oro hover:text-oro"
    >
      {scuro ? <Sun size={22} aria-hidden="true" /> : <Moon size={22} aria-hidden="true" />}
    </button>
  );
}
