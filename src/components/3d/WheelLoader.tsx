/** Loader a tema: ruota che gira. */
export function WheelLoader({ label = "Il furgone sta arrivando…" }: { label?: string }) {
  return (
    <div role="status" className="flex h-full w-full flex-col items-center justify-center gap-3 text-oro">
      <svg viewBox="0 0 40 40" className="h-12 w-12 animate-spin" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="20" cy="20" r="4" fill="currentColor" />
        {[0, 60, 120].map((a) => (
          <line key={a} x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="2" transform={`rotate(${a} 20 20)`} />
        ))}
      </svg>
      <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}
