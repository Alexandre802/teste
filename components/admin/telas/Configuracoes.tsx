'use client';

import { useState } from 'react';
import {
  Bell,
  Building2,
  Database,
  Info,
  LogOut,
  Tags,
  Truck,
  Users as UsersIcon,
} from 'lucide-react';
import {
  apagarAreaEntrega,
  carregarAreasEntrega,
  carregarCategorias,
  carregarConfiguracao,
  carregarUsuarios,
  salvarAreaEntrega,
  salvarConfiguracao,
} from '@/lib/admin/consultas';
import { lerCentavos, reais } from '@/lib/admin/dinheiro';
import { PAPEL } from '@/lib/admin/rotulos';
import type { AreaEntrega } from '@/lib/admin/tipos';
import TituloPagina from '../TituloPagina';
import { useSessao, useSupabase } from '../SessaoProvider';
import { useAoVivo } from '../PedidosAoVivo';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Aviso, Erro, Esqueleto, Vazio } from '../ui/Estados';
import { Modal } from '../ui/Modal';
import { CampoDinheiro } from '../formularios/CampoDinheiro';
import ExportarBackup from '../ExportarBackup';

/**
 * Configurações.
 *
 * Uma seção por assunto, em acordeão: no celular, nove blocos abertos viram
 * uma página de rolagem infinita onde nada se acha.
 *
 * Os dados da empresa começam VAZIOS. Nada aqui é preenchido com valor de
 * exemplo — telefone e endereço de exemplo têm o hábito de sobreviver até a
 * publicação e virar propaganda de um número que não existe.
 */

interface DadosEmpresa {
  nome: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  horarios: string;
}

const EMPRESA_VAZIA: DadosEmpresa = {
  nome: '',
  telefone: '',
  whatsapp: '',
  instagram: '',
  endereco: '',
  horarios: '',
};

type Secao = 'empresa' | 'entrega' | 'categorias' | 'usuarios' | 'notificacoes' | 'backup' | 'sobre';

export default function Configuracoes() {
  const { perfil, sair } = useSessao();
  const [aberta, setAberta] = useState<Secao | null>('empresa');

  const alternar = (secao: Secao) => setAberta((atual) => (atual === secao ? null : secao));

  return (
    <>
      <TituloPagina titulo="Configurações" />

      <div className="flex flex-col gap-2">
        <Secao
          id="empresa"
          titulo="Dados da empresa"
          icone={Building2}
          aberta={aberta === 'empresa'}
          aoAlternar={alternar}
        >
          <FormularioEmpresa />
        </Secao>

        <Secao
          id="entrega"
          titulo="Taxas de entrega"
          icone={Truck}
          aberta={aberta === 'entrega'}
          aoAlternar={alternar}
        >
          <AreasEntrega />
        </Secao>

        <Secao
          id="categorias"
          titulo="Categorias de despesas"
          icone={Tags}
          aberta={aberta === 'categorias'}
          aoAlternar={alternar}
        >
          <ListaCategorias />
        </Secao>

        {perfil?.role === 'owner' && (
          <Secao
            id="usuarios"
            titulo="Usuários"
            icone={UsersIcon}
            aberta={aberta === 'usuarios'}
            aoAlternar={alternar}
          >
            <ListaUsuarios />
          </Secao>
        )}

        <Secao
          id="notificacoes"
          titulo="Notificações"
          icone={Bell}
          aberta={aberta === 'notificacoes'}
          aoAlternar={alternar}
        >
          <Notificacoes />
        </Secao>

        <Secao
          id="backup"
          titulo="Backup"
          icone={Database}
          aberta={aberta === 'backup'}
          aoAlternar={alternar}
        >
          <ExportarBackup />
        </Secao>

        <Secao
          id="sobre"
          titulo="Sobre o sistema"
          icone={Info}
          aberta={aberta === 'sobre'}
          aoAlternar={alternar}
        >
          <Sobre />
        </Secao>

        <button
          type="button"
          onClick={() => void sair()}
          className="admin-card flex items-center gap-3 px-4 py-3.5 text-left font-semibold text-[var(--admin-vermelho)] transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Sair do sistema
        </button>
      </div>
    </>
  );
}

