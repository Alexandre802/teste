'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, StickyNote } from 'lucide-react';
import {
  carregarPedido,
  estornarPedido,
  marcarPedidoPago,
  mudarStatusPedido,
} from '@/lib/admin/consultas';
import { reais } from '@/lib/admin/dinheiro';
import { dataHora } from '@/lib/admin/datas';
import {
  FORMAS_EM_ORDEM,
  FORMA_PAGAMENTO,
  STATUS_PAGAMENTO,
  STATUS_PEDIDO,
  TIPO_PEDIDO,
  proximosStatus,
} from '@/lib/admin/rotulos';
import type { FormaPagamentoDb, PedidoComItens, StatusPedido } from '@/lib/admin/tipos';
import { useSupabase } from '../SessaoProvider';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao, CabecalhoCartao } from '../ui/Cartao';
import { Aviso, Erro, Esqueleto } from '../ui/Estados';
import { Modal } from '../ui/Modal';
import { Pilula } from '../ui/Pilula';

/**
 * Detalhe do pedido — e o lugar onde o dinheiro muda de estado.
 *
 * "Marcar como pago" é a única porta que transforma pedido em recebimento, e
 * quem faz isso é a função do banco, que cria o lançamento na mesma transação.
 * Se essa ação existisse em duas telas, uma delas acabaria esquecendo o
 * lançamento e o faturamento passaria a divergir do caixa.
 */
