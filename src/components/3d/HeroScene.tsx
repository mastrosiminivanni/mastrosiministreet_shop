"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils } from "three";
import { Road, SceneCanvas } from "./SceneBase";
import { Van } from "./Van";

/** Il furgone entra in scena da sinistra e poi respira piano; segue un poco il puntatore. */
function EnteringVan() {
  const ref = useRef<Group>(null);
  useFrame((state, dt) => {
    state.camera.lookAt(0, 1.1, 0);
    const g = ref.current;
    if (!g) return;
    g.position.x = MathUtils.damp(g.position.x, 0, 1.6, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.015;
    g.rotation.y = MathUtils.damp(g.rotation.y, -0.5 + state.pointer.x * 0.35, 3, dt);
  });
  return (
    <group ref={ref} position={[-12, 0, 0]}>
      <Van />
    </group>
  );
}

export default function HeroScene() {
  return (
    <SceneCanvas>
      <Road />
      <EnteringVan />
    </SceneCanvas>
  );
}
