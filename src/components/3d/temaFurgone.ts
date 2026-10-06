import {
  Mesh,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
} from "three";
import { asset } from "@/lib/asset";
import { leggiTema, type Tema } from "@/lib/theme";

/** Materiali con la livrea (nel file del furgone) e le texture chiare che li sostituiscono nel tema chiaro. */
const LIVREE: Record<string, string> = {
  Livrea_destra: "lato-destro-colore",
  Livrea_sinistra: "lato-sinistro-colore",
  Livrea_retro: "retro-colore",
};
const VERNICE_CHIARA = "#d8d2c1";

let chiare: Promise<Record<string, Texture>> | null = null;
function caricaChiare() {
  chiare ??= Promise.all(
    Object.entries(LIVREE).map(
      async ([materiale, file]) =>
        [
          materiale,
          await new TextureLoader().loadAsync(asset(`/models/livrea-chiara/${file}.webp`)),
        ] as const,
    ),
  ).then((coppie) => Object.fromEntries(coppie));
  return chiare;
}

function materialiDi(radice: Object3D) {
  const trovati = new Set<MeshStandardMaterial>();
  radice.traverse((o) => {
    const m = (o as Mesh).material as Material | Material[] | undefined;
    for (const x of Array.isArray(m) ? m : m ? [m] : []) trovati.add(x as MeshStandardMaterial);
  });
  return trovati;
}

/**
 * Furgone chiaro nel tema chiaro: carrozzeria crema con le stesse pennellate oro. Le texture chiare si scaricano solo la prima volta
 * che serve; i materiali sono condivisi tra le scene, quindi il cambio vale per tutte. Tornando al tema scuro si ripristina l'originale.
 */
export async function applicaTemaFurgone(radice: Object3D, tema: Tema) {
  if (tema === "light") {
    const texture = await caricaChiare();
    if (leggiTema() !== "light") return; // nel frattempo è tornato scuro
    for (const m of materialiDi(radice)) {
      const nome = m.name;
      if (nome === "Vernice") {
        m.userData.coloreScuro ??= m.color.clone();
        m.color.set(VERNICE_CHIARA);
        m.needsUpdate = true;
      } else if (LIVREE[nome]) {
        const originale = (m.userData.mappaScura ??= m.map) as Texture;
        const t = texture[nome];
        t.flipY = originale.flipY;
        t.colorSpace = SRGBColorSpace;
        t.wrapS = originale.wrapS;
        t.wrapT = originale.wrapT;
        t.anisotropy = originale.anisotropy;
        m.map = t;
        m.needsUpdate = true;
      }
    }
    return;
  }
  for (const m of materialiDi(radice)) {
    if (m.userData.coloreScuro) m.color.copy(m.userData.coloreScuro);
    if (m.userData.mappaScura) m.map = m.userData.mappaScura;
    m.needsUpdate = true;
  }
}
