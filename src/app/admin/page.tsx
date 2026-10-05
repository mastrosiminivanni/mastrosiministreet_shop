import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

// Pagina riservata: non va su Google e non è linkata da nessuna parte.
export const metadata: Metadata = { title: "Pannello capi", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="titolo text-4xl">Pannello</h1>
      <p className="mt-1 text-bianco/70">Aggiungi i capi: foto, taglia, prezzo.</p>
      <AdminApp />
    </main>
  );
}
