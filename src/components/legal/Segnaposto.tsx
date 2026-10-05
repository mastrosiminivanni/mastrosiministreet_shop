import { isSegnaposto } from "@/data/azienda";

/** Mostra un dato aziendale; se è ancora un segnaposto lo evidenzia, così non passa inosservato. */
export function Dato({ v }: { v: string }) {
  return isSegnaposto(v) ? (
    <mark className="rounded-tag bg-oro/25 px-1 font-semibold text-oro">{v}</mark>
  ) : (
    <span>{v}</span>
  );
}
