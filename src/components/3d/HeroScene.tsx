"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils } from "three";
import { Road, SceneCanvas } from "./SceneBase";
import { Van } from "./Van";

/**
 * Il furgone è già fermo, girato di 3/4 come nell'immagine di partenza (così il passaggio dall'immagine al 3D non si nota);
 * segue un poco il puntatore.
 */
function ParkedVan() {
  const ref = useRef<Group>(null);
  const messoAPosto = useRef(false);
  useFrame((state, dt) => {
    state.camera.lookAt(0, 1.6, 0);
    const g = ref.current;
    if (!g) return;
    // su schermi larghi il furgone sta a destra, lasciando spazio al titolo
    const stopX = state.size.width > 760 ? 2.4 : 0;
    if (!messoAPosto.current) {
      g.position.x = stopX;
      g.rotation.y = 0.52;
      messoAPosto.current = true;
    }
    g.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.012;
    g.rotation.y = MathUtils.damp(g.rotation.y, 0.52 + state.pointer.x * 0.1, 4, dt);
  });
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Van />
    </group>
  );
}

export default function HeroScene() {
  return (
    <SceneCanvas>
      <Road />
      <ParkedVan />
    </SceneCanvas>
  );
}
