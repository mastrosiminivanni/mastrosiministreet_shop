export type Tema = "dark" | "light";

const EVENTO = "ms-theme";
const CHIAVE = "ms-theme";

export function leggiTema(): Tema {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function iscriviTema(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  return () => window.removeEventListener(EVENTO, cb);
}

/** Cambia tema, lo ricorda sul dispositivo e avvisa chi lo ascolta (selettore, scena 3D). */
export function impostaTema(t: Tema) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(CHIAVE, t);
  } catch {
    // modalità privata o memoria bloccata: il tema vale solo per questa visita
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", t === "light" ? "#f4f4f2" : "#0c0c0c");
  window.dispatchEvent(new Event(EVENTO));
}

/** Eseguito prima del disegno della pagina: evita il lampo di tema sbagliato. */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CHIAVE}");if(t==="light"){document.documentElement.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#f4f4f2")}}catch(e){}})()`;
