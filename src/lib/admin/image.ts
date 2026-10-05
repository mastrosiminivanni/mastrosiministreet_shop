import type { FotoPronta } from "./types";

const LATO_GRANDE = 1400;
const LATO_PICCOLO = 560;

/** Codifica il canvas in WebP; se il browser non sa (Safari più vecchi) usa JPEG. */
async function codifica(
  canvas: HTMLCanvasElement,
  qualita: number,
): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const webp = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", qualita));
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpg = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", qualita));
  if (!jpg) throw new Error("Non riesco a elaborare questa foto.");
  return { blob: jpg, ext: "jpg" };
}

function ridimensiona(bmp: ImageBitmap, latoMax: number) {
  const scala = Math.min(1, latoMax / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scala);
  c.height = Math.round(bmp.height * scala);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

/** Foto del telefono -> versione leggera per il sito (grande + miniatura), con la rotazione giusta. */
export async function preparaFoto(file: File): Promise<FotoPronta> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const grande = await codifica(ridimensiona(bmp, LATO_GRANDE), 0.82);
    const piccola = await codifica(ridimensiona(bmp, LATO_PICCOLO), 0.78);
    return {
      full: grande.blob,
      thumb: piccola.blob,
      ext: grande.ext,
      preview: URL.createObjectURL(piccola.blob),
    };
  } finally {
    bmp.close();
  }
}

/** Blob -> data URL (per la modalità prova, dove le foto restano nel browser). */
export const aDataUrl = (b: Blob) =>
  new Promise<string>((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => no(r.error);
    r.readAsDataURL(b);
  });
