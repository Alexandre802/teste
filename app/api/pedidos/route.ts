import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseConfigurado,
} from "@/lib/supabase/config";
import { FORMA_SITE_PARA_BANCO } from "@/lib/admin/tipos";

/**
 * Registro do pedido do site no fluxo de caixa.
 *
 * O navegador manda APENAS product_id, quantidade e as opções escolhidas.
 * Preço, adicionais, custo, taxa de entrega e total são recalculados dentro
 * de comida_caseira_create_order, no banco. Nada do que o navegador diz sobre
 * dinheiro chega perto do que é gravado.
 *
 * A chave anônima basta: a função é SECURITY DEFINER e é a única coisa que o
 * papel anon pode executar. Chave de serviço aqui seria munição desnecessária.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ItemEntrada = {
  product_id?: unknown;
  quantity?: unknown;
  option_ids?: unknown;
  observacao?: unknown;
};

type Entrada = {
  checkout_token?: unknown;
  customer_name?: unknown;
  customer_phone?: unknown;
  order_type?: unknown;
  payment_method?: unknown;
  items?: unknown;
  address?: unknown;
  notes?: unknown;
  troco_para_cents?: unknown;
};

const texto = (valor: unknown, limite: number) =>
  typeof valor === "string" ? valor.slice(0, limite) : "";

export async function POST(request: Request) {
  if (!supabaseConfigurado) {
    // Sem banco configurado o site simplesmente não tem caixa ainda. Quem
    // chamou trata isso seguindo pelo WhatsApp, sem pedido registrado.
    return NextResponse.json(
      { erro: "fluxo_de_caixa_desligado" },
      { status: 503 },
    );
  }

  let corpo: Entrada;
  try {
    corpo = (await request.json()) as Entrada;
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const token = texto(corpo.checkout_token, 100).trim();
  if (!token) {
    return NextResponse.json(
      { erro: "Pedido sem identificação. Recarregue a página." },
      { status: 400 },
    );
  }

  const formaSite = texto(corpo.payment_method, 20) as
    keyof typeof FORMA_SITE_PARA_BANCO;
  const formaBanco = FORMA_SITE_PARA_BANCO[formaSite];
  if (!formaBanco) {
    return NextResponse.json(
      { erro: "Forma de pagamento inválida." },
      { status: 400 },
    );
  }

  const tipo = texto(corpo.order_type, 20);
  if (tipo !== "delivery" && tipo !== "pickup") {
    return NextResponse.json(
      { erro: "Escolha entre entrega e retirada." },
      { status: 400 },
    );
  }

  if (!Array.isArray(corpo.items) || corpo.items.length === 0) {
    return NextResponse.json({ erro: "O pedido está vazio." }, { status: 400 });
  }

  // Só passamos adiante o que é identificação: id, quantidade e opções.
  const itens = (corpo.items as ItemEntrada[]).slice(0, 60).map((item) => ({
    product_id: texto(item.product_id, 80),
    quantity: Math.trunc(Number(item.quantity) || 0),
    option_ids: Array.isArray(item.option_ids)
      ? item.option_ids.slice(0, 20).map((id) => texto(id, 80))
      : [],
    observacao: texto(item.observacao, 280),
  }));

  const trocoBruto = Number(corpo.troco_para_cents);
  const troco =
    formaBanco === "cash" && Number.isFinite(trocoBruto) && trocoBruto > 0
      ? Math.trunc(trocoBruto)
      : null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("comida_caseira_create_order", {
    p_checkout_token: token,
    p_customer_name: texto(corpo.customer_name, 120),
    p_customer_phone: texto(corpo.customer_phone, 40),
    p_order_type: tipo,
    p_payment_method: formaBanco,
    p_items: itens,
    p_address:
      tipo === "delivery" && corpo.address && typeof corpo.address === "object"
        ? corpo.address
        : null,
    p_notes: texto(corpo.notes, 500),
    p_troco_para_cents: troco,
  });

  if (error) {
    // 22023 é a validação da própria função: a mensagem foi escrita para o
    // cliente ler. Qualquer outro erro é problema nosso, e não vira texto
    // técnico na tela de quem só quer almoçar.
    const doCliente = error.code === "22023" || error.code === "P0001";
    return NextResponse.json(
      {
        erro: doCliente
          ? error.message
          : "Não foi possível registrar seu pedido. Tente novamente.",
      },
      { status: doCliente ? 400 : 502 },
    );
  }

  return NextResponse.json(data);
}
