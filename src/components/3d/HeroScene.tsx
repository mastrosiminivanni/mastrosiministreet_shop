"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils } from "three";
import { Road, SceneCanvas } from "./SceneBase";
import { Van } from "./Van";

/**
 * Il furgone entra da sinistra guidando dritto, poi si ferma e si gira di 3/4 mostrando il retro e la fiancata;
 * segue un poco il puntatore.
 */
function EnteringVan() {
  const ref = useRef<Group>(null);
  useFrame((state, dt) => {
    state.camera.lookAt(0, 1.6, 0);
    const g = ref.current;
    if (!g) return;
    // su schermi larghi il furgone si ferma a destra, lasciando spazio al titolo
    const stopX = state.size.width > 760 ? 2.4 : 0;
    g.position.x = MathUtils.damp(g.position.x, stopX, 1.6, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.012;
    // più è vicino alla sosta, più si gira di 3/4
    const arrived = 1 - MathUtils.clamp(Math.abs(g.position.x - stopX) / 7, 0, 1);
    const yaw = 0.1 + 0.42 * arrived * arrived + state.pointer.x * 0.1;
    g.rotation.y = MathUtils.damp(g.rotation.y, yaw, 4, dt);
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
