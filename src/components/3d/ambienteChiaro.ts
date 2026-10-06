import {
  BackSide,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
} from "three";

/** Colore del cielo/terra in base all'altezza (y da -1 a 1): cielo chiaro in alto, orizzonte morbido, terra più scura (la strada). */
function coloreAltezza(y: number) {
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const sm = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const terra = 0.08;
  const orizzonte = 0.5;
  const cielo = 1.2;
  const base = mix(terra, orizzonte, sm(-0.12, 0.06, y));
  return mix(base, cielo, sm(0.06, 0.9, y));
}

/** Striscia luminosa (softbox) rivolta verso il centro: è ciò che si vede riflesso come "lampo" sulla vernice. */
function striscia(
  larghezza: number,
  altezza: number,
  intensita: number,
  x: number,
  y: number,
  z: number,
) {
  const m = new MeshBasicMaterial({ side: DoubleSide });
  m.color.setScalar(intensita);
  const mesh = new Mesh(new PlaneGeometry(larghezza, altezza), m);
  mesh.position.set(x, y, z);
  mesh.lookAt(0, 0, 0);
  return mesh;
}

/**
 * Ambiente da studio fotografico per il furgone chiaro, generato in codice (nessun file da scaricare):
 * orizzonte con cielo e terra, un grande pannello sopra e strisce laterali. Con la vernice lucida produce i riflessi di una foto d'auto.
 */
export function creaAmbienteChiaro(gl: WebGLRenderer): Texture {
  const scena = new Scene();
  const geo = new SphereGeometry(60, 48, 24);
  const pos = geo.getAttribute("position");
  const col: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const v = coloreAltezza(pos.getY(i) / 60);
    col.push(v * 1.0, v * 0.985, v * 0.95); // leggermente caldo, come la luce del mercato
  }
  geo.setAttribute("color", new Float32BufferAttribute(col, 3));
  scena.add(new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide })));
  scena.add(striscia(46, 26, 7, 0, 36, 4)); // pannello grande sopra
  scena.add(striscia(7, 34, 5, -34, 12, 8)); // striscia lunga a sinistra
  scena.add(striscia(7, 34, 4.2, 34, 12, -6)); // striscia lunga a destra
  scena.add(striscia(30, 5, 3.5, 0, 6, -40)); // fascia dietro, per i bordi
  // davanti al furgone (dietro la telecamera): è ciò che si specchia sulla fiancata che si vede
  scena.add(striscia(24, 15, 6.5, -14, 11, 42)); // pannello morbido
  scena.add(striscia(5, 26, 5.5, 20, 7, 40)); // striscia verticale
  scena.add(striscia(30, 4, 3, 0, 22, 36)); // fascia alta
  scena.background = new Color(0x000000);
  const pmrem = new PMREMGenerator(gl);
  const tex = pmrem.fromScene(scena, 0.015).texture;
  pmrem.dispose();
  geo.dispose();
  return tex;
}
