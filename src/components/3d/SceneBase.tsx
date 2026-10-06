"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { iscriviTema, leggiTema, type Tema } from "@/lib/theme";
import { isLowPower } from "@/lib/webgl";
import { creaAmbienteChiaro } from "./ambienteChiaro";

/** Strada con linea tratteggiata oro: asfalto scuro nel tema scuro, grigio chiaro nel tema chiaro. */
export function Road({ length = 80 }: { length?: number }) {
  const dashes = Math.floor(length / 2.4);
  const chiaro = useSyncExternalStore<Tema>(iscriviTema, leggiTema, () => "dark") === "light";
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[length, 7]} />
        <meshStandardMaterial
          color={chiaro ? "#a9a59a" : "#121212"}
          roughness={1}
          envMapIntensity={0.05}
        />
      </mesh>
      {Array.from({ length: dashes }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-length / 2 + i * 2.4 + 1, 0.004, 1.9]}
        >
          <planeGeometry args={[1.2, 0.09]} />
          <meshBasicMaterial color={chiaro ? "#8a6414" : "#d4a85c"} />
        </mesh>
      ))}
    </group>
  );
}

/** Riflessi per i materiali metallici (oro, cromature) generati in codice: nessun file HDR da scaricare. */
function StudioReflections({ chiaro }: { chiaro: boolean }) {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    if (chiaro) return creaAmbienteChiaro(gl);
    const pmrem = new PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl, chiaro]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

/** Allontana la camera su schermi stretti (mobile verticale) perché il furgone entri sempre intero. */
function FitCamera({ base }: { base: number }) {
  useFrame(({ camera, size }) => {
    const fov = ((camera as { fov?: number }).fov ?? 38) * (Math.PI / 180);
    const needed = 9.6 / (2 * Math.tan(fov / 2) * (size.width / size.height));
    camera.position.z = Math.max(base, needed);
  });
  return null;
}

/** Dopo questo tempo senza tocchi, movimenti del mouse o scorrimenti la scena smette di ridisegnarsi (e riparte al primo gesto). */
const RIPOSO_DOPO_MS = 2500;
const GESTI = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

// Il primo furgone disegnato: finché non c'è, il conto alla rovescia del riposo non parte (altrimenti la scena si fermerebbe vuota).
let furgonePronto = false;
if (typeof window !== "undefined")
  window.addEventListener("ms-van-ready", () => (furgonePronto = true), { once: true });

/** Canvas con le regole di performance del progetto + luci calde e rim-light oro. */
export function SceneCanvas({
  children,
  camera = [0, 2.6, 11.5],
}: {
  children: React.ReactNode;
  camera?: [number, number, number];
}) {
  const low = isLowPower();
  // "?poster" serve solo a scripts/genera-poster.mjs: scena su sfondo trasparente per ricavare l'immagine di partenza
  const senzaSfondo = typeof window !== "undefined" && window.location.search.includes("poster");
  const tema = useSyncExternalStore<Tema>(iscriviTema, leggiTema, () => "dark");
  // La scena si ferma quando esce dallo schermo: risparmia batteria e lascia il telefono libero per il resto della pagina.
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // Scena a riposo: ferma da sola dopo qualche secondo di inattività. Un disegno continuo e infinito tiene il telefono occupato
  // per sempre (batteria, e per i test di velocità il browser non è mai "libero").
  const [attiva, setAttiva] = useState(true);
  useEffect(() => {
    let timer: number | undefined;
    let pronto = furgonePronto;
    const riposa = () => {
      window.clearTimeout(timer);
      if (pronto) timer = window.setTimeout(() => setAttiva(false), RIPOSO_DOPO_MS);
    };
    const sveglia = () => {
      setAttiva(true);
      riposa();
    };
    const appenaPronto = () => {
      pronto = true;
      riposa();
    };
    riposa();
    window.addEventListener("ms-van-ready", appenaPronto);
    for (const g of GESTI) window.addEventListener(g, sveglia, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("ms-van-ready", appenaPronto);
      for (const g of GESTI) window.removeEventListener(g, sveglia);
    };
  }, []);
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="h-full w-full">
      <Canvas
        frameloop={visible && attiva ? "always" : "never"}
        dpr={low ? [1, 1.5] : [1, 1.75]}
        shadows={!low}
        camera={{ position: camera, fov: 38 }}
        gl={{ antialias: !low, powerPreference: "high-performance" }}
        scene={{ environmentIntensity: tema === "light" ? 1.2 : 0.9 }}
        aria-hidden="true"
      >
        {!senzaSfondo && (
          <color attach="background" args={[tema === "light" ? "#f4f4f2" : "#0c0c0c"]} />
        )}
        <hemisphereLight args={["#ffffff", "#1a1208", tema === "light" ? 0.15 : 0.5]} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={tema === "light" ? 0.8 : 2.4}
          color="#fff3e0"
          castShadow={!low}
        />
        <directionalLight
          position={[-5, 3, -4]}
          intensity={tema === "light" ? 1.2 : 1.6}
          color="#d4a85c"
        />
        <FitCamera base={camera[2]} />
        <StudioReflections chiaro={tema === "light"} />
        <Suspense fallback={null}>{children}</Suspense>
        {!low && (
          <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={14} blur={2.2} far={3} />
        )}
      </Canvas>
    </div>
  );
}
