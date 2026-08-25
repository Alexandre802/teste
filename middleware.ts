import { NextResponse, type NextRequest } from 'next/server';

/**
 * Cabeçalhos de segurança em toda resposta.
 *
 * A CSP usa nonce por requisição em vez de liberar `unsafe-inline` para
 * script: com `unsafe-inline` qualquer injeção de HTML vira execução de
 * código, que é a porta de entrada mais comum de roubo de dados em site de
 * pedidos. `strict-dynamic` deixa os scripts que o Next carrega em cadeia
 * funcionarem sem listar cada um.
 *
 * Estilo ainda precisa de `unsafe-inline`: Tailwind e o framer-motion
 * escrevem no atributo `style` dos elementos, e não há como assinar isso.
 * O risco é bem menor — CSS injetado não executa código.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV !== 'production';

  const csp = [
    "default-src 'self'",
    // em desenvolvimento o Next usa eval para atualizar módulos
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${dev ? "'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src \'self\' https://fonts.gstatic.com data:',
    "img-src 'self' data: blob: https://lh3.googleusercontent.com",
    // mapa do Google embutido na seção de contato
    "frame-src https://www.google.com https://maps.google.com",
    "connect-src 'self'",
    "form-action 'self'",
    // ninguém pode embutir o site num iframe: barra clickjacking
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ]
    .filter(Boolean)
    .join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);

  const resposta = NextResponse.next({ request: { headers } });

  resposta.headers.set('Content-Security-Policy', csp);
  // HTTPS obrigatório por 2 anos, incluindo subdomínios
  resposta.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  resposta.headers.set('X-Content-Type-Options', 'nosniff');
  resposta.headers.set('X-Frame-Options', 'DENY');
  // nenhum endereço de página sai junto com o clique — nem para o WhatsApp,
  // nem para o Google Maps
  resposta.headers.set('Referrer-Policy', 'no-referrer');
  // o site não usa câmera, microfone, localização nem sensores: tudo negado
  resposta.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  );
  resposta.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  resposta.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  resposta.headers.set('X-DNS-Prefetch-Control', 'off');

  return resposta;
}

export const config = {
  /**
   * Só a forma de string é aceita pelo validador de deploy da Vercel — a
   * forma de objeto (`source` + `missing`) passa no `next build` local e é
   * recusada na publicação.
   *
   * O padrão aqui não tem nenhum caractere escapado nem alternância de
   * extensão: é o exemplo canônico da documentação do Next, com as pastas de
   * imagem excluídas por prefixo. Menos coisa para o validador interpretar,
   * menos chance de recusa — e as fotos deixam de invocar a função à toa.
   */
  matcher: ['/((?!_next/static|_next/image|favicon|apple-icon|produtos/|lanche/|marca/).*)'],
};
