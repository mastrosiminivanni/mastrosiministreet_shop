export type Tema = "dark" | "light";

const EVENTO = "ms-theme";
const CHIAVE = "ms-theme";
const MEDIA_CHIARO = "(prefers-color-scheme: light)";

export function leggiTema(): Tema {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function iscriviTema(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  return () => window.removeEventListener(EVENTO, cb);
}

/** Scelta fatta a mano con il pulsante, se c'è: vince sull'impostazione del telefono. */
function sceltaSalvata(): Tema | null {
  try {
    const v = localStorage.getItem(CHIAVE);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function temaDelTelefono(): Tema {
  return window.matchMedia(MEDIA_CHIARO).matches ? "light" : "dark";
}

function applica(t: Tema) {
  document.documentElement.dataset.theme = t;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", t === "light" ? "#f4f4f2" : "#0c0c0c");
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Cambia tema con il pulsante. Se si sceglie un tema diverso da quello del telefono la scelta si ricorda sul dispositivo;
 * se si sceglie lo stesso del telefono la scelta si cancella e il sito torna ad "automatico" (segue il telefono).
 */
export function impostaTema(t: Tema) {
  try {
    if (t === temaDelTelefono()) localStorage.removeItem(CHIAVE);
    else localStorage.setItem(CHIAVE, t);
  } catch {
    // modalità privata o memoria bloccata: il tema vale solo per questa visita
  }
  applica(t);
}

/**
 * Finché non si è scelto a mano, il sito segue il telefono anche mentre è aperto
 * (per esempio quando scatta la modalità scura serale). Ritorna la funzione che smette di ascoltare.
 */
export function seguiTelefono() {
  // Una scelta salvata uguale al telefono non serve a nulla e impedirebbe al sito di seguirlo quando cambia: si cancella.
  if (sceltaSalvata() === temaDelTelefono()) {
    try {
      localStorage.removeItem(CHIAVE);
    } catch {
      // memoria bloccata: niente da cancellare
    }
  }
  const mq = window.matchMedia(MEDIA_CHIARO);
  const cambia = () => {
    if (sceltaSalvata()) return;
    const t = temaDelTelefono();
    if (t !== leggiTema()) applica(t);
  };
  mq.addEventListener("change", cambia);
  return () => mq.removeEventListener("change", cambia);
}

/** Eseguito prima del disegno della pagina: sceglie il tema (scelta a mano, altrimenti telefono) senza lampi di quello sbagliato. */
export const SCRIPT_TEMA = `(function(){var t=null;try{t=localStorage.getItem("${CHIAVE}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("${MEDIA_CHIARO}").matches?"light":"dark"}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f4f4f2":"#0c0c0c")})()`;