function Secao({
  id,
  titulo,
  icone: Icone,
  aberta,
  aoAlternar,
  children,
}: {
  id: Secao;
  titulo: string;
  icone: typeof Building2;
  aberta: boolean;
  aoAlternar: (s: Secao) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card overflow-hidden">
      <button
        type="button"
        onClick={() => aoAlternar(id)}
        aria-expanded={aberta}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
        <Icone className="h-5 w-5 shrink-0 text-[var(--admin-tinta-suave)]" aria-hidden />
        <span className="flex-1 font-semibold text-[var(--admin-tinta)]">{titulo}</span>
        <span aria-hidden className="text-[var(--admin-tinta-suave)]">
          {aberta ? '−' : '+'}
        </span>
      </button>
      {aberta && <div className="border-t border-[var(--admin-borda)] px-4 py-4">{children}</div>}
    </div>
  );
}

/* ─────────────────────────── dados da empresa ─────────────────────────── */

function FormularioEmpresa() {
  const guardados = useConsulta<DadosEmpresa | null>(
    (sb) => carregarConfiguracao<DadosEmpresa>(sb, 'empresa'),
    [],
  );

  if (guardados.carregando) return <Esqueleto className="h-48" />;
  if (guardados.erro) return <Erro mensagem={guardados.erro} aoTentarDeNovo={guardados.recarregar} />;

  // O formulário só monta com os dados em mãos, e inicia o estado a partir
  // deles. Copiar o que veio do banco para dentro do estado por um efeito
  // renderizaria uma vez com os campos vazios — e quem digitasse rápido
  // perderia o que escreveu quando a resposta chegasse.
  return <CamposEmpresa iniciais={{ ...EMPRESA_VAZIA, ...(guardados.dados ?? {}) }} />;
}

