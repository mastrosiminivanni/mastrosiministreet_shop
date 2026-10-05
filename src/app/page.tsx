import { PlateBadge } from "@/components/ui/PlateBadge";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { RoadDivider } from "@/components/ui/RoadDivider";
import { VanLogo } from "@/components/ui/VanLogo";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <PlateBadge>Un mercato diverso ogni giorno</PlateBadge>
      <h1 className="titolo mt-4 text-5xl sm:text-7xl">
        Quanto costa?
      </h1>
      <VanLogo className="mt-8 w-full max-w-md" />
      <div className="my-8 flex gap-4">
        <PriceBadge price={25} label="Cadauna" size="lg" />
        <PriceBadge price={30} label="Felpa" />
        <PriceBadge price={20} label="Pantaloni" />
      </div>
      <RoadDivider />
    </main>
  );
}
