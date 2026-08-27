#!/usr/bin/env node
/**
 * Um Supabase de mentira, para testar o login de verdade.
 *
 * O Supabase do projeto não é alcançável do ambiente onde estes testes rodam,
 * e mesmo que fosse não se testa login sem as senhas reais. Então este servidor
 * responde os mesmos endpoints (auth + PostgREST) com três usuários conhecidos:
 * o app não sabe a diferença, e dá para exercitar senha certa, senha errada,
 * papéis e proteção de rota.
 *
 * O que ele prova: que o app pede senha ao servidor, aceita só a resposta boa,
 * lê o perfil e o papel, e fecha as telas internas sem sessão.
 * O que ele não prova: que o projeto Supabase real está configurado certo.
 *
 *   node scripts/teste/supabase-falso.mjs [porta]
 */

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORTA = Number(process.argv[2] ?? 5555);

const USUARIOS = [
  { id: '11111111-1111-4111-8111-111111111111', email: 'maicon@mdcortes.app',  senha: 'senha-do-maicon',  name: 'Maicon',  role: 'developer', job_title: 'Desenvolvedor' },
  { id: '22222222-2222-4222-8222-222222222222', email: 'gabriel@mdcortes.app', senha: 'senha-do-gabriel', name: 'Gabriel', role: 'employee',  job_title: 'Funcionário 1' },
  { id: '33333333-3333-4333-8333-333333333333', email: 'nino@mdcortes.app',    senha: 'senha-do-nino',    name: 'Nino',    role: 'employee',  job_title: 'Funcionário 2' },
];

const SERVICOS = ['Corte', 'Corte Degradê', 'Barba', 'Corte + Barba', 'Sobrancelha', 'Acabamento', 'Outro']
  .map((name, i) => ({ id: `s${i}`, name, default_price: 0, active: true, sort_order: i }));

/** access_token → id do usuário. */
const sessoes = new Map();
const cortes = [];
const notificacoes = [];

const json = (res, codigo, corpo) => {
  res.writeHead(codigo, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-expose-headers': 'content-range',
  });
  res.end(JSON.stringify(corpo));
};

const corpoDe = (req) =>
  new Promise((resolve) => {
    let dados = '';
    req.on('data', (p) => (dados += p));
    req.on('end', () => {
      try { resolve(dados ? JSON.parse(dados) : {}); } catch { resolve({}); }
    });
  });

/** Quem é o portador do token desta requisição. */
function autor(req) {
  const bruto = req.headers.authorization ?? '';
  const token = bruto.replace(/^Bearer\s+/i, '');
  const id = sessoes.get(token);
  return USUARIOS.find((u) => u.id === id) ?? null;
}

function sessaoPara(u) {
  const access_token = `tok_${randomUUID()}`;
  sessoes.set(access_token, u.id);
  return {
    access_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: `ref_${randomUUID()}`,
    user: {
      id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email,
      email_confirmed_at: '2024-01-01T00:00:00Z', phone: '',
      created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: u.name, role: u.role, job_title: u.job_title },
      identities: [],
    },
  };
}

/** Traduz os filtros do PostgREST que o app realmente usa. */
function aplicarFiltros(linhas, params) {
  let saida = linhas;
  for (const [chave, valor] of params) {
    if (['select', 'order', 'limit', 'offset'].includes(chave)) continue;
    const [op, ...resto] = valor.split('.');
    const alvo = resto.join('.');
    saida = saida.filter((l) => {
      const v = l[chave];
      if (op === 'eq') return String(v) === alvo;
      if (op === 'gte') return String(v) >= alvo;
      if (op === 'lt') return String(v) < alvo;
      if (op === 'is') return alvo === 'null' ? v == null : Boolean(v) === (alvo === 'true');
      return true;
    });
  }
  return saida;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORTA}`);
  const caminho = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    });
    res.end();
    return;
  }

  // ── Auth ────────────────────────────────────────────────────────────────
  if (caminho === '/auth/v1/token') {
    const corpo = await corpoDe(req);
    const u = USUARIOS.find((x) => x.email === String(corpo.email ?? '').toLowerCase());
    if (!u || u.senha !== corpo.password) {
      // Mesma forma do erro real do GoTrue.
      return json(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
    }
    return json(res, 200, sessaoPara(u));
  }

  if (caminho === '/auth/v1/user') {
    const u = autor(req);
    if (!u) return json(res, 401, { message: 'invalid claim: missing sub claim' });
    return json(res, 200, sessaoPara(u).user);
  }

  if (caminho === '/auth/v1/logout') {
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    sessoes.delete(token);
    res.writeHead(204, { 'access-control-allow-origin': '*' });
    return res.end();
  }

  // ── PostgREST ───────────────────────────────────────────────────────────
  if (caminho.startsWith('/rest/v1/')) {
    const tabela = caminho.slice('/rest/v1/'.length);
    const u = autor(req);
    // Sem token, o PostgREST com RLS não devolve nada — é o que espelhamos.
    if (!u) return json(res, 200, []);

    const objeto = (req.headers.accept ?? '').includes('pgrst.object');
    const responder = (linhas) => json(res, 200, objeto ? (linhas[0] ?? null) : linhas);

    if (tabela === 'profiles') {
      // Escolhe campo a campo de propósito: a senha não sai daqui nem por engano.
      const todos = USUARIOS.map((x) => ({
        id: x.id, name: x.name, email: x.email, role: x.role,
        job_title: x.job_title, created_at: '2024-01-01T00:00:00Z',
      }));
      // Espelha a RLS: funcionário só enxerga o próprio perfil.
      const visiveis = u.role === 'developer' ? todos : todos.filter((p) => p.id === u.id);
      return responder(aplicarFiltros(visiveis, url.searchParams));
    }

    if (tabela === 'services') return responder(aplicarFiltros(SERVICOS, url.searchParams));

    if (tabela === 'haircuts') {
      if (req.method === 'POST') {
        const corpo = await corpoDe(req);
        const novo = {
          id: randomUUID(), employee_id: u.id, service_id: corpo.service_id ?? null,
          service_name: corpo.service_name, price: corpo.price,
          payment_method: corpo.payment_method, created_at: new Date().toISOString(),
        };
        cortes.push(novo);
        for (const d of USUARIOS.filter((x) => x.role === 'developer' && x.id !== u.id)) {
          notificacoes.push({
            id: randomUUID(), recipient_id: d.id, employee_id: u.id, haircut_id: novo.id,
            title: 'Novo corte registrado',
            message: `${u.name} registrou ${novo.service_name}`,
            read: false, created_at: novo.created_at,
          });
        }
        return json(res, 201, [{ ...novo, employee: { name: u.name } }]);
      }
      const visiveis = (u.role === 'developer' ? cortes : cortes.filter((c) => c.employee_id === u.id))
        .map((c) => ({ ...c, employee: { name: USUARIOS.find((x) => x.id === c.employee_id)?.name ?? '' } }));
      return responder(aplicarFiltros(visiveis, url.searchParams));
    }

    if (tabela === 'notifications') {
      if (req.method === 'PATCH') { res.writeHead(204, { 'access-control-allow-origin': '*' }); return res.end(); }
      return responder(aplicarFiltros(notificacoes.filter((n) => n.recipient_id === u.id), url.searchParams));
    }

    return responder([]);
  }

  res.writeHead(404, { 'access-control-allow-origin': '*' });
  res.end('sem rota');
}).listen(PORTA, () => console.log(`Supabase falso em http://localhost:${PORTA}`));
