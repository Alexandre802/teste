'use client';

import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { carregarClientes } from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { reais, reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { dia, isoDia } from '@/lib/admin/datas';
import { formatarTelefone } from '@/lib/whatsapp';
import TituloPagina from '../TituloPagina';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao } from '../ui/Cartao';
import { Erro, EsqueletoLista, Vazio } from '../ui/Estados';

/**
 * Clientes.
 *
 * A lista se monta sozinha a partir dos pedidos — não existe cadastro de
 * cliente para ninguém preencher. Guarda o mínimo: nome e telefone. Sem CPF,
 * sem e-mail, sem data de nascimento. O que não é coletado não vaza.
 *
 * Os totais vêm de uma view que soma na hora. Contador guardado em coluna
 * desanda no primeiro cancelamento e ninguém percebe.
 */
export default function Clientes() {
  const [busca, setBusca] = useState('');
  const clientes = useConsulta(carregarClientes, []);

  const termo = busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, '');
  const filtrados = (clientes.dados ?? []).filter((c) => {
    if (!termo) return true;
    if (c.name.toLowerCase().includes(termo)) return true;
    return digitos.length >= 3 && c.phone.replace(/\D/g, '').includes(digitos);
  });

  const exportar = () => {
    if (filtrados.length === 0) return;
    const csv = paraCsv(
      ['Nome', 'Telefone', 'Pedidos', 'Total pago', 'Total pedido', 'Último pedido'],
      filtrados.map((c) => [
        c.name,
        c.phone,
        c.orders_count,
        reaisSemSimbolo(c.paid_cents),
        reaisSemSimbolo(c.total_cents),
        c.last_order_at ? dia(c.last_order_at) : '',
      ]),
    );
    baixarCsv(`clientes-${isoDia()}`, csv);
  };

  return (
    <>
      <TituloPagina
        titulo="Clientes"
        descricao="Montada sozinha a partir dos pedidos do site"
        acao={
          <Botao
            variante="secundario"
            tamanho="sm"
            onClick={exportar}
            disabled={filtrados.length === 0}
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">CSV</span>
          </Botao>
        }
      />

      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <label htmlFor="busca-cliente" className="sr-only">
          Buscar cliente
        </label>
        <input
          id="busca-cliente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone…"
          className="admin-campo pl-9"
        />
      </div>

      {clientes.carregando ? (
        <EsqueletoLista linhas={6} />
      ) : clientes.erro ? (
        <Erro mensagem={clientes.erro} aoTentarDeNovo={clientes.recarregar} />
      ) : filtrados.length === 0 ? (
        <Cartao>
          <Vazio
            titulo={termo ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
            descricao={
              termo
                ? 'Confira o nome ou o telefone digitado.'
                : 'Quem fizer um pedido pelo site com telefone aparece aqui automaticamente.'
            }
          />
        </Cartao>
      ) : (
        <Cartao className="overflow-hidden">
          <div className="admin-rolagem-x">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--admin-borda)] bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--admin-tinta-suave)]">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Telefone</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Pedidos</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Total pago</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Último pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-borda)]">
                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[16rem] truncate px-4 py-2.5 font-medium text-[var(--admin-tinta)]">
                      {c.name || 'Sem nome'}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                      <a href={`tel:${c.phone}`} className="hover:text-[var(--admin-laranja)]">
                        {formatarTelefone(c.phone)}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.orders_count}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {reais(c.paid_cents)}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                      {c.last_order_at ? dia(c.last_order_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}
    </>
  );
}
