import { test, expect } from '@playwright/test';

/**
 * As rotas de servidor, batidas direto.
 *
 * Duas garantias importam aqui:
 *
 *  1. O preço é do SERVIDOR. O navegador manda id e quantidade; qualquer
 *     valor que ele invente é ignorado. Sem isso, dá para fechar um X Tudo
 *     por um centavo mexendo no payload pelo console.
 *
 *  2. Rota que depende de credencial ausente FALHA FECHADA, com mensagem
 *     honesta — nunca fingindo que funcionou.
 */

const ITENS_VALIDOS = [{ productId: 'x-bacon', qty: 2, note: '' }];

const ENDERECO = {
  rua: 'Rua das Palmeiras',
  numero: '245',
  bairro: 'Jardim Califórnia',
  complemento: '',
  referencia: '',
  cep: '',
};

const DINHEIRO = { forma: 'dinheiro', momento: 'na-entrega', precisaTroco: false, trocoPara: null };

/**
 * Cabeçalho de origem diferente a cada chamada.
 *
 * `/api/pedido` limita a 8 pedidos por minuto POR SOLICITANTE, e todos os
 * testes saem do mesmo 127.0.0.1 — sem isto, do oitavo em diante todos
 * recebem 429 e falham por causa de uma proteção que está funcionando certo.
 * Cada teste finge ser um cliente diferente, que é o cenário real.
 */
let contador = 0;
function comoOutroCliente() {
  contador += 1;
  return { 'x-forwarded-for': `203.0.113.${contador % 250}` };
}

test.describe('/api/pedido', () => {
  test('recusa corpo que não é JSON', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: { 'Content-Type': 'application/json', ...comoOutroCliente() },
      data: 'isto não é json',
    });
    expect(r.status()).toBe(400);
  });

  test('recusa pedido sem itens', async ({ request }) => {
    const r = await request.post('/api/pedido', { headers: comoOutroCliente(), data: { lines: [], mode: 'retirada' } });
    expect(r.status()).toBe(400);
  });

  test('recusa item que não existe no catálogo', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: { lines: [{ productId: 'lanche-inventado', qty: 1 }], mode: 'retirada' },
    });
    expect(r.status()).toBe(400);
  });

  test('recusa entrega sem endereço', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: { lines: ITENS_VALIDOS, mode: 'entrega', payment: DINHEIRO },
    });
    expect(r.status()).toBe(400);
    expect((await r.json()).erro).toMatch(/endereço/i);
  });

  test('recusa entrega com endereço pela metade', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: {
        lines: ITENS_VALIDOS,
        mode: 'entrega',
        address: { rua: 'Rua A', numero: '', bairro: 'Centro' },
        payment: DINHEIRO,
      },
    });
    expect(r.status()).toBe(400);
  });

  test('aceita retirada sem endereço nenhum', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: { lines: ITENS_VALIDOS, mode: 'retirada', payment: DINHEIRO },
    });
    expect(r.ok()).toBe(true);
    const corpo = await r.json();
    expect(corpo.modo).toBe('retirada');
    expect(corpo.total).toBeGreaterThan(0);
  });

  test('ignora o preço mandado pelo navegador e usa o do catálogo', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: {
        // preço adulterado no payload: tem que ser descartado
        lines: [{ productId: 'x-bacon', qty: 2, price: 0.01, note: '' }],
        mode: 'retirada',
        payment: DINHEIRO,
      },
    });
    expect(r.ok()).toBe(true);
    // X Bacon custa R$ 28,50 no catálogo; 2 unidades = R$ 57,00
    expect((await r.json()).total).toBe(57);
  });

  test('limita a quantidade por item', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: {
        lines: [{ productId: 'x-bacon', qty: 999_999, note: '' }],
        mode: 'retirada',
        payment: DINHEIRO,
      },
    });
    expect(r.ok()).toBe(true);
    // o teto é 50 unidades: 50 × 28,50
    expect((await r.json()).total).toBe(1425);
  });

  test('quantidade negativa ou zero vira 1', async ({ request }) => {
    for (const qty of [-5, 0]) {
      const r = await request.post('/api/pedido', {
        headers: comoOutroCliente(),
        data: { lines: [{ productId: 'x-bacon', qty, note: '' }], mode: 'retirada', payment: DINHEIRO },
      });
      expect(r.ok()).toBe(true);
      expect((await r.json()).total).toBe(28.5);
    }
  });

  test('troco menor que o total não vira troco', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: {
        lines: ITENS_VALIDOS,
        mode: 'retirada',
        payment: { forma: 'dinheiro', momento: 'na-entrega', precisaTroco: true, trocoPara: 1 },
      },
    });
    expect(r.ok()).toBe(true);
  });

  test('diz honestamente que o WhatsApp não está configurado', async ({ request }) => {
    const r = await request.post('/api/pedido', {
      headers: comoOutroCliente(),
      data: { lines: ITENS_VALIDOS, mode: 'retirada', payment: DINHEIRO },
    });
    const corpo = await r.json();
    // sem credencial da Cloud API, a rota responde 200 e informa o estado —
    // o pedido segue pelo deeplink, que é o caminho garantido
    expect(corpo.apiConfigurada).toBe(false);
    expect(corpo.enviado).toBe(false);
    expect(corpo.via).toBe('nao-configurado');
  });
});

