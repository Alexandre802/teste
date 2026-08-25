import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import { buscarPorEmail, conferirSenha } from '@/lib/usuarios';

/**
 * Autenticação do site — Google, Facebook e e-mail com senha.
 *
 * Cada provedor só é registrado se as chaves dele existirem no ambiente. Isso
 * é de propósito: sem as chaves do Facebook, por exemplo, o botão simplesmente
 * não aparece na tela de login, em vez de aparecer e quebrar no clique.
 *
 * O que precisa estar em .env.local (ver .env.example):
 *   AUTH_SECRET            obrigatório — `npx auth secret` gera um
 *   AUTH_GOOGLE_ID/SECRET  console.cloud.google.com → Credenciais OAuth
 *   AUTH_FACEBOOK_ID/SECRET  developers.facebook.com → Login do Facebook
 *
 * URL de retorno a cadastrar nos dois provedores:
 *   https://SEU-DOMINIO/api/auth/callback/google
 *   https://SEU-DOMINIO/api/auth/callback/facebook
 */

export type IdProvedor = 'google' | 'facebook' | 'credentials';

function temChaves(a?: string, b?: string): boolean {
  return Boolean(a && b);
}

export const provedoresLigados = {
  google: temChaves(process.env.AUTH_GOOGLE_ID, process.env.AUTH_GOOGLE_SECRET),
  facebook: temChaves(process.env.AUTH_FACEBOOK_ID, process.env.AUTH_FACEBOOK_SECRET),
  /* e-mail e senha depende de um lugar para guardar a conta; ver lib/usuarios.ts */
  credentials: Boolean(process.env.AUTH_SECRET),
} as const;

/** Nada configurado ainda? A tela de login diz isso em vez de dar erro. */
export const autenticacaoConfigurada =
  Boolean(process.env.AUTH_SECRET) && (provedoresLigados.google || provedoresLigados.facebook);

const provedores: NextAuthConfig['providers'] = [];

if (provedoresLigados.google) {
  provedores.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

if (provedoresLigados.facebook) {
  provedores.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
  );
}

provedores.push(
  Credentials({
    name: 'E-mail e senha',
    credentials: {
      email: { label: 'E-mail', type: 'email' },
      senha: { label: 'Senha', type: 'password' },
    },
    async authorize(dados) {
      const email = typeof dados?.email === 'string' ? dados.email.trim().toLowerCase() : '';
      const senha = typeof dados?.senha === 'string' ? dados.senha : '';
      if (!email || !senha) return null;

      const usuario = await buscarPorEmail(email);
      // sem conta cadastrada não há o que conferir; devolver null faz o
      // Auth.js responder "credenciais inválidas", sem revelar se o e-mail
      // existe ou não
      if (!usuario) return null;

      const ok = await conferirSenha(senha, usuario.senhaHash);
      if (!ok) return null;

      return { id: usuario.id, email: usuario.email, name: usuario.nome };
    },
  }),
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: provedores,
  /* sessão em JWT: não exige banco de dados para o login social funcionar */
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  trustHost: true,
});
