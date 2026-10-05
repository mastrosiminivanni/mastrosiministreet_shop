import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mastrosimini Street Shop — un mercato diverso ogni giorno",
    template: "%s · Mastrosimini Street Shop",
  },
  description:
    "Abbigliamento uomo vintage, street e oversize. Pezzi unici a prezzi dichiarati: camicie 25€, felpe 30€, pantaloni 20€, look completo 50€. Il furgone gira un mercato diverso ogni giorno.",
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
