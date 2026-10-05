import type { Metadata } from "next";
import { WhereWeAre } from "@/components/sections/WhereWeAre";
import { PlateBadge } from "@/components/ui/PlateBadge";

export const metadata: Metadata = {
  title: "Dove siamo",
  description: "Un mercato diverso ogni giorno: il calendario del furgone, la mappa e il punto esatto di ogni tappa. Salvalo sul telefono.",
};

export default function DoveSiamoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PlateBadge>Dove siamo</PlateBadge>
      <h1 className="titolo mt-3 mb-6 text-4xl sm:text-6xl">Un mercato diverso ogni giorno</h1>
      <WhereWeAre />
    </main>
  );
}
