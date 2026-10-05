/** Badge "targa del furgone" per titoli di sezione. */
export function PlateBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-tag border-2 border-nero bg-crema px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-nero shadow-[0_0_0_2px_var(--oro)]">
      {children}
    </span>
  );
}
