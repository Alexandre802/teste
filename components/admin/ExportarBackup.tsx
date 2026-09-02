'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  carregarDespesas,
  carregarLancamentos,
  carregarPedidos,
} from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { dataHora, isoDia } from '@/lib/admin/datas';
import {
  FORMA_PAGAMENTO,
  STATUS_PAGAMENTO,
  STATUS_PEDIDO,
  TIPO_LANCAMENTO,
  TIPO_PEDIDO,
} from '@/lib/admin/rotulos';
import { useSupabase } from './SessaoProvider';
import { Botao } from './ui/Botao';
import { Aviso } from './ui/Estados';

/**
 * Backup: leva os dados embora em CSV.
 *
 * O que NÃO existe nesta tela, de propósito: botão de apagar banco. Um botão
 * desses num sistema financeiro só serve para ser tocado sem querer.
 *
 * Isto é exportação, não substituto de backup: os dados continuam guardados
 * no Supabase, que tem o backup automático dele. Aqui é para levar para o
 * contador, abrir no Excel ou guardar fora do sistema.
 */
export default function ExportarBackup() {
  const supabase = useSupabase();
  const [exportando, setExportando] = useState('');
  const [aviso, setAviso] = useState('');

  const exportar = async (qual: 'pedidos' | 'receitas' | 'despesas') => {
    if (exportando) return;
    setExportando(qual);
    setAviso('');

    try {
      if (qual === 'pedidos') {
        const pedidos = await carregarPedidos(supabase, { limite: 5000 });
        baixarCsv(
          `backup-pedidos-${isoDia()}`,
          paraCsv(
            ['Pedido', 'Data', 'Cliente', 'Telefone', 'Tipo', 'Pagamento', 'Situação', 'Status', 'Subtotal', 'Entrega', 'Total'],
            pedidos.map((p) => [
              p.order_number,
              dataHora(p.created_at),
              p.customer_name,
              p.customer_phone,
              TIPO_PEDIDO[p.order_type],
              FORMA_PAGAMENTO[p.payment_method],
              STATUS_PAGAMENTO[p.payment_status].rotulo,
              STATUS_PEDIDO[p.status].rotulo,
              reaisSemSimbolo(p.subtotal_cents),
              reaisSemSimbolo(p.delivery_fee_cents),
              reaisSemSimbolo(p.total_cents),
            ]),
          ),
        );
      }

      if (qual === 'receitas') {
        const lancamentos = await carregarLancamentos(supabase);
        baixarCsv(
          `backup-receitas-${isoDia()}`,
          paraCsv(
            ['Data', 'Tipo', 'Descrição', 'Forma de pagamento', 'Valor', 'Observação'],
            lancamentos.map((l) => [
              dataHora(l.occurred_at),
              TIPO_LANCAMENTO[l.kind],
              l.description,
              FORMA_PAGAMENTO[l.method],
              reaisSemSimbolo(l.amount_cents),
              l.notes,
            ]),
          ),
        );
      }

      if (qual === 'despesas') {
        const despesas = await carregarDespesas(supabase);
        baixarCsv(
          `backup-despesas-${isoDia()}`,
          paraCsv(
            ['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Forma de pagamento', 'Valor'],
            despesas.map((d) => [
              dataHora(d.occurred_at),
              d.categoria?.name ?? 'Sem categoria',
              d.description,
              d.supplier,
              FORMA_PAGAMENTO[d.method],
              reaisSemSimbolo(d.amount_cents),
            ]),
          ),
        );
      }
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não foi possível exportar.');
    } finally {
      setExportando('');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
        Baixa o histórico em CSV, no formato que o Excel em português abre direto. Os dados
        continuam guardados no Supabase — isto é uma cópia para levar, não uma mudança no sistema.
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['pedidos', 'Pedidos'],
            ['receitas', 'Receitas'],
            ['despesas', 'Despesas'],
          ] as const
        ).map(([id, rotulo]) => (
          <Botao
            key={id}
            variante="secundario"
            tamanho="sm"
            carregando={exportando === id}
            textoCarregando="Gerando…"
            onClick={() => void exportar(id)}
          >
            <Download className="h-4 w-4" aria-hidden />
            {rotulo}
          </Botao>
        ))}
      </div>

      {aviso && <Aviso tipo="erro">{aviso}</Aviso>}
    </div>
  );
}
