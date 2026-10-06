"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { impostaTema, iscriviTema, leggiTema, type Tema } from "@/lib/theme";

/** Interruttore tema chiaro / scuro. Il tema scuro è quello di partenza. */
export function ThemeToggle() {
  const tema = useSyncExternalStore<Tema>(iscriviTema, leggiTema, () => "dark");
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
