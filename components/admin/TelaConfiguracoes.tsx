"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";

import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { salvarDadosDaCasa, salvarZona } from "@/lib/admin/acoes";
import { formatarCentavos, lerCentavos, mascaraCentavos } from "@/lib/dinheiro";
import type { PapelUsuario, ZonaEntrega } from "@/lib/admin/tipos";

const ROTULO_PAPEL: Record<PapelUsuario, string> = {
  owner: "Proprietária",
  manager: "Gerente",
  cashier: "Caixa",
};

export function TelaConfiguracoes({
  dados,
  zonas,
  papel,
  nome,
  email,
}: {
  dados: {
    telefone: string;
    whatsapp: string;
    instagram: string;
    endereco: string;
    som_novo_pedido: boolean;
  };
  zonas: ZonaEntrega[];
  papel: PapelUsuario;
  nome: string;
  email: string;
}) {
  const router = useRouter();
  const [campos, setCampos] = useState(dados);
  const podeEditar = papel === "owner" || papel === "manager";

  return (
    <div className="space-y-4">
      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Dados da empresa
        </h2>
        <div className="mb-4 flex items-start gap-2 rounded-carta border border-laranja/25 bg-creme px-4 py-3">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-laranja-queimado"
            aria-hidden="true"
          />
          <p className="text-[12px] leading-relaxed text-laranja-queimado">
            <strong>Atenção:</strong> o que você salva aqui é o registro do
            painel. O site público lê estes mesmos dados das variáveis de
            ambiente <code>NEXT_PUBLIC_WHATSAPP</code>,{" "}
            <code>NEXT_PUBLIC_INSTAGRAM</code> e{" "}
            <code>NEXT_PUBLIC_ENDERECO</code>. Para mudar o que o cliente vê,
            altere também lá — enquanto estiverem vazias, o site escreve
            “Informação a cadastrar”. As taxas de entrega, logo abaixo, são
            diferentes: aquelas valem para os dois lados de uma vez.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["telefone", "Telefone"],
              ["whatsapp", "WhatsApp (só dígitos, com DDI e DDD)"],
              ["instagram", "Instagram (sem @)"],
              ["endereco", "Endereço"],
            ] as const
          ).map(([chave, rotulo]) => (
            <div key={chave} className={chave === "endereco" ? "sm:col-span-2" : ""}>
              <label
                htmlFor={`config-${chave}`}
                className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
              >
                {rotulo}
              </label>
              <input
                id={`config-${chave}`}
                value={campos[chave]}
                disabled={!podeEditar}
                onChange={(evento) =>
                  setCampos({ ...campos, [chave]: evento.target.value })
                }
                className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px] disabled:bg-nevoa"
              />
            </div>
          ))}
        </div>

        <label className="mt-4 flex min-h-[52px] cursor-pointer items-center gap-3 rounded-carta border border-borda px-4">
          <input
            type="checkbox"
            checked={campos.som_novo_pedido}
            disabled={!podeEditar}
            onChange={(evento) =>
              setCampos({ ...campos, som_novo_pedido: evento.target.checked })
            }
            className="h-5 w-5 accent-[#e75c16]"
          />
          <span className="text-[15px] text-tinta">
            Som ao chegar pedido novo
          </span>
        </label>
        <p className="mt-1.5 flex items-start gap-2 text-[12px] leading-relaxed text-tinta-suave">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          O navegador só deixa tocar som depois que você interage com a página.
          Por isso, no primeiro pedido do dia o painel pede uma confirmação
          antes de começar a apitar.
        </p>

        {podeEditar && (
          <div className="mt-4">
            <BotaoAcao
              acao={() => salvarDadosDaCasa(campos)}
              aoTerminar={(resultado) => resultado.ok && router.refresh()}
            >
              Salvar dados da empresa
            </BotaoAcao>
          </div>
        )}
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Taxas de entrega
        </h2>
        <p className="mb-4 text-[12px] leading-relaxed text-tinta-suave">
          É esta a taxa que o site mostra e que o servidor cobra ao gravar o
          pedido — não existe uma segunda tabela em lugar nenhum. Enquanto
          estiver em branco, o site escreve “a combinar no WhatsApp”.
        </p>

        <ul className="space-y-3">
          {zonas.map((zona) => (
            <LinhaZona key={zona.id} zona={zona} podeEditar={podeEditar} />
          ))}
        </ul>
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
          Seu acesso
        </h2>
        <dl className="mt-3 space-y-1.5 text-[14px]">
          <div className="flex gap-2">
            <dt className="text-tinta-media">Nome:</dt>
            <dd className="font-semibold text-tinta">{nome}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-tinta-media">E-mail:</dt>
            <dd className="font-semibold text-tinta">{email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-tinta-media">Papel:</dt>
            <dd className="font-semibold text-tinta">{ROTULO_PAPEL[papel]}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] leading-relaxed text-tinta-suave">
          Novos usuários são criados pela proprietária no Supabase e liberados
          na tabela <code>comida_caseira_users</code>. Não existe cadastro
          aberto: qualquer pessoa poderia criar conta e ver o financeiro.
        </p>
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <h2 className="fonte-titulo text-[16px] font-bold text-tinta">Backup</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-tinta-media">
          Os dados ficam no Supabase, que já faz cópia de segurança. Para ter
          uma cópia sua, use o botão “Exportar CSV” nas telas de Pedidos,
          Receitas e Despesas. Não existe botão de apagar banco aqui — e não vai
          existir.
        </p>
      </section>
    </div>
  );
}

