import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/look", label: "Look" },
  { href: "/dove-siamo", label: "Dove siamo" },
  { href: "/chi-siamo", label: "Chi siamo" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-nero/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" aria-label="Mastrosimini Street Shop, home" className="flex items-center gap-2">
          <Image src={asset("/brand/logo-profilo.png")} alt="" width={40} height={40} className="rounded-full" />
          <span className="titolo hidden text-sm sm:block">Mastrosimini</span>
        </Link>
        <nav aria-label="Principale">
          <ul className="flex gap-4 text-xs font-bold uppercase tracking-wide sm:gap-6 sm:text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="py-2 hover:text-oro">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
