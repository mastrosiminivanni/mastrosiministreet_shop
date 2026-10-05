"use client";

import dynamic from "next/dynamic";
import { useCan3D } from "@/lib/webgl";
import { VanLogo } from "@/components/ui/VanLogo";
import { WheelLoader } from "./WheelLoader";

// Canvas caricato solo lato client e in lazy.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <WheelLoader /> });

/** Hero: scena 3D se possibile, altrimenti il furgone SVG statico. */
export function Hero3D() {
  const can3D = useCan3D();
  if (!can3D) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <VanLogo className="w-full max-w-lg" />
      </div>
    );
  }
  return <HeroScene />;
}
