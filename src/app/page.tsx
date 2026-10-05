import { Hero } from "@/components/sections/Hero";
import { MarketRoute } from "@/components/sections/MarketRoute";
import { TodayBanner } from "@/components/sections/TodayBanner";
import { RoadDivider } from "@/components/ui/RoadDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <TodayBanner />
      <RoadDivider />
      <MarketRoute />
      <RoadDivider />
    </main>
  );
}
