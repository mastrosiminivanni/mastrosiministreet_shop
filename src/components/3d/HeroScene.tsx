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
    state.camera.lookAt(0, 1.6, 0);
    const g = ref.current;
    if (!g) return;
    // su schermi larghi il furgone si ferma a destra, lasciando spazio al titolo
    const stopX = state.size.width / state.size.height > 1.15 ? 2.4 : 0;
    g.position.x = MathUtils.damp(g.position.x, stopX, 1.6, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.015;
    // vista di 3/4 anteriore; segue un poco il puntatore
    g.rotation.y = MathUtils.damp(g.rotation.y, -0.42 + state.pointer.x * 0.25, 3, dt);
  });
  return (
    <group ref={ref} position={[-14, 0, 0]}>
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
