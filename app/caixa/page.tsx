"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SUPABASE_URL = "https://qtxcqlzfqfckcjpeboeo.supabase.co";
const SUPABASE_KEY = "sb_publishable_TWIxTBn8_aWmtlX3xnvLNA_9ZthmAiz";
const STORAGE_KEY = "comida_caseira_caixa_token";

const publicClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const adminClient = (token: string) =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { headers: { "x-comida-caseira-admin-token": token } },
  });

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0) / 100);

const toCents = (value: FormDataEntryValue | null) =>
  Math.max(
    0,
    Math.round(Number(String(value || "0").replace(".", "").replace(",", ".")) * 100),
  );

const today = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
};

const formatShortDate = (value?: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pending: "A receber",
  paid: "Pago",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

const methodLabels: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
};

type Tab =
  | "resumo"
  | "pedidos"
  | "receitas"
  | "despesas"
  | "relatorios"
  | "produtos"
  | "clientes"
  | "configuracoes";

type Summary = {
  pedidos?: number;
  faturamento_cents?: number;
  recebimentos_cents?: number;
  despesas_cents?: number;
  lucro_liquido_cents?: number;
  ticket_medio_cents?: number;
  pendente_cents?: number;
  custo_cents?: number;
};

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  total_cents: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  order_type: string;
  address_json?: Record<string, string> | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name_snapshot: string;
  quantity: number;
  total_cents: number;
};

type Revenue = {
  id: string;
  descricao: string;
  amount_cents: number;
  payment_method: string;
  ocorrido_em: string;
  created_at: string;
  order_id?: string | null;
};

type Expense = {
  id: string;
  descricao: string;
  amount_cents: number;
  payment_method: string;
  ocorrido_em: string;
  fornecedor?: string;
  category_id?: string | null;
  created_at: string;
};

type Product = {
  id: string;
  nome: string;
  categoria: string;
  price_cents: number;
  cost_cents: number;
};

type Customer = {
  id: string;
  nome: string;
  telefone: string;
  pedidos: number;
  total_cents: number;
  ultimo_pedido_at: string | null;
};

type Category = { id: string; nome: string };

const menuItems: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: "resumo", label: "Resumo", icon: Home },
  { key: "pedidos", label: "Pedidos", icon: ClipboardList },
  { key: "receitas", label: "Receitas", icon: CircleDollarSign },
  { key: "despesas", label: "Despesas", icon: Receipt },
  { key: "relatorios", label: "Relatórios", icon: BarChart3 },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "configuracoes", label: "Configurações", icon: Settings },
];

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await publicClient.rpc("comida_caseira_admin_login", {
      p_password: password,
    });
    setLoading(false);
    if (error || !data?.token) {
      setError("Senha incorreta.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, data.token);
    onLogin(data.token);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f7f8] p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[26px] border border-black/5 bg-white p-7 shadow-[0_20px_70px_rgba(0,0,0,0.08)]"
      >
        <div className="flex justify-center">
          <img
            src="/images/brand/logo.png"
            alt="Comida Caseira da Márcia Costa"
            className="h-24 w-24 object-contain"
          />
        </div>
        <h1 className="mt-3 text-center text-2xl font-black text-neutral-950">
          Fluxo de Caixa
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-neutral-500">
          Entre para acompanhar pedidos, receitas, despesas e relatórios.
        </p>
        <label className="mt-6 block text-sm font-bold text-neutral-700">
          Senha do administrador
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 outline-none transition focus:border-[#ff5a1f] focus:ring-4 focus:ring-orange-100"
        />
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <button
          disabled={loading}
          className="mt-4 min-h-12 w-full rounded-xl bg-[#ff5a1f] px-4 font-extrabold text-white shadow-[0_8px_20px_rgba(255,90,31,0.28)] disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar no sistema"}
        </button>
      </form>
    </main>
  );
}

