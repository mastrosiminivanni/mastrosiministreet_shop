"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const NERO = "#0c0c0c";
const ORO = "#d4a85c";
const BIANCO = "#f4f4f2";
const CORPO = "#141414";

/** Texture con la scritta MASTROSIMINI per la fiancata (niente font esterni). */
function useSideTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = CORPO;
    g.fillRect(0, 0, 1024, 256);
    g.fillStyle = BIANCO;
    g.font = "800 150px Poppins, Arial Black, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("MASTROSIMINI", 512, 112);
    g.fillStyle = ORO;
    g.font = "600 44px Poppins, Arial, sans-serif";
    g.fillText("S T R E E T   S H O P", 512, 214);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
}

function Wheel({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z -= dt * 3;
  });
  return (
    <group position={[x, 0.42, z]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 20]} />
          <meshStandardMaterial color={NERO} roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.16 : -0.16]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color={ORO} metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/** Capo appeso: stampella + camicia/felpa oro. */
function Hanger({ x }: { x: number }) {
  return (
    <group position={[x, 2.2, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color={BIANCO} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.38, 0.55, 4]} />
        <meshStandardMaterial color={ORO} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Furgone procedurale low-poly: funziona subito, senza file esterni. */
export function ProceduralVan() {
  const side = useSideTexture();
  const white = <meshStandardMaterial color={CORPO} roughness={0.7} metalness={0.15} />;
  return (
    <group>
      {/* cassone */}
      <mesh position={[-0.6, 1.25, 0]} castShadow>
        <boxGeometry args={[3.4, 1.7, 1.6]} />
        {white}
      </mesh>
      {/* cabina */}
      <mesh position={[1.7, 0.95, 0]} castShadow>
        <boxGeometry args={[1.2, 1.1, 1.55]} />
        {white}
      </mesh>
      <mesh position={[1.95, 1.7, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.9, 0.05, 1.5]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* finestrini cabina */}
      {[0.79, -0.79].map((z) => (
        <mesh key={z} position={[1.85, 1.2, z]}>
          <boxGeometry args={[0.6, 0.45, 0.02]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.2} metalness={0.4} />
        </mesh>
      ))}
      {/* fascia oro */}
      <mesh position={[0.2, 0.62, 0]}>
        <boxGeometry args={[4.6, 0.1, 1.64]} />
        <meshStandardMaterial color={ORO} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* scritta sulle due fiancate */}
      {[0.805, -0.805].map((z) => (
        <mesh key={z} position={[-0.6, 1.3, z]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[3.0, 0.75]} />
          <meshBasicMaterial map={side} toneMapped={false} />
        </mesh>
      ))}
      {/* fari */}
      <mesh position={[2.32, 0.75, 0.5]}>
        <boxGeometry args={[0.05, 0.18, 0.28]} />
        <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[2.32, 0.75, -0.5]}>
        <boxGeometry args={[0.05, 0.18, 0.28]} />
        <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={1.4} />
      </mesh>
      {/* portabiti sul tetto */}
      <mesh position={[-0.6, 2.18, 0]}>
        <boxGeometry args={[2.8, 0.04, 0.04]} />
        <meshStandardMaterial color={BIANCO} />
      </mesh>
      {[-1.6, -1.1, -0.6, -0.1, 0.4].map((x) => (
        <Hanger key={x} x={x} />
      ))}
      {/* ruote */}
      <Wheel x={-1.5} z={0.8} />
      <Wheel x={-1.5} z={-0.8} />
      <Wheel x={1.7} z={0.8} />
      <Wheel x={1.7} z={-0.8} />
    </group>
  );
}

/** Texture radiale (ombra a terra / alone oro) generata da canvas. */
function useRadial(rgb: string, alpha: number) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, `rgba(${rgb},${alpha})`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, [rgb, alpha]);
}

const VAN_W = 6.6;
const VAN_H = (VAN_W * 1086) / 1448;

/**
 * Il furgone reale (PNG ritagliato) come "cartellone" nella scena 3D: foto vera con le pennellate oro,
 * alone oro dietro e ombra a terra. La vista è 3/4 posteriore con il muso a destra, quindi avanza verso destra.
 */
export function VanBillboard() {
  const tex = useTexture("/brand/furgone.webp");
  const shadow = useRadial("0,0,0", 0.75);
  const glow = useRadial("212,168,92", 0.28);
  return (
    <group>
      <mesh position={[0.3, VAN_H * 0.45, -0.6]}>
        <planeGeometry args={[VAN_W * 1.7, VAN_H * 1.5]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.012, 0.15]}>
        <planeGeometry args={[VAN_W * 1.05, 2.1]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, VAN_H * 0.41, 0]}>
        <planeGeometry args={[VAN_W, VAN_H]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
    </group>
  );
}

const WHEEL_R = 0.362; // raggio ruota nel modello Blender (m)
const MODEL_SCALE = 1.12;
const MODEL_LENGTH = 5.92; // il modello parte dal retro (x = 0): lo centro
const _pos = new THREE.Vector3();

/**
 * Furgone 3D da Blender (blender/build_van.py). Le ruote sono nodi "Ruota_*":
 * girano in proporzione allo spazio percorso, quindi si fermano quando il furgone si ferma.
 */
function GltfVan() {
  const { scene } = useGLTF("/models/van.glb");
  const model = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef<THREE.Group>(null);
  const prev = useRef<number | null>(null);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    // ruote cercate una volta e tenute sul gruppo
    if (!g.userData.wheels) {
      const list: THREE.Object3D[] = [];
      g.traverse((o) => o.name.startsWith("Ruota_") && list.push(o));
      g.userData.wheels = list;
    }
    const x = g.getWorldPosition(_pos).x;
    if (prev.current !== null) {
      const angle = (x - prev.current) / (WHEEL_R * MODEL_SCALE);
      for (const w of g.userData.wheels as THREE.Object3D[]) w.rotation.z -= angle;
    }
    prev.current = x;
  });

  return (
    <group ref={ref} scale={MODEL_SCALE}>
      <primitive object={model} position={[-MODEL_LENGTH / 2, 0, 0]} />
    </group>
  );
}

/** Usa /models/van.glb se esiste; altrimenti la foto del furgone vero (cartellone). `procedural` forza il modello in codice. */
export function Van({ procedural = false }: { procedural?: boolean }) {
  // null = sto ancora controllando: non mostro nulla per evitare il cambio di furgone a metà animazione
  const [hasModel, setHasModel] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/models/van.glb", { method: "HEAD" })
      .then((r) => alive && setHasModel(r.ok && !(r.headers.get("content-type") ?? "").includes("html")))
      .catch(() => alive && setHasModel(false));
    return () => {
      alive = false;
    };
  }, []);
  if (hasModel === null) return null;
  if (hasModel)
    return (
      <Suspense fallback={null}>
        <GltfVan />
      </Suspense>
    );
  return procedural ? <ProceduralVan /> : <VanBillboard />;
}
