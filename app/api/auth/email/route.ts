import { NextResponse } from 'next/server';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/**
 * Código de acesso por e-mail, sem banco de dados.
 *
 * O código não é guardado no servidor: ele é derivado por HMAC de
 * (e-mail + janela de tempo + segredo). Isso dá um código de 6 dígitos válido
 * por ~10 minutos, verificável sem estado, o que mantém a rota funcionando em
 * ambiente serverless sem sessão compartilhada.
 *
 * Para enviar de fato o e-mail é preciso um provedor de envio (Resend,
 * SendGrid, SES) e a chave correspondente. Sem `EMAIL_FROM` + `RESEND_API_KEY`
 * a rota responde em modo demonstração e devolve o código na própria resposta,
 * marcado como tal — a tela mostra isso ao usuário, para ninguém achar que
 * recebeu um e-mail que não foi enviado.
 */

const SEGREDO = process.env.AUTH_SECRET ?? 'michel-food-house-dev-secret';
const JANELA_MS = 10 * 60_000;
const ENVIO_ATIVO = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

function codigoPara(email: string, janela: number): string {
  const mac = createHmac('sha256', SEGREDO).update(`${email.toLowerCase()}:${janela}`).digest();
  return String(mac.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

function conferem(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(request: Request) {
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
      // Nada foi enviado: devolve o código marcado como demonstração.
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
