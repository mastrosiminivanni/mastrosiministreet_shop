/** Furgone stilizzato in SVG (nero/oro/bianco). Usato come logo e fallback del 3D. */
export function VanLogo({ className, title = "Il furgone di Mastrosimini Street Shop" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 320 170" className={className} role="img" aria-label={title}>
      {/* portabiti sul tetto */}
      <rect x="62" y="30" width="150" height="5" rx="2" fill="#fff" />
      {[82, 112, 142, 172].map((x) => (
        <g key={x}>
          <path d={`M${x} 31 l0 -8`} stroke="#fff" strokeWidth="3" />
          <path d={`M${x - 14} 58 L${x} 36 L${x + 14} 58 Z`} fill="#d4a85c" />
        </g>
      ))}
      {/* corpo */}
      <path d="M30 62 h190 v70 h-190 z" fill="#fff" />
      <path d="M220 78 h42 l28 28 v26 h-70 z" fill="#fff" />
      <path d="M232 86 h24 l18 18 h-42 z" fill="#0c0c0c" />
      <rect x="30" y="110" width="260" height="6" fill="#d4a85c" />
      <text x="125" y="104" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="22" fill="#0c0c0c" letterSpacing="-1">MASTROSIMINI</text>
      {/* ruote */}
      {[78, 250].map((x) => (
        <g key={x}>
          <circle cx={x} cy="138" r="20" fill="#0c0c0c" stroke="#fff" strokeWidth="3" />
          <circle cx={x} cy="138" r="7" fill="#d4a85c" />
        </g>
      ))}
    </svg>
  );
}
