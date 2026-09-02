import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Baloo_2 } from "next/font/google";

import "./globals.css";
import { metadataPadrao, schemaRestaurante } from "@/lib/seo";

const corpo = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-corpo",
  display: "swap",
});

const titulo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--fonte-titulo",
  display: "swap",
});

export const metadata: Metadata = metadataPadrao;

export const viewport: Viewport = {
  themeColor: "#e75c16",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${corpo.variable} ${titulo.variable}`}>
      <body className="antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-laranja focus:px-4 focus:py-3 focus:text-white"
        >
          Pular para o conteúdo
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaRestaurante()),
          }}
        />
      </body>
    </html>
  );
}
