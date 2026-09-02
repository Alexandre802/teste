import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, caixaConfigurado } from '@/lib/admin/config';

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

/**
 * Origem do Supabase liberada na CSP.
 *
 * O painel fala com o banco por HTTPS e escuta pedido novo por websocket.
 * Sem `wss:` a lista de pedidos simplesmente não atualiza sozinha, e o
 * navegador não avisa em lugar nenhum. Fica derivado da própria variável de
 * ambiente para não haver domínio escrito à mão que envelheça.
 */
const ORIGEM_SUPABASE = (() => {
  if (!caixaConfigurado) return '';
  try {
    const url = new URL(SUPABASE_URL);
    return `${url.origin} wss://${url.host}`;
  } catch {
    return '';
  }
})();

/**
 * Rotas do painel exigem sessão.
 *
 * Esta checagem é a PRIMEIRA porta, não a única: ela evita que a tela do
 * caixa chegue a renderizar para quem não entrou. Quem realmente protege o
 * dado é a RLS do banco, que nega tudo a quem não está na tabela de
 * administradores — um cookie forjado aqui não traz nenhuma linha junto.
 */
/** O formato que o `@supabase/ssr` entrega em `setAll`. */
type CookieRenovado = Parameters<
  NonNullable<Parameters<typeof createServerClient>[2]['cookies']['setAll']>
>[0][number];

interface Guarda {
  /** Preenchido quando a pessoa precisa ser mandada para o login. */
  redirecionar?: NextResponse;
  /**
   * Cookies que o Supabase renovou durante a checagem.
   *
   * Precisam ser copiados para a resposta final. Descartá-los aqui faria o
   * token vencer sem nunca ser renovado, e a dona seria deslogada no meio do
   * expediente sem motivo aparente.
   */
  cookies: CookieRenovado[];
}

async function guardaDoPainel(request: NextRequest): Promise<Guarda> {
  const vazio: Guarda = { cookies: [] };
  const caminho = request.nextUrl.pathname;
  if (!caminho.startsWith('/admin') || caminho.startsWith('/admin/login')) return vazio;

  // Sem banco configurado não há login possível. Deixa passar: a própria tela
  // explica o que falta configurar, em vez de mandar para um login inútil.
  if (!caixaConfigurado) return vazio;

  const renovados: CookieRenovado[] = [];

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (novos) => {
        renovados.push(...novos);
      },
    },
  });

  // `getUser` valida o token no servidor do Supabase e renova quando está
  // perto de expirar. `getSession` só lê o cookie — que é justamente o que
  // não dá para acreditar aqui.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/admin/login';
    // volta para onde a pessoa queria ir depois de entrar
    destino.searchParams.set('proximo', caminho);
    const redirecionar = NextResponse.redirect(destino);
    for (const c of renovados) redirecionar.cookies.set(c.name, c.value, c.options);
    return { redirecionar, cookies: [] };
  }

  return { cookies: renovados };
}

export async function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  if (SEM_CABECALHO.some((prefixo) => caminho.startsWith(prefixo))) {
    return NextResponse.next();
  }

  const guarda = await guardaDoPainel(request);
  if (guarda.redirecionar) return guarda.redirecionar;

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
    `connect-src 'self'${ORIGEM_SUPABASE ? ` ${ORIGEM_SUPABASE}` : ''}`,
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

  for (const c of guarda.cookies) resposta.cookies.set(c.name, c.value, c.options);

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
