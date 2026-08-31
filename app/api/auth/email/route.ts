import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { identificadorAnonimo, limitarTaxa } from '@/lib/seguranca';

/**
 * Código de acesso por e-mail, sem banco de dados.
 *
 * O código é derivado por HMAC de (e-mail + janela de tempo + segredo). Isso
 * dá 6 dígitos válidos por ~10 minutos, verificáveis sem estado, o que mantém
 * a rota funcionando em serverless sem sessão compartilhada.
 *
 * ── Por que a rota se desliga sozinha em produção ──
 *
 * A segurança inteira do código mora no `AUTH_SECRET`. Antes havia um valor
 * padrão escrito no arquivo; como o repositório é público, qualquer pessoa
 * podia calcular o código de acesso de qualquer e-mail e entrar como o
 * cliente. Agora, em produção, sem segredo forte configurado a rota
 * simplesmente não existe — falha fechada.
 *
 * Do mesmo jeito, sem provedor de envio o código NÃO volta na resposta em
 * produção: devolver o código para quem pediu não é login nenhum.
 */

const PRODUCAO = process.env.NODE_ENV === 'production';

/** Em desenvolvimento vale um segredo de conveniência; em produção, nunca. */
const SEGREDO = process.env.AUTH_SECRET ?? (PRODUCAO ? '' : 'apenas-desenvolvimento-local');
const SEGREDO_FORTE = SEGREDO.length >= 24;

const ENVIO_ATIVO = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/**
 * O login por e-mail está disponível?
 *
 * Produção exige as duas pernas: segredo forte e envio configurado. Em
 * desenvolvimento basta o segredo, e o código aparece na resposta para dar
 * para testar o fluxo.
 */
export const loginEmailAtivo = PRODUCAO ? SEGREDO_FORTE && ENVIO_ATIVO : SEGREDO_FORTE;

const JANELA_MS = 10 * 60_000;

function codigoPara(email: string, janela: number): string {
  const mac = createHmac('sha256', SEGREDO).update(`${email.toLowerCase()}:${janela}`).digest();
  return String(mac.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

function conferem(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const indisponivel = () =>
  NextResponse.json(
    { erro: 'O login por e-mail está indisponível. Siga como convidado — o pedido sai igual.' },
    { status: 503 },
  );

/** A tela de identificação consulta isto para não oferecer o que não funciona. */
export async function GET() {
  return NextResponse.json(
    { ativo: loginEmailAtivo, envio: ENVIO_ATIVO },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  if (!loginEmailAtivo) return indisponivel();

  // dois tetos: um por solicitante, para o site não virar disparador de
  // e-mail, e outro mais folgado para a conferência do código
  const taxa = limitarTaxa(`auth:${identificadorAnonimo(request)}`, 12, 300_000);
  if (!taxa.ok) {
    return NextResponse.json(
      { erro: `Muitas tentativas. Tente de novo em ${taxa.esperaS}s.` },
      { status: 429, headers: { 'Retry-After': String(taxa.esperaS) } },
    );
  }

  let corpo: { acao?: string; email?: string; codigo?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  const email = (corpo.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ erro: 'E-mail inválido.' }, { status: 400 });
  }

  const janela = Math.floor(Date.now() / JANELA_MS);

  if (corpo.acao === 'enviar') {
    const codigo = codigoPara(email, janela);

    if (!ENVIO_ATIVO) {
      // Só chega aqui fora de produção: `loginEmailAtivo` já barrou lá em cima.
      return NextResponse.json({ ok: true, demo: true, codigo });
    }

    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `${codigo} é o seu código — Michel Food House`,
          text: `Seu código de acesso é ${codigo}. Ele vale por 10 minutos.`,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      return NextResponse.json({ ok: true, demo: false });
    } catch {
      return NextResponse.json(
        { erro: 'Não conseguimos enviar o e-mail agora. Tente de novo ou entre como convidado.' },
        { status: 502 },
      );
    }
  }

  if (corpo.acao === 'verificar') {
    const informado = (corpo.codigo ?? '').replace(/\D/g, '');
    if (informado.length !== 6) {
      return NextResponse.json({ erro: 'O código tem 6 dígitos.' }, { status: 400 });
    }
    // aceita a janela atual e a anterior, para o código não expirar enquanto
    // o cliente digita
    const vale =
      conferem(informado, codigoPara(email, janela)) ||
      conferem(informado, codigoPara(email, janela - 1));
    return vale
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ erro: 'Código incorreto.' }, { status: 401 });
  }

  return NextResponse.json({ erro: 'Ação desconhecida.' }, { status: 400 });
}
