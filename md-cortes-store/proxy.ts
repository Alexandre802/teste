import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/login", "/recuperar-senha", "/redefinir-senha", "/auth"];

/**
 * Renova a sessão a cada navegação e barra rota interna sem login.
 * Sem sessão: /login. Com sessão em /login: dashboard.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("de", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

// O matcher fica com prefixos simples de proposito. O leitor de configuracao
// da Vercel percorre o AST deste objeto, e matcher elaborado (ou comentario
// de bloco dentro do objeto) ja quebrou a publicacao neste repositorio.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|marca/|icons/|sw.js|offline.html|manifest.webmanifest).*)'],
};
