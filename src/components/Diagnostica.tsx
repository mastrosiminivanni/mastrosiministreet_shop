"use client";

import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { useCan3D } from "@/lib/webgl";

type Riga = [string, string, "ok" | "no" | "info"];

/** Controlla cosa supporta il browser e se i file del furgone si scaricano. */
export function Diagnostica() {
  const sito3D = useCan3D();
  const [righe, setRighe] = useState<Riga[]>([]);

  useEffect(() => {
    (async () => {
      const r: Riga[] = [];
      const nav = navigator as Navigator & { deviceMemory?: number };
      r.push(["Browser", navigator.userAgent, "info"]);
      r.push([
        "Schermo",
        `${window.innerWidth}×${window.innerHeight} px, densità ${window.devicePixelRatio}`,
        "info",
      ]);
      r.push([
        "Memoria / processori",
        `${nav.deviceMemory ?? "?"} GB / ${navigator.hardwareConcurrency ?? "?"}`,
        "info",
      ]);
      r.push([
        '"Riduci movimento" attivo',
        String(matchMedia("(prefers-reduced-motion: reduce)").matches),
        "info",
      ]);

      const c = document.createElement("canvas");
      const gl2 = c.getContext("webgl2");
      const gl = gl2 ?? (c.getContext("webgl") as WebGLRenderingContext | null);
      r.push([
        "WebGL",
        gl2 ? "WebGL 2 disponibile" : gl ? "solo WebGL 1" : "NON disponibile",
        gl ? "ok" : "no",
      ]);
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        r.push([
          "Scheda grafica",
          dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "non rilevabile",
          "info",
        ]);
        r.push(["Texture massima", String(gl.getParameter(gl.MAX_TEXTURE_SIZE)), "info"]);
      }

      for (const [nome, url] of [
        ["Modello furgone (van.glb)", "/models/van.glb"],
        ["Decodificatore Draco", "/draco/draco_decoder.wasm"],
        ["Foto del furgone", "/brand/furgone.webp"],
        ["Logo", "/brand/logo-profilo.png"],
      ] as const) {
        try {
          const res = await fetch(asset(url), { cache: "no-store" });
          const kb = Math.round((await res.arrayBuffer()).byteLength / 1024);
          r.push([nome, `${res.status}, ${kb} KB`, res.ok && kb > 0 ? "ok" : "no"]);
        } catch (e) {
          r.push([nome, `errore: ${String(e)}`, "no"]);
        }
      }
      try {
        const img = new Image();
        img.src = asset("/brand/furgone.webp");
        await img.decode();
        r.push(["Immagini WebP", "supportate", "ok"]);
      } catch {
        r.push(["Immagini WebP", "NON supportate", "no"]);
      }
      setRighe(r);
    })();
  }, []);

  return (
    <div className="mt-6">
      <p className="rounded-tag bg-oro p-3 font-extrabold text-nero">
        Il sito sceglie:{" "}
        {sito3D ? "furgone 3D" : "foto fissa del furgone (3D non adatto a questo dispositivo)"}
      </p>
      {righe.length === 0 && <p className="mt-4">Controllo in corso…</p>}
      <dl className="mt-4 space-y-2 text-sm">
        {righe.map(([k, v, s]) => (
          <div key={k} className="rounded-tag border border-white/15 p-3">
            <dt className="font-bold text-oro">
              {s === "ok" && (
                <CheckCircle
                  weight="fill"
                  size={18}
                  aria-label="ok"
                  className="mr-1 inline-block align-text-bottom"
                />
              )}
              {s === "no" && (
                <XCircle
                  weight="fill"
                  size={18}
                  aria-label="errore"
                  className="mr-1 inline-block align-text-bottom"
                />
              )}
              {k}
            </dt>
            <dd className="mt-1 break-words text-bianco/85">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