function LinhaZona({
  zona,
  podeEditar,
}: {
  zona: ZonaEntrega;
  podeEditar: boolean;
}) {
  const router = useRouter();
  const [taxa, setTaxa] = useState(
    zona.fee_cents === null ? "" : formatarCentavos(zona.fee_cents),
  );
  const [minimo, setMinimo] = useState(
    zona.pedido_minimo_cents === null
      ? ""
      : formatarCentavos(zona.pedido_minimo_cents),
  );
  const [prazo, setPrazo] = useState(
    zona.prazo_minutos === null ? "" : String(zona.prazo_minutos),
  );

  return (
    <li className="rounded-carta border border-borda p-3">
      <p className="text-[15px] font-bold text-tinta">
        {zona.cidade}
        {zona.bairro && (
          <span className="font-normal text-tinta-media"> · {zona.bairro}</span>
        )}
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <Campo
          id={`taxa-${zona.id}`}
          rotulo="Taxa"
          valor={taxa}
          aoMudar={(v) => setTaxa(mascaraCentavos(v))}
          desabilitado={!podeEditar}
        />
        <Campo
          id={`minimo-${zona.id}`}
          rotulo="Pedido mínimo"
          valor={minimo}
          aoMudar={(v) => setMinimo(mascaraCentavos(v))}
          desabilitado={!podeEditar}
        />
        <Campo
          id={`prazo-${zona.id}`}
          rotulo="Prazo (min)"
          valor={prazo}
          aoMudar={(v) => setPrazo(v.replace(/\D/g, "").slice(0, 3))}
          desabilitado={!podeEditar}
          largura="w-24"
        />

        {podeEditar && (
          <BotaoAcao
            variante="secundario"
            acao={() =>
              salvarZona(zona.id, {
                fee_cents: taxa.trim() ? lerCentavos(taxa) : null,
                pedido_minimo_cents: minimo.trim() ? lerCentavos(minimo) : null,
                prazo_minutos: prazo.trim() ? Number(prazo) : null,
              })
            }
            aoTerminar={(resultado) => resultado.ok && router.refresh()}
          >
            Salvar
          </BotaoAcao>
        )}
      </div>
    </li>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  aoMudar,
  desabilitado,
  largura = "w-32",
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  desabilitado: boolean;
  largura?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[12px] font-semibold text-tinta-media"
      >
        {rotulo}
      </label>
      <input
        id={id}
        inputMode="numeric"
        placeholder="a combinar"
        value={valor}
        disabled={desabilitado}
        onChange={(evento) => aoMudar(evento.target.value)}
        className={`min-h-[48px] rounded-carta border border-borda px-3 text-[15px] disabled:bg-nevoa ${largura}`}
      />
    </div>
  );
}
