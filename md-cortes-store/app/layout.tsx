import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const texto = Inter({
  subsets: ["latin"],
  variable: "--fonte-texto",
  display: "swap",
});

const marca = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--fonte-marca",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s · ${BRAND.shortName}` },
  description: "Controle de vendas e estoque da MD Cortes Store.",
  applicationName: BRAND.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: BRAND.logo.icon192, sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/marca/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${texto.variable} ${marca.variable}`}>
      <body className="bg-branco antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