export default function DetalhePedido({ id }: { id: string }) {
  const supabase = useSupabase();
  const pedido = useConsulta<PedidoComItens>((sb) => carregarPedido(sb, id), [id]);

  const [agindo, setAgindo] = useState('');
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'pago' | 'cancelar' | 'estornar' | null>(null);
  const [formaPaga, setFormaPaga] = useState<FormaPagamentoDb>('cash');
  const [motivo, setMotivo] = useState('');

  const executar = async (nome: string, acao: () => Promise<void>) => {
    if (agindo) return;
    setAgindo(nome);
    setErro('');
    try {
      await acao();
      setModal(null);
      setMotivo('');
      pedido.recarregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível concluir a ação.');
    } finally {
      setAgindo('');
    }
  };

  if (pedido.carregando) {
    return (
      <div className="space-y-4">
        <Esqueleto className="h-8 w-40" />
        <Esqueleto className="h-40 rounded-2xl" />
        <Esqueleto className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (pedido.erro || !pedido.dados) {
    return (
      <>
        <Voltar />
        <Erro
          mensagem={pedido.erro || 'Pedido não encontrado.'}
          aoTentarDeNovo={pedido.recarregar}
        />
      </>
    );
  }

  const p = pedido.dados;
  const proximos = proximosStatus(p.status, p.order_type);
  const podeMarcarPago = p.payment_status === 'pending' && p.status !== 'cancelled';
  const podeEstornar = p.payment_status === 'paid';

  return (
    <>
      <Voltar />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--admin-tinta)] sm:text-2xl">
          Pedido #{p.order_number}
        </h1>
        <Pilula aparencia={STATUS_PEDIDO[p.status]} />
        <Pilula aparencia={STATUS_PAGAMENTO[p.payment_status]} />
      </div>

      {erro && (
        <div className="mb-4">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* ─────────────── informações ─────────────── */}
          <Cartao>
            <CabecalhoCartao titulo="Informações" />
            <dl className="grid gap-x-6 gap-y-3 border-t border-[var(--admin-borda)] px-4 py-4 sm:grid-cols-2 sm:px-5">
              <Info rotulo="Data e hora" valor={dataHora(p.created_at)} />
              <Info rotulo="Tipo de pedido" valor={TIPO_PEDIDO[p.order_type]} />
              <Info
                rotulo="Cliente"
                valor={p.customer_name || 'Cliente não identificado'}
              />
              <Info
                rotulo="Telefone"
                valor={
                  p.customer_phone ? (
                    <a
                      href={`tel:${p.customer_phone}`}
                      className="inline-flex items-center gap-1.5 text-[var(--admin-laranja)] hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {p.customer_phone}
                    </a>
                  ) : (
                    'Não informado'
                  )
                }
              />
              <Info rotulo="Forma de pagamento" valor={FORMA_PAGAMENTO[p.payment_method]} />
              <Info rotulo="Origem" valor={p.source === 'site' ? 'Site' : 'Lançamento manual'} />
              {p.change_for_cents !== null && (
                <Info
                  rotulo="Troco para"
                  valor={`${reais(p.change_for_cents)} (levar ${reais(
                    Math.max(0, p.change_for_cents - p.total_cents),
                  )})`}
                />
              )}
              {p.paid_at && <Info rotulo="Pago em" valor={dataHora(p.paid_at)} />}
              {p.cancelled_at && <Info rotulo="Cancelado em" valor={dataHora(p.cancelled_at)} />}
              {p.cancel_reason && <Info rotulo="Motivo do cancelamento" valor={p.cancel_reason} />}
            </dl>
          </Cartao>

          {/* ─────────────── endereço ─────────────── */}
          {p.order_type === 'delivery' && p.address && (
            <Cartao>
              <CabecalhoCartao titulo="Endereço de entrega" />
              <div className="flex gap-3 border-t border-[var(--admin-borda)] px-4 py-4 sm:px-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-tinta-suave)]" aria-hidden />
                <address className="text-sm not-italic leading-relaxed text-[var(--admin-tinta)]">
                  {p.address.rua}
                  {p.address.numero ? `, ${p.address.numero}` : ''}
                  {p.address.complemento && <br />}
                  {p.address.complemento}
                  <br />
                  {p.address.bairro}
                  {p.address.cidade ? ` — ${p.address.cidade}` : ''}
                  {p.address.cep && (
                    <>
                      <br />
                      CEP {p.address.cep}
                    </>
                  )}
                  {p.address.referencia && (
                    <>
                      <br />
                      <span className="text-[var(--admin-tinta-suave)]">
                        Referência: {p.address.referencia}
                      </span>
                    </>
                  )}
                </address>
              </div>
            </Cartao>
          )}

          {/* ─────────────── itens ─────────────── */}
          <Cartao>
            <CabecalhoCartao titulo="Itens do pedido" />
            <ul className="divide-y divide-[var(--admin-borda)] border-t border-[var(--admin-borda)]">
              {p.itens.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-3 sm:px-5">
                  <span className="shrink-0 font-bold text-[var(--admin-tinta-suave)]">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--admin-tinta)]">{item.product_name}</p>
                    {item.note && (
                      <p className="mt-0.5 text-xs text-[var(--admin-tinta-suave)]">
                        obs: {item.note}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-[var(--admin-tinta)]">
                    {reais(item.total_cents)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="border-t border-[var(--admin-borda)] px-4 py-3 sm:px-5">
              <Total rotulo="Subtotal" valor={reais(p.subtotal_cents)} />
              {p.order_type === 'delivery' && (
                <Total
                  rotulo="Entrega"
                  valor={p.delivery_fee_cents === 0 ? 'Grátis' : reais(p.delivery_fee_cents)}
                />
              )}
              {p.discount_cents > 0 && (
                <Total rotulo="Desconto" valor={`− ${reais(p.discount_cents)}`} />
              )}
              <Total rotulo="Total" valor={reais(p.total_cents)} destaque />
            </dl>
          </Cartao>

          {p.notes && (
            <Cartao>
              <CabecalhoCartao titulo="Observação do cliente" />
              <p className="flex gap-3 border-t border-[var(--admin-borda)] px-4 py-4 text-sm leading-relaxed text-[var(--admin-tinta)] sm:px-5">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-tinta-suave)]" aria-hidden />
                {p.notes}
              </p>
            </Cartao>
          )}
        </div>

        {/* ─────────────── ações ─────────────── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Cartao>
            <CabecalhoCartao titulo="Ações" />
            <div className="flex flex-col gap-2 border-t border-[var(--admin-borda)] px-4 py-4 sm:px-5">
              {podeMarcarPago && (
                <Botao variante="sucesso" onClick={() => setModal('pago')} disabled={Boolean(agindo)}>
                  Marcar como pago
                </Botao>
              )}

              {proximos
                .filter((s) => s !== 'cancelled')
                .map((s) => (
                  <Botao
                    key={s}
                    variante="secundario"
                    carregando={agindo === s}
                    textoCarregando="Salvando…"
                    onClick={() => void executar(s, () => mudarStatusPedido(supabase, p.id, s))}
                  >
                    {ROTULO_ACAO[s]}
                  </Botao>
                ))}

              {podeEstornar && (
                <Botao variante="secundario" onClick={() => setModal('estornar')} disabled={Boolean(agindo)}>
                  Registrar reembolso
                </Botao>
              )}

              {proximos.includes('cancelled') && (
                <Botao variante="perigo" onClick={() => setModal('cancelar')} disabled={Boolean(agindo)}>
                  Cancelar pedido
                </Botao>
              )}

              {proximos.length === 0 && !podeEstornar && (
                <p className="text-sm text-[var(--admin-tinta-suave)]">
                  Este pedido está finalizado. Não há mais ações disponíveis.
                </p>
              )}
            </div>
          </Cartao>
        </div>
      </div>

      {/* ─────────────── marcar como pago ─────────────── */}
      <Modal
        aberto={modal === 'pago'}
        aoFechar={() => setModal(null)}
        titulo="Marcar como pago"
        descricao={`Isso registra ${reais(p.total_cents)} como recebimento no caixa.`}
        largura="sm"
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setModal(null)}>
              Cancelar
            </Botao>
            <Botao
              variante="sucesso"
              className="flex-1"
              carregando={agindo === 'pago'}
              textoCarregando="Registrando…"
              onClick={() =>
                void executar('pago', () => marcarPedidoPago(supabase, p.id, formaPaga))
              }
            >
              Confirmar recebimento
            </Botao>
          </div>
        }
      >
        <label htmlFor="forma-paga" className="admin-rotulo">
          Como o cliente pagou?
        </label>
        <select
          id="forma-paga"
          value={formaPaga}
          onChange={(e) => setFormaPaga(e.target.value as FormaPagamentoDb)}
          className="admin-campo"
        >
          {FORMAS_EM_ORDEM.map((f) => (
            <option key={f} value={f}>
              {FORMA_PAGAMENTO[f]}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
          O cliente escolheu <strong>{FORMA_PAGAMENTO[p.payment_method]}</strong> no site. Se pagou
          de outro jeito, corrija aqui — é este valor que vai para o relatório de formas de
          pagamento.
        </p>
      </Modal>

      {/* ─────────────── cancelar ─────────────── */}
      <Modal
        aberto={modal === 'cancelar'}
        aoFechar={() => setModal(null)}
        titulo="Cancelar pedido"
        descricao="O pedido cancelado sai do faturamento e do valor a receber."
        largura="sm"
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setModal(null)}>
              Voltar
            </Botao>
            <Botao
              variante="perigo"
              className="flex-1"
              carregando={agindo === 'cancelar'}
              textoCarregando="Cancelando…"
              onClick={() =>
                void executar('cancelar', () =>
                  mudarStatusPedido(supabase, p.id, 'cancelled', motivo),
                )
              }
            >
              Cancelar pedido
            </Botao>
          </div>
        }
      >
        <label htmlFor="motivo-cancelar" className="admin-rotulo">
          Motivo <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
        </label>
        <input
          id="motivo-cancelar"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={300}
          placeholder="Ex.: cliente desistiu"
          className="admin-campo"
        />
        {p.payment_status === 'paid' && (
          <div className="mt-3">
            <Aviso tipo="info">
              Este pedido já está pago. O cancelamento não devolve o dinheiro sozinho — registre o
              reembolso separadamente para o caixa fechar.
            </Aviso>
          </div>
        )}
      </Modal>

      {/* ─────────────── estorno ─────────────── */}
      <Modal
        aberto={modal === 'estornar'}
        aoFechar={() => setModal(null)}
        titulo="Registrar reembolso"
        descricao={`Lança −${reais(p.total_cents)} no caixa, corrigindo o período.`}
        largura="sm"
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setModal(null)}>
              Voltar
            </Botao>
            <Botao
              variante="perigo"
              className="flex-1"
              carregando={agindo === 'estornar'}
              textoCarregando="Registrando…"
              onClick={() =>
                void executar('estornar', () => estornarPedido(supabase, p.id, motivo))
              }
            >
              Registrar reembolso
            </Botao>
          </div>
        }
      >
        <label htmlFor="motivo-estorno" className="admin-rotulo">
          Motivo <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
        </label>
        <input
          id="motivo-estorno"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={300}
          placeholder="Ex.: pedido devolvido"
          className="admin-campo"
        />
        <p className="mt-2 text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
          O recebimento original continua no histórico. O reembolso entra como lançamento negativo
          — assim dá para explicar o que aconteceu, em vez de o dinheiro simplesmente sumir do
          relatório.
        </p>
      </Modal>
    </>
  );
}

const ROTULO_ACAO: Record<StatusPedido, string> = {
  pending: 'Voltar para pendente',
  confirmed: 'Confirmar pedido',
  preparing: 'Marcar como preparando',
  out_for_delivery: 'Saiu para entrega',
  completed: 'Concluir pedido',
  cancelled: 'Cancelar pedido',
};

function Voltar() {
  return (
    <Link
      href="/admin/pedidos"
      className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-tinta-suave)] transition-colors hover:text-[var(--admin-tinta)]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Pedidos
    </Link>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--admin-tinta-suave)]">{rotulo}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[var(--admin-tinta)]">{valor}</dd>
    </div>
  );
}

function Total({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt
        className={
          destaque
            ? 'font-bold text-[var(--admin-tinta)]'
            : 'text-sm text-[var(--admin-tinta-suave)]'
        }
      >
        {rotulo}
      </dt>
      <dd
        className={`tabular-nums ${
          destaque
            ? 'text-lg font-extrabold text-[var(--admin-verde)]'
            : 'font-semibold text-[var(--admin-tinta)]'
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}
