import type {
  AppNotification,
  Haircut,
  HaircutRange,
  NewHaircut,
  Profile,
  Service,
} from '@/lib/types';
import { SERVICOS_PADRAO } from '@/lib/constants';
import { moeda } from '@/lib/format';
import { type Adapter, type Escutas, ErroDeLogin } from './adapter';

/**
 * Modo local: o MD_cortes inteiro funcionando dentro do próprio aparelho.
 *
 * É o que abre quando não há Supabase configurado. Serve para a barbearia
 * começar a usar no mesmo minuto, sem criar conta em lugar nenhum e sem
 * contratar hospedagem. O preço é honesto e está escrito na tela: os dados
 * ficam só naquele celular, então o Maicon não vê no aparelho dele o corte que
 * o Gabriel lançou no dele. Para isso, é o modo nuvem.
 *
 * Senha nenhuma aparece no código: no primeiro acesso o sistema pede que se
 * defina a de cada perfil, e guarda só o hash PBKDF2.
 */

const CHAVE_USUARIOS = 'md-cortes:usuarios';
const CHAVE_SESSAO = 'md-cortes:sessao';
const CHAVE_CORTES = 'md-cortes:cortes';
const CHAVE_NOTIFICACOES = 'md-cortes:notificacoes';
const CANAL = 'md-cortes:eventos';

/** Ids fixos para que os dados sobrevivam a recarregamentos e atualizações. */
export const PERFIS_LOCAIS: Profile[] = [
  {
    id: 'local-maicon',
    name: 'Maicon',
    email: 'maicon',
    role: 'developer',
    jobTitle: 'Desenvolvedor',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'local-gabriel',
    name: 'Gabriel',
    email: 'gabriel',
    role: 'employee',
    jobTitle: 'Funcionário 1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'local-nino',
    name: 'Nino',
    email: 'nino',
    role: 'employee',
    jobTitle: 'Funcionário 2',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

interface Credencial {
  id: string;
  salt: string;
  hash: string;
}

/* ── armazenamento ─────────────────────────────────────────────────────── */

function ler<T>(chave: string, padrao: T): T {
  if (typeof window === 'undefined') return padrao;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* modo privado com cota zerada: o app segue, só não persiste. */
  }
}

/* ── senha ─────────────────────────────────────────────────────────────── */

function paraHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function derivar(senha: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) ?? [], (b) => parseInt(b, 16));
  const base = await crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256' },
    base,
    256,
  );
  return paraHex(bits);
}

function novoSalt(): string {
  return paraHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

/** Comparação de tempo constante — barata e correta, mesmo aqui. */
function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ── eventos entre abas ────────────────────────────────────────────────── */

type Mensagem =
  | { tipo: 'corte'; corte: Haircut }
  | { tipo: 'notificacao'; notificacao: AppNotification };

let canal: BroadcastChannel | null = null;

function obterCanal(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!canal) canal = new BroadcastChannel(CANAL);
  return canal;
}

function anunciar(mensagem: Mensagem): void {
  obterCanal()?.postMessage(mensagem);
}

/* ── adapter ───────────────────────────────────────────────────────────── */

function perfilPorId(id: string): Profile | undefined {
  return PERFIS_LOCAIS.find((p) => p.id === id);
}

function todosOsCortes(): Haircut[] {
  return ler<Haircut[]>(CHAVE_CORTES, []);
}

function idAleatorio(): string {
  return crypto.randomUUID();
}

