"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { isLowPower } from "@/lib/webgl";

/** Strada nera con linea tratteggiata oro. */
export function Road({ length = 80 }: { length?: number }) {
  const dashes = Math.floor(length / 2.4);
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[length, 7]} />
        <meshStandardMaterial color="#121212" roughness={1} envMapIntensity={0.08} />
      </mesh>
      {Array.from({ length: dashes }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-length / 2 + i * 2.4 + 1, 0.004, 1.9]}>
          <planeGeometry args={[1.2, 0.09]} />
          <meshBasicMaterial color="#d4a85c" />
        </mesh>
      ))}
    </group>
  );
}

/** Riflessi per i materiali metallici (oro, cromature) generati in codice: nessun file HDR da scaricare. */
function StudioReflections() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

/** Allontana la camera su schermi stretti (mobile verticale) perché il furgone entri sempre intero. */
function FitCamera({ base }: { base: number }) {
  useFrame(({ camera, size }) => {
    const fov = ((camera as { fov?: number }).fov ?? 38) * (Math.PI / 180);
    const needed = 8.2 / (2 * Math.tan(fov / 2) * (size.width / size.height));
    camera.position.z = Math.max(base, needed);
  });
  return null;
}

/** Canvas con le regole di performance del progetto + luci calde e rim-light oro. */
export function SceneCanvas({
  children,
  camera = [0, 2.6, 11.5],
}: {
  children: React.ReactNode;
  camera?: [number, number, number];
}) {
  const low = isLowPower();
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows={!low}
      camera={{ position: camera, fov: 38 }}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
      scene={{ environmentIntensity: 0.45 }}
      aria-hidden="true"
    >
      <color attach="background" args={["#0c0c0c"]} />
      <hemisphereLight args={["#ffffff", "#1a1208", 1.1]} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} color="#fff3e0" castShadow={!low} />
      <directionalLight position={[-5, 3, -4]} intensity={1.6} color="#d4a85c" />
      <FitCamera base={camera[2]} />
      <StudioReflections />
      <Suspense fallback={null}>{children}</Suspense>
      {!low && <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={14} blur={2.2} far={3} />}
    </Canvas>
  );
}