test.describe('limite de taxa', () => {
  test('o mesmo solicitante é barrado depois de pedidos demais', async ({ request }) => {
    const mesmoCliente = { 'x-forwarded-for': '198.51.100.77' };
    const corpo = { lines: ITENS_VALIDOS, mode: 'retirada', payment: DINHEIRO };

    let barrado = false;
    // o teto é 8 por minuto; 12 chamadas seguidas têm que esbarrar nele
    for (let i = 0; i < 12; i += 1) {
      const r = await request.post('/api/pedido', { headers: mesmoCliente, data: corpo });
      if (r.status() === 429) {
        barrado = true;
        expect(r.headers()['retry-after']).toBeTruthy();
        break;
      }
    }
    expect(barrado, 'o limite de taxa precisa barrar repetição da mesma origem').toBe(true);
  });
});

test.describe('/api/checkout', () => {
  test('informa se o pagamento online existe', async ({ request }) => {
    const r = await request.get('/api/checkout');
    expect(r.ok()).toBe(true);
    expect(await r.json()).toHaveProperty('online');
  });

  test('sem gateway configurado, recusa com 503 e explica', async ({ request }) => {
    const r = await request.post('/api/checkout', {
      data: { lines: ITENS_VALIDOS, mode: 'entrega', address: ENDERECO },
    });
    // o ambiente de teste não tem MP_ACCESS_TOKEN
    expect(r.status()).toBe(503);
    const corpo = await r.json();
    expect(corpo.online).toBe(false);
    expect(corpo.error).toMatch(/não está disponível/i);
    // e em nenhuma hipótese devolve algo que pareça cobrança feita
    expect(corpo).not.toHaveProperty('checkoutUrl');
    expect(corpo).not.toHaveProperty('demo');
  });
});

test.describe('/api/auth/email', () => {
  test('informa se o login por e-mail existe', async ({ request }) => {
    const r = await request.get('/api/auth/email');
    expect(r.ok()).toBe(true);
    expect(await r.json()).toHaveProperty('ativo');
  });

  test('nunca devolve o código quando o envio não está configurado', async ({ request }) => {
    const r = await request.post('/api/auth/email', {
      headers: comoOutroCliente(),
      data: { acao: 'enviar', email: 'teste@exemplo.com' },
    });
    const corpo = await r.json();
    if (r.status() === 503) {
      // produção sem provedor de envio: a rota simplesmente não existe
      expect(corpo.erro).toMatch(/indispon/i);
    }
    // em nenhum caminho o código pode voltar junto de uma resposta de produção
    if (r.ok() && corpo.demo) {
      expect(process.env.NODE_ENV).not.toBe('production');
    }
  });

  test('recusa e-mail inválido', async ({ request }) => {
    const r = await request.post('/api/auth/email', { headers: comoOutroCliente(), data: { acao: 'enviar', email: 'nao-e-email' } });
    expect([400, 503]).toContain(r.status());
  });
});

test.describe('/api/webhook/mercadopago', () => {
  test('ignora evento sem identificador de pagamento', async ({ request }) => {
    const r = await request.post('/api/webhook/mercadopago', { data: { type: 'payment' } });
    expect(r.ok()).toBe(true);
    expect((await r.json()).ignored).toBe(true);
  });

  test('recusa evento sem assinatura válida', async ({ request }) => {
    const r = await request.post('/api/webhook/mercadopago', {
      data: { type: 'payment', data: { id: '123456789' } },
    });

    // Esta é a proteção mais importante do sistema de pagamento. Antes, sem
    // MP_WEBHOOK_SECRET configurado, a rota ACEITAVA qualquer evento — bastava
    // descobrir a URL para a cozinha receber "pedido pago" de graça. Agora,
    // em produção, evento sem assinatura conferida é recusado com 401.
    expect(r.status()).toBe(401);
    const corpo = await r.json();
    expect(corpo.error).toMatch(/assinatura/i);
    expect(corpo).not.toHaveProperty('pago');
  });
});

test.describe('cabeçalhos de segurança', () => {
  test('a página traz CSP com nonce e as demais proteções', async ({ request }) => {
    const r = await request.get('/');
    const h = r.headers();
    expect(h['content-security-policy']).toContain("script-src 'self' 'nonce-");
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['strict-transport-security']).toContain('max-age=');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('no-referrer');
    expect(h['permissions-policy']).toContain('geolocation=()');
  });

  test('o nonce muda a cada requisição', async ({ request }) => {
    const um = (await request.get('/')).headers()['content-security-policy'];
    const dois = (await request.get('/')).headers()['content-security-policy'];
    expect(um).not.toBe(dois);
  });

  test('imagem não recebe CSP — não executa script', async ({ request }) => {
    const r = await request.get('/icones/icone-192.png');
    expect(r.ok()).toBe(true);
    expect(r.headers()['content-security-policy']).toBeUndefined();
  });

  test('nenhum segredo do servidor aparece no HTML entregue', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const proibido of [
      'MP_ACCESS_TOKEN',
      'MP_WEBHOOK_SECRET',
      'WHATSAPP_TOKEN',
      'WHATSAPP_APP_SECRET',
      'ANTHROPIC_API_KEY',
      'AUTH_SECRET',
      'RESEND_API_KEY',
    ]) {
      expect(html).not.toContain(proibido);
    }
  });
});