function CamposEmpresa({ iniciais }: { iniciais: DadosEmpresa }) {
  const supabase = useSupabase();
  const [dados, setDados] = useState<DadosEmpresa>(iniciais);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setAviso('');
    try {
      await salvarConfiguracao(supabase, 'empresa', dados);
      setAviso('Dados salvos.');
    } catch (err) {
      setAviso(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const campos: { chave: keyof DadosEmpresa; rotulo: string; dica?: string }[] = [
    { chave: 'nome', rotulo: 'Nome' },
    { chave: 'telefone', rotulo: 'Telefone' },
    { chave: 'whatsapp', rotulo: 'WhatsApp' },
    { chave: 'instagram', rotulo: 'Instagram' },
    { chave: 'endereco', rotulo: 'Endereço' },
    { chave: 'horarios', rotulo: 'Horários', dica: 'Ex.: seg a sáb, 11h às 15h' },
  ];

  return (
    <form onSubmit={salvar} className="flex flex-col gap-4">
      <p className="text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
        Preencha só o que estiver confirmado. Campo vazio some da tela; campo com dado inventado
        vira propaganda de um telefone que não atende.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map(({ chave, rotulo, dica }) => (
          <div key={chave}>
            <label htmlFor={`empresa-${chave}`} className="admin-rotulo">
              {rotulo}
            </label>
            <input
              id={`empresa-${chave}`}
              value={dados[chave]}
              onChange={(e) => setDados((d) => ({ ...d, [chave]: e.target.value }))}
              maxLength={160}
              placeholder={dica}
              className="admin-campo"
            />
          </div>
        ))}
      </div>

      {aviso && <Aviso tipo={aviso === 'Dados salvos.' ? 'sucesso' : 'erro'}>{aviso}</Aviso>}

      <div>
        <Botao type="submit" carregando={salvando} textoCarregando="Salvando…">
          Salvar dados
        </Botao>
      </div>
    </form>
  );
}

/* ─────────────────────────── áreas de entrega ─────────────────────────── */

function AreasEntrega() {
  const supabase = useSupabase();
  const [recarga, setRecarga] = useState(0);
  const [emEdicao, setEmEdicao] = useState<Partial<AreaEntrega> | null>(null);
  const [taxa, setTaxa] = useState('');
  const [minimo, setMinimo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const areas = useConsulta(carregarAreasEntrega, [recarga]);

  const abrir = (area?: AreaEntrega) => {
    setEmEdicao(area ?? { city: '', district: '', active: true, sort_order: 0 });
    setTaxa(area ? (area.fee_cents / 100).toFixed(2).replace('.', ',') : '');
    setMinimo(area && area.min_order_cents ? (area.min_order_cents / 100).toFixed(2).replace('.', ',') : '');
    setErroAcao('');
  };

  const salvar = async () => {
    if (!emEdicao || salvando) return;
    setSalvando(true);
    setErroAcao('');
    try {
      await salvarAreaEntrega(supabase, {
        ...emEdicao,
        // bairro em branco vira a regra coringa da cidade
        district: emEdicao.district?.trim() ? emEdicao.district.trim() : null,
        fee_cents: lerCentavos(taxa) ?? 0,
        min_order_cents: lerCentavos(minimo) ?? 0,
      });
      setEmEdicao(null);
      setRecarga((r) => r + 1);
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    try {
      await apagarAreaEntrega(supabase, id);
      setRecarga((r) => r + 1);
    } catch {
      // a lista continua como está; o erro aparece na próxima tentativa
    }
  };

  if (areas.carregando) return <Esqueleto className="h-32" />;
  if (areas.erro) return <Erro mensagem={areas.erro} aoTentarDeNovo={areas.recarregar} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
        Esta é a <strong>única</strong> fonte da taxa de entrega: o site cobra o que estiver aqui e
        o servidor recalcula por esta mesma tabela ao fechar o pedido. Não existe uma segunda taxa
        escondida no código. Bairro em branco vale como regra geral da cidade.
      </p>

      {!areas.dados || areas.dados.length === 0 ? (
        <Vazio
          titulo="Nenhuma área cadastrada"
          descricao="Sem área cadastrada, o site não mostra taxa de entrega nenhuma e o pedido sai só com o valor dos itens."
        />
      ) : (
        <ul className="divide-y divide-[var(--admin-borda)] rounded-xl border border-[var(--admin-borda)]">
          {areas.dados.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--admin-tinta)]">
                  {a.district || `${a.city || 'Toda a cidade'} — regra geral`}
                </p>
                <p className="text-xs text-[var(--admin-tinta-suave)]">
                  Taxa {reais(a.fee_cents)}
                  {a.min_order_cents > 0 ? ` · mínimo ${reais(a.min_order_cents)}` : ''}
                  {a.active ? '' : ' · desativada'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => abrir(a)}
                className="shrink-0 text-xs font-bold text-[var(--admin-laranja)] hover:underline"
              >
                editar
              </button>
              <button
                type="button"
                onClick={() => void remover(a.id)}
                className="shrink-0 text-xs font-bold text-[var(--admin-vermelho)] hover:underline"
              >
                remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Botao variante="secundario" tamanho="sm" onClick={() => abrir()}>
          Adicionar área
        </Botao>
      </div>

      <Modal
        aberto={emEdicao !== null}
        aoFechar={() => setEmEdicao(null)}
        titulo={emEdicao?.id ? 'Editar área' : 'Nova área de entrega'}
        largura="sm"
        fecharAoClicarFora={false}
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setEmEdicao(null)}>
              Cancelar
            </Botao>
            <Botao
              className="flex-1"
              carregando={salvando}
              textoCarregando="Salvando…"
              onClick={() => void salvar()}
            >
              Salvar
            </Botao>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="area-cidade" className="admin-rotulo">
              Cidade
            </label>
            <input
              id="area-cidade"
              value={emEdicao?.city ?? ''}
              onChange={(e) => setEmEdicao((a) => ({ ...a, city: e.target.value }))}
              maxLength={80}
              className="admin-campo"
            />
          </div>
          <div>
            <label htmlFor="area-bairro" className="admin-rotulo">
              Bairro{' '}
              <span className="font-normal text-[var(--admin-tinta-suave)]">
                (em branco = toda a cidade)
              </span>
            </label>
            <input
              id="area-bairro"
              value={emEdicao?.district ?? ''}
              onChange={(e) => setEmEdicao((a) => ({ ...a, district: e.target.value }))}
              maxLength={80}
              className="admin-campo"
            />
          </div>
          <CampoDinheiro id="area-taxa" rotulo="Taxa de entrega" valor={taxa} aoMudar={setTaxa} />
          <CampoDinheiro
            id="area-minimo"
            rotulo="Pedido mínimo (0 = sem mínimo)"
            valor={minimo}
            aoMudar={setMinimo}
          />
          {erroAcao && <Aviso tipo="erro">{erroAcao}</Aviso>}
        </div>
      </Modal>
    </div>
  );
}

/* ─────────────────────────── categorias ─────────────────────────── */

function ListaCategorias() {
  const categorias = useConsulta(carregarCategorias, []);

  if (categorias.carregando) return <Esqueleto className="h-24" />;
  if (categorias.erro) return <Erro mensagem={categorias.erro} aoTentarDeNovo={categorias.recarregar} />;

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--admin-tinta-suave)]">
        Categorias usadas ao lançar despesa.
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {(categorias.dados ?? []).map((c) => (
          <li
            key={c.id}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-[var(--admin-tinta)]"
          >
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── usuários ─────────────────────────── */

function ListaUsuarios() {
  const usuarios = useConsulta(carregarUsuarios, []);

  if (usuarios.carregando) return <Esqueleto className="h-24" />;
  if (usuarios.erro) return <Erro mensagem={usuarios.erro} aoTentarDeNovo={usuarios.recarregar} />;

  return (
    <div>
      <ul className="divide-y divide-[var(--admin-borda)] rounded-xl border border-[var(--admin-borda)]">
        {(usuarios.dados ?? []).map((u) => (
          <li key={u.user_id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--admin-tinta)]">
                {u.name || u.email}
              </p>
              <p className="truncate text-xs text-[var(--admin-tinta-suave)]">{u.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[var(--admin-tinta-suave)]">
              {PAPEL[u.role]}
            </span>
            {!u.active && (
              <span className="shrink-0 text-xs text-[var(--admin-vermelho)]">desativado</span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
        Não existe cadastro público de administrador. Para incluir alguém: crie o usuário no painel
        do Supabase (Authentication → Add user) e ligue-o à casa pela instrução que está no fim de{' '}
        <code className="rounded bg-slate-100 px-1">
          supabase/migrations/0006_comida_caseira_dados_iniciais.sql
        </code>
        .
      </p>
    </div>
  );
}

/* ─────────────────────────── notificações ─────────────────────────── */

function Notificacoes() {
  const { somLigado, alternarSom, conectado } = useAoVivo();

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={somLigado}
          onChange={(e) => alternarSom(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--admin-laranja)]"
        />
        <span>
          <span className="block font-medium text-[var(--admin-tinta)]">Som de novo pedido</span>
          <span className="block text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
            Toca um aviso curto quando entra pedido. O navegador só libera som depois do primeiro
            toque na tela — se o painel acabou de abrir, toque em qualquer lugar uma vez.
          </span>
        </span>
      </label>

      <p className="text-xs text-[var(--admin-tinta-suave)]">
        Esta preferência vale só <strong>neste aparelho</strong>. O tablet da cozinha pode apitar
        enquanto o seu celular fica em silêncio.
      </p>

      <p className="text-xs text-[var(--admin-tinta-suave)]">
        Atualização em tempo real:{' '}
        <strong className={conectado ? 'text-[var(--admin-verde)]' : 'text-[var(--admin-vermelho)]'}>
          {conectado ? 'conectada' : 'desconectada'}
        </strong>
        . Quando desconecta, os pedidos aparecem ao recarregar a tela.
      </p>
    </div>
  );
}

/* ─────────────────────────── sobre ─────────────────────────── */

function Sobre() {
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--admin-tinta-suave)]">
      <p>
        Fluxo de caixa integrado ao site de pedidos. Todo pedido finalizado no site é registrado
        automaticamente aqui, como <strong>a receber</strong>, antes de o WhatsApp abrir.
      </p>
      <p>
        Valores em centavos, fuso de São Paulo, e nenhum número inventado: campo sem dado
        confirmado fica vazio em vez de mostrar exemplo.
      </p>
      <p>
        Os dados ficam no Supabase, com acesso restrito por RLS — cliente do site não consegue ler
        pedido, caixa, despesa nem custo.
      </p>
    </div>
  );
}
