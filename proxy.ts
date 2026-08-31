import { NextResponse, type NextRequest } from 'next/server';

/**
 * Cabeçalhos de segurança em toda resposta.
 *
 * Arquivo `proxy.ts`: é a convenção do Next 16. `middleware.ts` ainda
 * funciona, mas entra por um caminho de compatibilidade — e era ali que a
 * publicação na Vercel quebrava, depois de o build já ter terminado.
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

// Caminhos que dispensam cabeçalho de segurança: imagem não executa script.
// Filtrar aqui, e não por `config.matcher`, é deliberado — ver a nota no fim.
//
// `/sw.js` entra na lista por outro motivo: a CSP da página usa nonce com
// `strict-dynamic`, e nonce não existe no contexto de um service worker — o
// cabeçalho ali só atrapalharia. O arquivo é servido do próprio domínio e não
// carrega script de lugar nenhum.
const SEM_CABECALHO = [
  '/_next/static',
  '/_next/image',
  '/produtos/',
  '/lanche/',
  '/marca/',
  '/icones/',
  '/sw.js',
];

export function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  if (SEM_CABECALHO.some((prefixo) => caminho.startsWith(prefixo))) {
    return NextResponse.next();
  }

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

/*
 * ATENÇÃO ao mexer no bloco abaixo.
 *
 * A Vercel lê este `config` com @vercel/static-config, que percorre o AST do
 * TypeScript. O leitor dela faz:
 *
 *     const [nome, _doisPontos, valor] = prop.getChildren();
 *
 * e assume três filhos por propriedade. Comentário JSDoc (barra-asterisco-
 * asterisco) DENTRO do objeto vira um nó do AST, entra como primeiro filho e
 * desloca tudo: o leitor acaba pedindo o valor do próprio token de dois
 * pontos e a publicação morre com `Unhandled type: "ColonToken"` — depois de
 * o `next build` já ter concluído, o que torna o erro difícil de rastrear.
 *
 * Comentário de linha (barra-barra) é trivia, não vira nó, e é seguro.
 * Por isso toda explicação fica aqui fora e o objeto abaixo é mínimo.
 *
 * Há um verificador em scripts/checar-config-vercel.cjs que roda o mesmo
 * leitor da Vercel sobre o projeto.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|apple-icon|produtos/|lanche/|marca/|icones/|sw.js).*)',
  ],
};
