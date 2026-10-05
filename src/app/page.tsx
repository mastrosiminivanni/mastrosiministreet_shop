import { Hero } from "@/components/sections/Hero";
import { MarketRoute } from "@/components/sections/MarketRoute";
import { TodayStrip } from "@/components/sections/TodayStrip";
import { RoadDivider } from "@/components/ui/RoadDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <TodayStrip />
      <RoadDivider />
      <MarketRoute />
      <RoadDivider />
    </main>
  );
}
