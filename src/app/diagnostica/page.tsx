import type { Metadata } from "next";
import { Diagnostica } from "@/components/Diagnostica";

export const metadata: Metadata = { title: "Diagnostica", robots: { index: false, follow: false } };

export default function DiagnosticaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="titolo text-4xl">Diagnostica</h1>
      <p className="mt-2 text-bianco/70">Pagina tecnica: serve a capire perché il furgone 3D non si vede su un dispositivo.</p>
      <Diagnostica />
    </main>
  );
}
