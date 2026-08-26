import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ProvedorDeSessao } from '@/lib/hooks/use-sessao';
import { ProvedorDeToasts } from '@/lib/hooks/use-toasts';
import { PilhaDeToasts } from '@/components/ui/ToastNotification';
import { RegistroDoServiceWorker } from '@/components/pwa/RegistroDoServiceWorker';
import { ConviteDaNuvem } from '@/components/pwa/ConviteDaNuvem';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const fonte = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--fonte-app',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MD_cortes',
  description: 'Controle de cortes e faturamento da barbearia.',
  manifest: `${BASE}/manifest.webmanifest`,
  applicationName: 'MD_cortes',
  appleWebApp: {
    capable: true,
    title: 'MD_cortes',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: `${BASE}/icones/icone-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${BASE}/icones/icone-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: `${BASE}/icones/apple-touch-icon.png`, sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
  // Sistema interno: não faz sentido nenhum buscador indexar.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#07080b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Sem zoom por pinça e cobrindo o notch: é o que separa "site" de "aplicativo".
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fonte.variable}>
      <body className="min-h-dvh antialiased">
        <ProvedorDeToasts>
          <ProvedorDeSessao>
            {children}
            <PilhaDeToasts />
            <RegistroDoServiceWorker />
            <ConviteDaNuvem />
          </ProvedorDeSessao>
        </ProvedorDeToasts>
      </body>
    </html>
  );
}