export const adapterLocal: Adapter = {
  modo: 'local',

  precisaConfigurar() {
    return ler<Credencial[]>(CHAVE_USUARIOS, []).length < PERFIS_LOCAIS.length;
  },

  async configurar(senhas) {
    const credenciais: Credencial[] = [];
    for (const perfil of PERFIS_LOCAIS) {
      const senha = senhas[perfil.id];
      if (!senha || senha.length < 4) {
        throw new ErroDeLogin(`Defina uma senha de 4 caracteres ou mais para ${perfil.name}.`);
      }
      const salt = novoSalt();
      credenciais.push({ id: perfil.id, salt, hash: await derivar(senha, salt) });
    }
    gravar(CHAVE_USUARIOS, credenciais);
  },

  async entrar(identificador, senha) {
    const alvo = identificador.trim().toLowerCase().split('@')[0] ?? '';
    const perfil = PERFIS_LOCAIS.find(
      (p) => p.email === alvo || p.name.toLowerCase() === alvo,
    );
    const credenciais = ler<Credencial[]>(CHAVE_USUARIOS, []);
    const credencial = perfil ? credenciais.find((c) => c.id === perfil.id) : undefined;

    // Deriva mesmo quando o usuário não existe, para o tempo de resposta não
    // dizer quais nomes são válidos.
    const saltUsado = credencial?.salt ?? novoSalt();
    const calculado = await derivar(senha, saltUsado);

    if (!perfil || !credencial || !iguais(calculado, credencial.hash)) {
      throw new ErroDeLogin('Usuário ou senha incorretos.');
    }

    gravar(CHAVE_SESSAO, { id: perfil.id, em: Date.now() });
    return perfil;
  },

  async sair() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(CHAVE_SESSAO);
  },

  async sessaoAtual() {
    const sessao = ler<{ id?: string } | null>(CHAVE_SESSAO, null);
    if (!sessao?.id) return null;
    return perfilPorId(sessao.id) ?? null;
  },

  async perfis() {
    const sessao = await adapterLocal.sessaoAtual();
    if (!sessao) return [];
    // Espelha a RLS: funcionário só enxerga o próprio perfil.
    return sessao.role === 'developer' ? PERFIS_LOCAIS : [sessao];
  },

  async servicos() {
    return SERVICOS_PADRAO.map((nome, i) => ({
      id: `local-servico-${i}`,
      name: nome,
      defaultPrice: 0,
      active: true,
      sortOrder: i,
    })) satisfies Service[];
  },

  async cortes({ from, to, employeeId }: HaircutRange) {
    const sessao = await adapterLocal.sessaoAtual();
    if (!sessao) return [];
    const inicio = from.getTime();
    const fim = to.getTime();
    return todosOsCortes()
      .filter((c) => {
        const t = new Date(c.createdAt).getTime();
        if (t < inicio || t >= fim) return false;
        // Espelha a RLS: funcionário só lê os próprios cortes.
        if (sessao.role !== 'developer' && c.employeeId !== sessao.id) return false;
        if (employeeId && c.employeeId !== employeeId) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async registrarCorte(dados: NewHaircut) {
    const sessao = await adapterLocal.sessaoAtual();
    if (!sessao) throw new Error('Sessão expirada. Entre de novo.');

    const corte: Haircut = {
      id: idAleatorio(),
      employeeId: sessao.id,
      employeeName: sessao.name,
      serviceId: dados.serviceId,
      serviceName: dados.serviceName,
      price: dados.price,
      paymentMethod: dados.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    gravar(CHAVE_CORTES, [corte, ...todosOsCortes()]);
    anunciar({ tipo: 'corte', corte });

    // Mesmo efeito do gatilho do Postgres no modo nuvem.
    const destinatarios = PERFIS_LOCAIS.filter(
      (p) => p.role === 'developer' && p.id !== sessao.id,
    );
    if (destinatarios.length > 0) {
      const novas = destinatarios.map<AppNotification>((destino) => ({
        id: idAleatorio(),
        recipientId: destino.id,
        employeeId: sessao.id,
        haircutId: corte.id,
        title: 'Novo corte registrado',
        message: `${sessao.name} registrou ${corte.serviceName} — ${moeda(corte.price)}`,
        read: false,
        createdAt: corte.createdAt,
      }));
      gravar(CHAVE_NOTIFICACOES, [
        ...novas,
        ...ler<AppNotification[]>(CHAVE_NOTIFICACOES, []),
      ]);
      novas.forEach((n) => anunciar({ tipo: 'notificacao', notificacao: n }));
    }

    return corte;
  },

  async notificacoes(limite = 50) {
    const sessao = await adapterLocal.sessaoAtual();
    if (!sessao) return [];
    return ler<AppNotification[]>(CHAVE_NOTIFICACOES, [])
      .filter((n) => n.recipientId === sessao.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limite);
  },

  async marcarLida(id) {
    gravar(
      CHAVE_NOTIFICACOES,
      ler<AppNotification[]>(CHAVE_NOTIFICACOES, []).map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    );
  },

  async marcarTodasLidas() {
    const sessao = await adapterLocal.sessaoAtual();
    if (!sessao) return;
    gravar(
      CHAVE_NOTIFICACOES,
      ler<AppNotification[]>(CHAVE_NOTIFICACOES, []).map((n) =>
        n.recipientId === sessao.id ? { ...n, read: true } : n,
      ),
    );
  },

  escutar({ aoCorte, aoNotificar }: Escutas) {
    const c = obterCanal();
    if (!c) return () => {};
    const ouvir = (evento: MessageEvent<Mensagem>) => {
      const dado = evento.data;
      if (dado.tipo === 'corte') aoCorte?.({ tipo: 'INSERT', id: dado.corte.id, corte: dado.corte });
      if (dado.tipo === 'notificacao') aoNotificar?.(dado.notificacao);
    };
    c.addEventListener('message', ouvir);
    return () => c.removeEventListener('message', ouvir);
  },
};
