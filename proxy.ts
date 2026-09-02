import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proteção da área administrativa e renovação da sessão.
 *
 * Arquivo `proxy.ts`: é a convenção do Next 16 (o antigo `middleware.ts`).
 *
 * Este é o primeiro portão, não o único. Cada página de /admin também confere
 * o usuário no servidor, e a RLS confere de novo no banco. Um portão só,
 * ainda mais no borda, não é garantia de nada.
 */

const URL_SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const CHAVE_SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
const configurado = URL_SUPABASE.startsWith("http") && CHAVE_SUPABASE.length > 20;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Sem projeto configurado, /admin/configurar explica o que falta em vez de
  // mandar o usuário para um login que não teria como funcionar.
  if (!configurado) {
    if (pathname === "/admin/configurar") return NextResponse.next();
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/configurar";
    return NextResponse.redirect(destino);
  }

  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(URL_SUPABASE, CHAVE_SUPABASE, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (novos) => {
        for (const { name, value } of novos) {
          request.cookies.set(name, value);
        }
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of novos) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naTelaDeLogin = pathname === "/admin/login";

  if (!user && !naTelaDeLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/login";
    destino.searchParams.set("de", pathname);
    return NextResponse.redirect(destino);
  }

  if (user && naTelaDeLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
