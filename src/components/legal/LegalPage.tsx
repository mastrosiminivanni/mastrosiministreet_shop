import { PlateBadge } from "@/components/ui/PlateBadge";

/** Contenitore delle pagine di testo (privacy, cookie, note legali). */
export function LegalPage({ titolo, aggiornato, children }: { titolo: string; aggiornato: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PlateBadge>Informazioni</PlateBadge>
      <h1 className="titolo mt-3 text-4xl sm:text-5xl">{titolo}</h1>
      <p className="mt-2 text-sm text-bianco/60">Ultimo aggiornamento: {aggiornato}</p>
      <div className="mt-8 space-y-5 leading-relaxed text-bianco/90 [&_a]:text-oro [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-bianco [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </main>
  );
}
