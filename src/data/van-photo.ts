/**
 * Misure della foto del furgone (public/brand/furgone.webp, originale 1448x1086 px)
 * usate per sovrapporre le ruote che girano. Generate da scripts/make-wheels.mjs.
 */
export const PHOTO_W = 1448;
export const PHOTO_H = 1086;

export type PhotoWheel = {
  texture: string;
  /** ellisse del cerchio (px) */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** centro del mozzo (px), spostato dalla prospettiva */
  hx: number;
  hy: number;
};

export const PHOTO_WHEELS: PhotoWheel[] = [
  { texture: "/brand/ruota-posteriore.webp", cx: 776, cy: 898, rx: 54, ry: 86, hx: 775, hy: 887.5 },
  { texture: "/brand/ruota-anteriore.webp", cx: 1340.5, cy: 813, rx: 30, ry: 55, hx: 1340, hy: 807 },
];

/** Raggio gomma / raggio cerchio, per convertire lo spostamento in rotazione. */
export const TYRE_TO_RIM = 1.5;
/** Raggio del coprimozzo rispetto al cerchio. */
export const CAP_TO_RIM = 0.34;
