import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppNotification, Haircut, Profile, Service } from '@/lib/types';
import { type Adapter, ErroDeLogin } from './adapter';
import { lerConfigNuvem } from './config';

const DOMINIO = process.env.NEXT_PUBLIC_LOGIN_DOMAIN || 'mdcortes.app';

export function nuvemConfigurada(): boolean {
  return lerConfigNuvem() !== null;
}

let cliente: SupabaseClient | null = null;

function sb(): SupabaseClient {
  if (!cliente) {
    const config = lerConfigNuvem();
    if (!config) {
      // Não deveria acontecer: o adapter da nuvem só é escolhido com config.
      throw new Error('Supabase não configurado neste aparelho.');
    }
    cliente = createClient(config.url, config.chave, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'md-cortes-auth',
      },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return cliente;
}

/* ── conversão banco → domínio ─────────────────────────────────────────── */

interface LinhaPerfil {
  id: string;
  name: string;
  email: string;
  role: string;
  job_title: string | null;
  created_at: string;
}

function paraPerfil(linha: LinhaPerfil): Profile {
  return {
    id: linha.id,
    name: linha.name,
    email: linha.email,
    role: linha.role === 'developer' ? 'developer' : 'employee',
    jobTitle: linha.job_title,
    createdAt: linha.created_at,
  };
}

interface LinhaCorte {
  id: string;
  employee_id: string;
  service_id: string | null;
  service_name: string;
  price: number | string;
  payment_method: string;
  created_at: string;
  employee?: { name: string } | { name: string }[] | null;
}

/** Mantido entre chamadas para dar nome ao corte que chega pelo tempo real. */
const nomePorId = new Map<string, string>();

/** Numera os canais do Realtime, para duas assinaturas nunca colidirem. */
let proximoCanal = 0;

function paraCorte(linha: LinhaCorte): Haircut {
  const bruto = linha.employee;
  const juntado = Array.isArray(bruto) ? bruto[0] : bruto;
  const nome = juntado?.name ?? nomePorId.get(linha.employee_id) ?? 'Funcionário';
  if (juntado?.name) nomePorId.set(linha.employee_id, juntado.name);
  return {
    id: linha.id,
    employeeId: linha.employee_id,
    employeeName: nome,
    serviceId: linha.service_id,
    serviceName: linha.service_name,
    price: Number(linha.price),
    paymentMethod: (linha.payment_method as Haircut['paymentMethod']) ?? 'dinheiro',
    createdAt: linha.created_at,
  };
}

interface LinhaNotificacao {
  id: string;
  recipient_id: string;
  employee_id: string | null;
  haircut_id: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

function paraNotificacao(linha: LinhaNotificacao): AppNotification {
  return {
    id: linha.id,
    recipientId: linha.recipient_id,
    employeeId: linha.employee_id,
    haircutId: linha.haircut_id,
    title: linha.title,
    message: linha.message,
    read: linha.read,
    createdAt: linha.created_at,
  };
}

/** O campo aceita "gabriel" ou "gabriel@mdcortes.app"; o Auth só aceita e-mail. */
function paraEmail(identificador: string): string {
  const limpo = identificador.trim().toLowerCase();
  return limpo.includes('@') ? limpo : `${limpo}@${DOMINIO}`;
}

/* ── adapter ───────────────────────────────────────────────────────────── */

export const adapterNuvem: Adapter = {
  modo: 'nuvem',

  async entrar(identificador, senha) {
    const { data, error } = await sb().auth.signInWithPassword({
      email: paraEmail(identificador),
      password: senha,
    });
    if (error || !data.user) {
      // A mensagem do Supabase vem em inglês e entrega se o e-mail existe.
      throw new ErroDeLogin('Usuário ou senha inválidos');
    }
    const perfil = await buscarPerfil(data.user.id);
    if (!perfil) {
      await sb().auth.signOut();
      throw new ErroDeLogin(
        'Login válido, mas sem perfil cadastrado. Rode o seed.sql no Supabase.',
      );
    }
    return perfil;
  },

  async sair() {
    nomePorId.clear();
    await sb().auth.signOut();
  },

  async sessaoAtual() {
    const { data } = await sb().auth.getSession();
    const id = data.session?.user.id;
    if (!id) return null;
    return buscarPerfil(id);
  },

  async perfis() {
    const { data, error } = await sb()
      .from('profiles')
      .select('id, name, email, role, job_title, created_at')
      .order('role', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    const perfis = (data ?? []).map((l) => paraPerfil(l as LinhaPerfil));
    perfis.forEach((p) => nomePorId.set(p.id, p.name));
    return perfis;
  },

  async servicos() {
    const { data, error } = await sb()
      .from('services')
      .select('id, name, default_price, active, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((l) => ({
      id: l.id as string,
      name: l.name as string,
      defaultPrice: Number(l.default_price),
      active: Boolean(l.active),
      sortOrder: Number(l.sort_order),
    })) satisfies Service[];
  },

  async cortes({ from, to, employeeId }) {
    let q = sb()
      .from('haircuts')
      .select(
        'id, employee_id, service_id, service_name, price, payment_method, created_at, employee:profiles!haircuts_employee_id_fkey(name)',
      )
      .gte('created_at', from.toISOString())
      .lt('created_at', to.toISOString())
      .order('created_at', { ascending: false });
    if (employeeId) q = q.eq('employee_id', employeeId);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((l) => paraCorte(l as unknown as LinhaCorte));
  },

  async registrarCorte(dados) {
    const { data: sessao } = await sb().auth.getUser();
    const uid = sessao.user?.id;
    if (!uid) throw new Error('Sessão expirada. Entre de novo.');

    // employee_id vem da sessão, nunca do formulário — e a RLS confere de novo.
    const { data, error } = await sb()
      .from('haircuts')
      .insert({
        employee_id: uid,
        service_id: dados.serviceId,
        service_name: dados.serviceName,
        price: dados.price,
        payment_method: dados.paymentMethod,
      })
      .select(
        'id, employee_id, service_id, service_name, price, payment_method, created_at, employee:profiles!haircuts_employee_id_fkey(name)',
      )
      .single();
    if (error) throw error;
    return paraCorte(data as unknown as LinhaCorte);
  },

  async notificacoes(limite = 50) {
    const { data, error } = await sb()
      .from('notifications')
      .select('id, recipient_id, employee_id, haircut_id, title, message, read, created_at')
      .order('created_at', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return (data ?? []).map((l) => paraNotificacao(l as LinhaNotificacao));
  },

  async marcarLida(id) {
    const { error } = await sb().from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },

  async marcarTodasLidas() {
    const { data: sessao } = await sb().auth.getUser();
    const uid = sessao.user?.id;
    if (!uid) return;
    const { error } = await sb()
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', uid)
      .eq('read', false);
    if (error) throw error;
  },

  escutar({ aoCorte, aoNotificar }) {
    // Cada assinatura ganha o próprio canal. Com um nome fixo, o supabase-js
    // devolvia o mesmo canal para todo mundo, e a segunda assinatura tentava
    // registrar callbacks depois do subscribe() — o que ele recusa. O painel do
    // Maicon assina dois (cortes e notificações), então batia sempre nele.
    const canal = sb()
      .channel(`md-cortes-${(proximoCanal += 1)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'haircuts' },
        (payload) => {
          if (!aoCorte) return;
          if (payload.eventType === 'DELETE') {
            const antigo = payload.old as { id?: string };
            if (antigo?.id) aoCorte({ tipo: 'DELETE', id: antigo.id });
            return;
          }
          const linha = payload.new as unknown as LinhaCorte;
          aoCorte({
            tipo: payload.eventType === 'INSERT' ? 'INSERT' : 'UPDATE',
            id: linha.id,
            corte: paraCorte(linha),
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (!aoNotificar) return;
          aoNotificar(paraNotificacao(payload.new as unknown as LinhaNotificacao));
        },
      )
      .subscribe();

    return () => {
      void sb().removeChannel(canal);
    };
  },

  aoMudarAutenticacao(aviso) {
    const { data } = sb().auth.onAuthStateChange((evento, sessao) => {
      if (evento === 'SIGNED_OUT' || !sessao?.user) {
        nomePorId.clear();
        aviso(null);
        return;
      }
      // TOKEN_REFRESHED não muda quem está logado: buscar o perfil de novo a
      // cada renovação seria uma consulta a mais sem nenhuma informação nova.
      if (evento !== 'SIGNED_IN' && evento !== 'USER_UPDATED') return;
      void buscarPerfil(sessao.user.id).then(aviso);
    });
    return () => data.subscription.unsubscribe();
  },

};

async function buscarPerfil(id: string): Promise<Profile | null> {
  const { data, error } = await sb()
    .from('profiles')
    .select('id, name, email, role, job_title, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  const perfil = paraPerfil(data as LinhaPerfil);
  nomePorId.set(perfil.id, perfil.name);
  return perfil;
}