function KpiCard({
  title,
  value,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  tone: "green" | "blue" | "orange" | "red";
  icon: typeof TrendingUp;
}) {
  const toneMap = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-black tracking-tight">{value}</div>
          <div className="mt-1 text-[12px] font-semibold text-neutral-600">{title}</div>
        </div>
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-neutral-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.035)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-black text-neutral-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AppTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white">
      <table className="w-full min-w-[720px] border-collapse text-sm">{children}</table>
    </div>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-neutral-100 bg-neutral-50/70 px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}

function CellText({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-neutral-100 px-4 py-3 text-[13px] text-neutral-700">{children}</td>;
}

function StatusBadge({ label, tone = "green" }: { label: string; tone?: "green" | "gray" | "red" }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-neutral-100 text-neutral-600",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${map[tone]}`}>
      {label}
    </span>
  );
}

export default function CaixaPage() {
  const currentDate = useMemo(() => today(), []);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("resumo");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState<Summary>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modal, setModal] = useState<"revenue" | "expense" | null>(null);
  const [from, setFrom] = useState(currentDate);
  const [to, setTo] = useState(currentDate);
  const [report, setReport] = useState<Summary | null>(null);
  const [orderSearch, setOrderSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    adminClient(stored)
      .rpc("comida_caseira_admin_token_valido")
      .then(({ data }) => {
        if (data) setToken(stored);
        else localStorage.removeItem(STORAGE_KEY);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (token) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function toast(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  }

  async function loadAll() {
    if (!token) return;
    const client = adminClient(token);
    const [s, o, i, r, e, c, p, customersResult] = await Promise.all([
      client.rpc("comida_caseira_admin_resumo", { p_de: currentDate, p_ate: currentDate }),
      client.from("comida_caseira_orders").select("*").order("created_at", { ascending: false }).limit(120),
      client.from("comida_caseira_order_items").select("*").limit(500),
      client.from("comida_caseira_revenues").select("*").order("created_at", { ascending: false }).limit(160),
      client.from("comida_caseira_expenses").select("*").order("created_at", { ascending: false }).limit(160),
      client.from("comida_caseira_expense_categories").select("*").order("ordem"),
      client.from("comida_caseira_products").select("*").order("nome"),
      client.from("comida_caseira_customers").select("*").order("ultimo_pedido_at", { ascending: false }).limit(160),
    ]);

    if (s.error?.code === "28000") {
      logout(false);
      return;
    }
    setSummary(s.data || {});
    setOrders((o.data || []) as Order[]);
    setItems((i.data || []) as OrderItem[]);
    setRevenues((r.data || []) as Revenue[]);
    setExpenses((e.data || []) as Expense[]);
    setCategories((c.data || []) as Category[]);
    setProducts((p.data || []) as Product[]);
    setCustomers((customersResult.data || []) as Customer[]);
  }

  async function logout(callRpc = true) {
    if (callRpc && token) await adminClient(token).rpc("comida_caseira_admin_logout");
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }

  async function addRevenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const { error } = await adminClient(token).from("comida_caseira_revenues").insert({
      tipo: "manual",
      descricao: String(form.get("descricao") || "Recebimento manual"),
      amount_cents: toCents(form.get("valor")),
      payment_method: String(form.get("forma") || "pix"),
      ocorrido_em: String(form.get("data") || currentDate),
      observacao: String(form.get("observacao") || ""),
    });
    if (error) return toast(error.message);
    setModal(null);
    toast("Receita salva.");
    loadAll();
  }

  async function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const { error } = await adminClient(token).from("comida_caseira_expenses").insert({
      descricao: String(form.get("descricao") || "Despesa"),
      amount_cents: toCents(form.get("valor")),
      payment_method: String(form.get("forma") || "cash"),
      category_id: form.get("categoria") || null,
      fornecedor: String(form.get("fornecedor") || ""),
      ocorrido_em: String(form.get("data") || currentDate),
      observacao: String(form.get("observacao") || ""),
    });
    if (error) return toast(error.message);
    setModal(null);
    toast("Despesa salva.");
    loadAll();
  }

  async function runReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const { data, error } = await adminClient(token).rpc("comida_caseira_admin_resumo", {
      p_de: from,
      p_ate: to,
    });
    if (error) return toast(error.message);
    setReport(data || {});
  }

  async function editCost(product: Product) {
    if (!token) return;
    const value = window.prompt(
      `Novo custo de ${product.nome} em R$`,
      (Number(product.cost_cents || 0) / 100).toFixed(2).replace(".", ","),
    );
    if (value === null) return;
    const { error } = await adminClient(token)
      .from("comida_caseira_products")
      .update({ cost_cents: toCents(value), updated_at: new Date().toISOString() })
      .eq("id", product.id);
    if (error) return toast(error.message);
    toast("Custo atualizado.");
    loadAll();
  }

  async function changePassword() {
    if (!token) return;
    const p1 = window.prompt("Digite a nova senha (mínimo 10 caracteres)");
    if (!p1) return;
    const p2 = window.prompt("Repita a nova senha");
    if (p1 !== p2) return toast("As senhas não conferem.");
    const { error } = await adminClient(token).rpc("comida_caseira_admin_trocar_senha", {
      p_nova_senha: p1,
    });
    if (error) return toast(error.message);
    toast("Senha alterada.");
  }

  if (!ready) {
    return <div className="grid min-h-dvh place-items-center bg-[#f7f7f8] text-neutral-500">Carregando…</div>;
  }
  if (!token) return <Login onLogin={setToken} />;

  const lastOrders = orders.slice(0, 5);
  const filteredOrders = orders.filter((order) => {
    const term = orderSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      String(order.order_number).includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_phone.toLowerCase().includes(term)
    );
  });

  const chartData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    const amount = orders
      .filter((order) => order.created_at.slice(0, 10) === dayKey && order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total_cents || 0), 0);
    return {
      day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date),
      value: amount / 100,
    };
  });

  const paymentData = [
    { name: "PIX", color: "#2563eb", value: revenues.filter((r) => r.payment_method === "pix").reduce((a, b) => a + b.amount_cents, 0) },
    { name: "Dinheiro", color: "#22c55e", value: revenues.filter((r) => r.payment_method === "cash").reduce((a, b) => a + b.amount_cents, 0) },
    { name: "Débito", color: "#f59e0b", value: revenues.filter((r) => r.payment_method === "debit").reduce((a, b) => a + b.amount_cents, 0) },
    { name: "Crédito", color: "#ef4444", value: revenues.filter((r) => r.payment_method === "credit").reduce((a, b) => a + b.amount_cents, 0) },
  ];
  const paymentTotal = paymentData.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="min-h-dvh bg-[#f7f7f8] text-neutral-950">
      {notice && (
        <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white shadow-xl">
          {notice}
        </div>
      )}

      <div className="mx-auto flex min-h-dvh max-w-[1536px] bg-white lg:my-3 lg:min-h-[calc(100vh-24px)] lg:overflow-hidden lg:rounded-[26px] lg:border lg:border-neutral-200 lg:shadow-[0_14px_60px_rgba(0,0,0,.06)]">
        <aside className="hidden w-[210px] shrink-0 flex-col border-r border-neutral-200 bg-white p-4 lg:flex">
          <div className="flex justify-center pb-4">
            <img src="/images/brand/logo.png" alt="Logo" className="h-24 w-24 object-contain" />
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                    active ? "bg-orange-50 text-[#ff5a1f]" : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => logout()}
            className="mt-auto flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </aside>

        <main className="min-w-0 flex-1 bg-white pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur lg:static lg:border-b-0 lg:px-6 lg:pb-2 lg:pt-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:block">
                <button onClick={() => setMobileMenu(true)} className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <img src="/images/brand/logo.png" alt="Logo" className="h-12 w-12 object-contain lg:hidden" />
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-black tracking-tight">Fluxo de Caixa</h1>
                  <p className="mt-1 text-sm text-neutral-500">Acompanhe suas vendas e movimentações</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 lg:flex">
                  <CalendarDays className="h-4 w-4" />
                  Hoje, {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(new Date())}
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-neutral-50 lg:hidden">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 lg:hidden">
              <h1 className="text-xl font-black">{menuItems.find((item) => item.key === tab)?.label || "Resumo do dia"}</h1>
            </div>
          </header>

          <div className="p-4 lg:px-6 lg:pb-6 lg:pt-3">
            {tab === "resumo" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <KpiCard title="Vendas do dia" value={money(summary.faturamento_cents)} tone="green" icon={TrendingUp} />
                  <KpiCard title="Pedidos do dia" value={String(summary.pedidos || 0)} tone="blue" icon={ShoppingBag} />
                  <KpiCard title="Recebimentos" value={money(summary.recebimentos_cents)} tone="orange" icon={Wallet} />
                  <KpiCard title="Despesas do dia" value={money(summary.despesas_cents)} tone="red" icon={TrendingDown} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_.95fr]">
                  <SectionCard
                    title="Vendas"
                    action={<div className="hidden gap-1 rounded-lg bg-neutral-50 p-1 sm:flex"><span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">Diário</span><span className="px-3 py-1 text-xs text-neutral-500">Semanal</span><span className="px-3 py-1 text-xs text-neutral-500">Mensal</span></div>}
                  >
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                          <CartesianGrid stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#737373" }} width={48} tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip formatter={(v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v))} />
                          <Bar dataKey="value" fill="#ff5a1f" radius={[5, 5, 0, 0]} maxBarSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>

                  <SectionCard title="Resumo do Período">
                    <div className="space-y-4 text-sm">
                      <SummaryLine label="Faturamento bruto" value={money(summary.faturamento_cents)} />
                      <SummaryLine label="Recebimentos" value={money(summary.recebimentos_cents)} tone="green" />
                      <SummaryLine label="Despesas" value={money(summary.despesas_cents)} tone="red" />
                      <div className="rounded-xl bg-emerald-50 p-4">
                        <SummaryLine label="Lucro líquido" value={money(summary.lucro_liquido_cents)} tone="green" strong />
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_.95fr]">
                  <SectionCard
                    title="Últimos pedidos"
                    action={<button onClick={() => setTab("pedidos")} className="text-xs font-extrabold text-[#ff5a1f]">Ver todos</button>}
                  >
                    <div className="space-y-2">
                      {lastOrders.length ? lastOrders.map((order) => (
                        <button key={order.id} onClick={() => setSelectedOrder(order)} className="flex w-full items-center gap-3 border-b border-neutral-100 py-2 text-left last:border-b-0">
                          <div className="min-w-0 flex-1"><div className="text-sm font-black">#{order.order_number}</div><div className="text-[11px] text-neutral-500">{formatDateTime(order.created_at)}</div></div>
                          <div className="text-sm font-black">{money(order.total_cents)}</div>
                          <StatusBadge label={paymentLabels[order.payment_status] || order.payment_status} tone={order.payment_status === "paid" ? "green" : "gray"} />
                        </button>
                      )) : <div className="py-6 text-center text-sm text-neutral-500">Nenhum pedido ainda.</div>}
                    </div>
                  </SectionCard>

                  <SectionCard title="Formas de pagamento">
                    <div className="grid items-center gap-4 sm:grid-cols-[150px_1fr]">
                      <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={1}>
                              {paymentData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {paymentData.map((item) => (
                          <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
                            <div className="flex items-center gap-2 font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</div>
                            <div className="text-neutral-500">{Math.round((item.value / paymentTotal) * 100)}%</div>
                            <div className="font-bold">{money(item.value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs font-semibold text-blue-700">
                  Todos os pedidos feitos pelo site são registrados automaticamente no fluxo de caixa.
                </div>
              </div>
            )}

            {tab === "pedidos" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2 overflow-x-auto"><FilterPill active label="Todos" /><FilterPill label="Hoje" /><FilterPill label="Ontem" /><FilterPill label="Período" /></div>
                  <div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Buscar pedido..." className="min-h-11 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-[#ff5a1f]" /></div>
                </div>
                <SectionCard title={`Pedidos (${filteredOrders.length})`}>
                  <AppTable><thead><tr><HeadCell>Pedido</HeadCell><HeadCell>Cliente</HeadCell><HeadCell>Pagamento</HeadCell><HeadCell>Valor</HeadCell><HeadCell>Status</HeadCell><HeadCell>Data</HeadCell></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer hover:bg-neutral-50"><CellText><b>#{order.order_number}</b></CellText><CellText><b>{order.customer_name}</b><div className="text-[11px] text-neutral-400">{order.customer_phone}</div></CellText><CellText>{methodLabels[order.payment_method] || order.payment_method}</CellText><CellText><b>{money(order.total_cents)}</b></CellText><CellText><StatusBadge label={paymentLabels[order.payment_status] || order.payment_status} tone={order.payment_status === "paid" ? "green" : "gray"} /></CellText><CellText>{formatDateTime(order.created_at)}</CellText></tr>)}</tbody></AppTable>
                </SectionCard>
              </div>
            )}

            {tab === "receitas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Receitas</h2><p className="text-sm text-neutral-500">Total do dia <b className="ml-2 text-emerald-700">{money(summary.recebimentos_cents)}</b></p></div><button onClick={() => setModal("revenue")} className="grid h-11 w-11 place-items-center rounded-full bg-[#ff5a1f] text-white shadow-lg"><Plus /></button></div>
                <SectionCard title="Receitas registradas"><div className="divide-y divide-neutral-100">{revenues.map((row) => <div key={row.id} className="flex items-center gap-3 py-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><Receipt className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-bold">{row.descricao}</div><div className="text-[11px] text-neutral-500">{row.ocorrido_em} • {methodLabels[row.payment_method] || row.payment_method}</div></div><div className="font-black text-emerald-700">{money(row.amount_cents)}</div></div>)}</div></SectionCard>
              </div>
            )}

            {tab === "despesas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Despesas</h2><p className="text-sm text-neutral-500">Total do dia <b className="ml-2 text-red-700">{money(summary.despesas_cents)}</b></p></div><button onClick={() => setModal("expense")} className="grid h-11 w-11 place-items-center rounded-full bg-[#ff5a1f] text-white shadow-lg"><Plus /></button></div>
                <SectionCard title="Despesas registradas"><div className="divide-y divide-neutral-100">{expenses.map((row) => <div key={row.id} className="flex items-center gap-3 py-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600"><Receipt className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-bold">{row.descricao}</div><div className="text-[11px] text-neutral-500">{row.fornecedor || "Sem fornecedor"} • {row.ocorrido_em}</div></div><div className="font-black text-red-700">{money(row.amount_cents)}</div></div>)}</div></SectionCard>
              </div>
            )}

            {tab === "relatorios" && (
              <div className="space-y-4">
                <div><h2 className="text-xl font-black">Relatórios</h2><div className="mt-3 flex gap-2 overflow-x-auto"><FilterPill active label="Diário" /><FilterPill label="Semanal" /><FilterPill label="Mensal" /><FilterPill label="Personalizado" /></div></div>
                <SectionCard title="Período"><form onSubmit={runReport} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-bold text-neutral-600">De<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-[#ff5a1f]" /></label><label className="text-xs font-bold text-neutral-600">Até<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-[#ff5a1f]" /></label><button className="self-end rounded-xl bg-[#ff5a1f] px-5 py-3 text-sm font-extrabold text-white">Gerar relatório</button></form></SectionCard>
                {report && <SectionCard title="Resumo do relatório"><div className="space-y-4"><SummaryLine label="Faturamento bruto" value={money(report.faturamento_cents)} /><SummaryLine label="Recebimentos" value={money(report.recebimentos_cents)} tone="green" /><SummaryLine label="Despesas" value={money(report.despesas_cents)} tone="red" /><div className="rounded-xl bg-emerald-50 p-4"><SummaryLine label="Lucro líquido" value={money(report.lucro_liquido_cents)} tone="green" strong /></div><SummaryLine label="Pedidos" value={String(report.pedidos || 0)} /><SummaryLine label="Ticket médio" value={money(report.ticket_medio_cents)} /></div></SectionCard>}
              </div>
            )}

            {tab === "produtos" && (
              <SectionCard title="Produtos e custos"><AppTable><thead><tr><HeadCell>Produto</HeadCell><HeadCell>Categoria</HeadCell><HeadCell>Venda</HeadCell><HeadCell>Custo</HeadCell><HeadCell>Margem</HeadCell><HeadCell>Ação</HeadCell></tr></thead><tbody>{products.map((product) => <tr key={product.id}><CellText><b>{product.nome}</b></CellText><CellText>{product.categoria}</CellText><CellText>{money(product.price_cents)}</CellText><CellText>{money(product.cost_cents)}</CellText><CellText>{money(product.price_cents - product.cost_cents)}</CellText><CellText><button onClick={() => editCost(product)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold hover:border-orange-300 hover:text-orange-600">Editar custo</button></CellText></tr>)}</tbody></AppTable></SectionCard>
            )}

            {tab === "clientes" && (
              <SectionCard title="Clientes"><AppTable><thead><tr><HeadCell>Cliente</HeadCell><HeadCell>Telefone</HeadCell><HeadCell>Pedidos</HeadCell><HeadCell>Total gasto</HeadCell><HeadCell>Último pedido</HeadCell></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><CellText><b>{customer.nome}</b></CellText><CellText>{customer.telefone || "—"}</CellText><CellText>{customer.pedidos}</CellText><CellText>{money(customer.total_cents)}</CellText><CellText>{formatDateTime(customer.ultimo_pedido_at)}</CellText></tr>)}</tbody></AppTable></SectionCard>
            )}

            {tab === "configuracoes" && (
              <div className="mx-auto max-w-2xl space-y-3">
                {[
                  ["Dados da empresa", UserRound],
                  ["Formas de pagamento", CreditCard],
                  ["Taxa de entrega", Wallet],
                  ["Categorias de despesas", Receipt],
                  ["Usuários", Users],
                  ["Backup", FileText],
                  ["Notificações", Bell],
                  ["Sobre o sistema", Settings],
                ].map(([label, Icon]) => (
                  <button key={String(label)} className="flex w-full items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 text-left shadow-sm hover:border-orange-200"><Icon className="h-4 w-4" /><span className="flex-1 text-sm font-bold">{String(label)}</span><ChevronRight className="h-4 w-4 text-neutral-400" /></button>
                ))}
                <button onClick={changePassword} className="w-full rounded-2xl border border-neutral-100 bg-white p-4 text-left text-sm font-bold">Trocar senha do fluxo de caixa</button>
                <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-sm font-bold text-red-700"><LogOut className="h-4 w-4" />Sair do sistema</button>
              </div>
            )}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[70px] items-center justify-around border-t border-neutral-200 bg-white px-2 lg:hidden">
        <MobileNavButton active={tab === "resumo"} icon={Home} label="Resumo" onClick={() => setTab("resumo")} />
        <MobileNavButton active={tab === "pedidos"} icon={ClipboardList} label="Pedidos" onClick={() => setTab("pedidos")} />
        <button onClick={() => setModal("revenue")} className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-[#ff5a1f] text-white shadow-[0_10px_30px_rgba(255,90,31,.35)]"><Plus /></button>
        <MobileNavButton active={tab === "despesas"} icon={Receipt} label="Despesas" onClick={() => setTab("despesas")} />
        <MobileNavButton active={tab === "configuracoes"} icon={Menu} label="Mais" onClick={() => setTab("configuracoes")} />
      </nav>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fechar menu" onClick={() => setMobileMenu(false)} className="absolute inset-0 bg-black/30" />
          <div className="relative h-full w-[82%] max-w-sm bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between"><img src="/images/brand/logo.png" alt="Logo" className="h-20 w-20 object-contain" /><button onClick={() => setMobileMenu(false)} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100"><X className="h-5 w-5" /></button></div>
            <nav className="mt-4 space-y-1">{menuItems.map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => { setTab(item.key); setMobileMenu(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${tab === item.key ? "bg-orange-50 text-orange-600" : "text-neutral-700"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-4">
          <div className="w-full rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[24px]">
            <div className="flex items-center justify-between"><h2 className="text-lg font-black">{modal === "revenue" ? "Nova Receita" : "Nova Despesa"}</h2><button onClick={() => setModal(null)} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><X className="h-4 w-4" /></button></div>
            <form onSubmit={modal === "revenue" ? addRevenue : addExpense} className="mt-5 space-y-3">
              {modal === "expense" && <FormField label="Categoria"><select name="categoria" className="form-input"><option value="">Selecione a categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></FormField>}
              <FormField label="Descrição"><input name="descricao" required placeholder={modal === "expense" ? "Ex.: Compra de carne" : "Ex.: Pagamento recebido"} className="form-input" /></FormField>
              <FormField label="Valor"><input name="valor" required inputMode="decimal" placeholder="R$ 0,00" className="form-input" /></FormField>
              <FormField label="Forma de pagamento"><select name="forma" className="form-input"><option value="pix">PIX</option><option value="cash">Dinheiro</option><option value="debit">Débito</option><option value="credit">Crédito</option></select></FormField>
              {modal === "expense" && <FormField label="Fornecedor"><input name="fornecedor" className="form-input" /></FormField>}
              <FormField label="Data"><input name="data" type="date" defaultValue={currentDate} className="form-input" /></FormField>
              <FormField label="Observação (opcional)"><input name="observacao" className="form-input" /></FormField>
              <button className="mt-3 min-h-12 w-full rounded-xl bg-[#ff5a1f] font-extrabold text-white shadow-lg">{modal === "revenue" ? "Salvar Receita" : "Salvar Despesa"}</button>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-4">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[24px]">
            <div className="flex items-start justify-between gap-3"><div><div className="text-lg font-black">Pedido #{selectedOrder.order_number}</div><div className="mt-1"><StatusBadge label={paymentLabels[selectedOrder.payment_status] || selectedOrder.payment_status} tone={selectedOrder.payment_status === "paid" ? "green" : "gray"} /></div></div><button onClick={() => setSelectedOrder(null)} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><X className="h-4 w-4" /></button></div>
            <div className="mt-5 space-y-2 text-sm"><DetailLine label="Data" value={formatDateTime(selectedOrder.created_at)} /><DetailLine label="Forma de pagamento" value={methodLabels[selectedOrder.payment_method] || selectedOrder.payment_method} /><DetailLine label="Tipo de pedido" value={selectedOrder.order_type === "delivery" ? "Entrega" : "Retirada"} /><DetailLine label="Cliente" value={selectedOrder.customer_name} /><DetailLine label="Telefone" value={selectedOrder.customer_phone} /></div>
            <div className="mt-5 border-t pt-4"><div className="text-sm font-black">Itens do pedido</div><div className="mt-3 space-y-2">{items.filter((item) => item.order_id === selectedOrder.id).map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span>{item.quantity}x {item.product_name_snapshot}</span><b>{money(item.total_cents)}</b></div>)}</div></div>
            <div className="mt-5 border-t pt-4"><div className="flex items-center justify-between"><span className="font-black">Total</span><span className="text-xl font-black text-emerald-700">{money(selectedOrder.total_cents)}</span></div></div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .form-input { min-height: 46px; width: 100%; border-radius: 12px; border: 1px solid #e5e5e5; background: white; padding: 0 12px; outline: none; font-size: 14px; }
        .form-input:focus { border-color: #ff5a1f; box-shadow: 0 0 0 4px rgba(255,90,31,.08); }
      `}</style>
    </div>
  );
}

function SummaryLine({ label, value, tone, strong }: { label: string; value: string; tone?: "green" | "red"; strong?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 ${strong ? "font-black" : ""}`}><span className="text-neutral-700">{label}</span><span className={`${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-neutral-950"} font-black`}>{value}</span></div>;
}

function FilterPill({ label, active }: { label: string; active?: boolean }) {
  return <button className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${active ? "bg-orange-50 text-orange-600" : "text-neutral-500 hover:bg-neutral-50"}`}>{label}</button>;
}

function MobileNavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Home; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`flex min-w-[54px] flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-[#ff5a1f]" : "text-neutral-500"}`}><Icon className="h-4 w-4" strokeWidth={1.9} />{label}</button>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-neutral-700"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-neutral-500">{label}</span><span className="text-right font-bold text-neutral-800">{value}</span></div>;
}
