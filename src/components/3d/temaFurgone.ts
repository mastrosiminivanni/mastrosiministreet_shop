import {
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader,
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
const VERNICE_CHIARA = "#ddd7c7"; // come lo sfondo delle texture della livrea: pannelli verniciati e pannelli con livrea hanno lo stesso colore

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

const èCarrozzeria = (m: { name: string }) => m.name === "Vernice" || m.name in LIVREE;

/**
 * Materiale "gemello" opaco per il tema chiaro: vernice crema e pennellate oro senza riflessi (niente lucido, niente metallo).
 * L'originale non si tocca: tornando al tema scuro si rimette lui.
 */
function gemelloChiaro(m: MeshStandardMaterial, texture: Record<string, Texture>) {
  const esistente = m.userData.gemelloChiaro as MeshStandardMaterial | undefined;
  if (esistente) return esistente;
  const g = new MeshStandardMaterial({
    name: m.name,
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.15,
  });
  if (m.name === "Vernice") {
    g.color.set(VERNICE_CHIARA);
  } else {
    const t = texture[m.name];
    const originale = m.map as Texture;
    t.flipY = originale.flipY;
    t.colorSpace = SRGBColorSpace;
    t.wrapS = originale.wrapS;
    t.wrapT = originale.wrapT;
    t.anisotropy = originale.anisotropy;
    g.map = t;
  }
  m.userData.gemelloChiaro = g;
  return g;
}

/**
 * Furgone chiaro nel tema chiaro: carrozzeria crema opaca con le stesse pennellate oro. Le texture chiare si scaricano solo la prima volta
 * che serve; i materiali sono condivisi tra le scene, quindi il cambio vale per tutte.
 */
export async function applicaTemaFurgone(radice: Object3D, tema: Tema) {
  const texture = tema === "light" ? await caricaChiare() : null;
  if (tema === "light" && leggiTema() !== "light") return; // nel frattempo è tornato scuro
  radice.traverse((o) => {
    const mesh = o as Mesh;
    const m = mesh.material as MeshStandardMaterial | undefined;
    if (texture) {
      if (m && !Array.isArray(m) && èCarrozzeria(m)) {
        mesh.userData.originale = m;
        mesh.material = gemelloChiaro(m, texture);
      }
    } else if (mesh.userData.originale) {
      mesh.material = mesh.userData.originale as MeshStandardMaterial;
      delete mesh.userData.originale;
    }
  });
}
