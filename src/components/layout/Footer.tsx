import Link from "next/link";
import { INSTAGRAM_URL } from "@/data/markets";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-nero px-4 py-10 text-sm text-bianco/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <p className="titolo text-lg text-bianco">Mastrosimini Street Shop</p>
          <p>Un mercato diverso ogni giorno.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><a href={INSTAGRAM_URL} className="hover:text-oro" rel="noopener">@mastrosiministreet_shop</a></li>
          <li><Link href="/contatti" className="hover:text-oro">Contatti e FAQ</Link></li>
          <li><Link href="/legal/privacy" className="hover:text-oro">Privacy</Link></li>
          <li><Link href="/legal/termini" className="hover:text-oro">Termini di vendita</Link></li>
          <li><Link href="/legal/recesso" className="hover:text-oro">Diritto di recesso</Link></li>
        </ul>
      </div>
    </footer>
  );
}
