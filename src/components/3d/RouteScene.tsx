"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { MARKETS } from "@/data/markets";
import { Road, SceneCanvas } from "./SceneBase";
import { Van } from "./Van";

const SPACING = 9;

/** Cartello di fermata con il nome del paese (texture da canvas, niente font esterni). */
function Sign({ text, x }: { text: string; x: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 160;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f0ebe1";
    g.fillRect(0, 0, 512, 160);
    g.strokeStyle = "#0c0c0c";
    g.lineWidth = 8;
    g.strokeRect(6, 6, 500, 148);
    g.fillStyle = "#0c0c0c";
    g.font = "800 58px Poppins, Arial Black, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text.toUpperCase(), 256, 84, 470);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text]);
  return (
    <group position={[x, 0, -3.2]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.1, 1.8, 0.1]} />
        <meshStandardMaterial color="#d4a85c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <planeGeometry args={[3, 0.94]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Il furgone avanza lungo la strada in base al progresso di scroll; la camera lo segue. */
function Journey({ progress }: { progress: MotionValue<number> }) {
  const van = useRef<THREE.Group>(null);
  useFrame(({ camera }, dt) => {
    const target = progress.get() * (MARKETS.length - 1) * SPACING;
    const g = van.current;
    if (!g) return;
    g.position.x = THREE.MathUtils.damp(g.position.x, target, 4, dt);
    g.rotation.y = 0.14; // quasi di profilo: guida dritto lungo la strada
    
    camera.position.x = g.position.x + 0.3;
    camera.position.y = 2.4;
    camera.lookAt(g.position.x + 0.3, 1.7, 0);
  });
  return (
    <>
      {MARKETS.map((m, i) => (
        <Sign key={m.slug} text={m.town} x={i * SPACING + 4} />
      ))}
      <group ref={van}>
        <Van />
      </group>
    </>
  );
}

export default function RouteScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <SceneCanvas camera={[0.3, 2.6, 13]}>
      <group position={[(MARKETS.length * SPACING) / 2 - 10, 0, 0]}>
        <Road length={MARKETS.length * SPACING + 60} />
      </group>
      <Journey progress={progress} />
    </SceneCanvas>
  );
}
