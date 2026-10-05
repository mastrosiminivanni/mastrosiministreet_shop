"use client";

import dynamic from "next/dynamic";
import { asset } from "@/lib/asset";
import { useCan3D } from "@/lib/webgl";
import Image from "next/image";
import { WheelLoader } from "./WheelLoader";

// Canvas caricato solo lato client e in lazy.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <WheelLoader /> });

/** Hero: scena 3D se possibile, altrimenti il furgone SVG statico. */
export function Hero3D() {
  const can3D = useCan3D();
  if (!can3D) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Image src={asset("/brand/furgone.png")} alt="Il furgone di Mastrosimini Street Shop: nero e oro" width={1200} height={900} priority className="w-full max-w-xl object-contain" />
      </div>
    );
  }
  return <HeroScene />;
}
