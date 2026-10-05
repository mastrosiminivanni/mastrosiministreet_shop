import { useSyncExternalStore } from "react";

let cached: boolean | undefined;

/** WebGL disponibile, dispositivo non lento e nessun "riduci movimento". Calcolato una volta. */
function detect(): boolean {
  if (cached !== undefined) return cached;
  try {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const slow = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2;
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    cached = !!gl && !reduced && !slow;
  } catch {
    cached = false;
  }
  return cached;
}

const subscribe = () => () => {};

/** true solo lato client e solo se il 3D è sensato; altrimenti si mostra il fallback statico. */
export function useCan3D(): boolean {
  return useSyncExternalStore(subscribe, detect, () => false);
}

/** Mobile/touch: niente ombre costose. */
export function isLowPower(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}
