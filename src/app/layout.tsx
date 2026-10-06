import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/data/site";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyBar } from "@/components/layout/StickyBar";
import { WebMcp } from "@/components/WebMcp";
import { SCRIPT_TEMA } from "@/lib/theme";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const titolo = `${SITE_NAME} - ${SITE_TAGLINE.toLowerCase()}`;
const descrizione =
  "Abbigliamento uomo street e oversize, le ultime mode a prezzi da mercato: camicie 25€, felpe 30€, pantaloni 20€. Il furgone gira un mercato diverso ogni giorno: scopri dove siamo oggi.";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: titolo, template: `%s - ${SITE_NAME}` },
  description: descrizione,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE_NAME,
    title: titolo,
    description: descrizione,
    images: [
      {
        url: "og.jpg",
        width: 1200,
        height: 630,
        alt: "Il furgone di Mastrosimini Street Shop, nero e oro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titolo,
    description: descrizione,
    images: ["og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      data-theme="dark"
      suppressHydrationWarning
      className={`${poppins.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-oro focus:p-3 focus:text-tinta"
        >
          Vai al contenuto
        </a>
        <JsonLd />
        <Header />
        <div id="main" className="flex-1">
          {children}
        </div>
        <Footer />
        <StickyBar />
        <CookieBanner />
        <WebMcp />
        {/* spazio per non far coprire il fondo pagina dalla barra fissa (solo telefono) */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </body>
    </html>
  );
}
