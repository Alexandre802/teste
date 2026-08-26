'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CampoLinha, Seletor } from '@/components/ui/CampoLinha';
import { Icone } from '@/components/ui/Icone';
import { PAGAMENTOS } from '@/lib/constants';
import { lerValor, moeda } from '@/lib/format';
import { useToasts } from '@/lib/hooks/use-toasts';
import type { NewHaircut, PaymentMethod, Service } from '@/lib/types';

interface Props {
  servicos: Service[];
  registrar: (novo: NewHaircut) => Promise<unknown>;
}

type Estado = 'parado' | 'enviando' | 'sucesso';

/**
 * "Registrar corte" — a tela que precisa ser mais rápida do app inteiro.
 *
 * Três toques e pronto: serviço, valor, pagamento. Data, horário e autor não
 * são digitados; saem da sessão e do relógio no momento de gravar.
 */
export function RegisterHaircutForm({ servicos, registrar }: Props) {
  const { mostrar } = useToasts();
  const [servicoId, setServicoId] = useState('');
  const [valor, setValor] = useState('');
  const [pagamento, setPagamento] = useState<PaymentMethod | ''>('');
  const [estado, setEstado] = useState<Estado>('parado');
  const [erros, setErros] = useState<{ servico?: string; valor?: string; pagamento?: string }>({});

  const servico = useMemo(
    () => servicos.find((s) => s.id === servicoId) ?? null,
    [servicos, servicoId],
  );

  /**
   * Troca de serviço. Se o catálogo tiver preço e o campo ainda estiver em
   * branco, sugere; se o funcionário já digitou algo, não encosta — reescrever
   * o valor por baixo de quem está digitando é pior que não sugerir nada.
   */
  const escolherServico = (id: string) => {
    setServicoId(id);
    setErros((e) => ({ ...e, servico: undefined }));
    const escolhido = servicos.find((s) => s.id === id);
    if (escolhido && escolhido.defaultPrice > 0 && valor.trim() === '') {
      setValor(escolhido.defaultPrice.toFixed(2).replace('.', ','));
    }
  };

  const limpar = () => {
    setServicoId('');
    setValor('');
    setPagamento('');
    setErros({});
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (estado !== 'parado') return;

    const preco = lerValor(valor);
    const novosErros: typeof erros = {};
    if (!servico) novosErros.servico = 'Escolha o serviço.';
    if (preco === null || preco <= 0) novosErros.valor = 'Informe o valor cobrado.';
    if (!pagamento) novosErros.pagamento = 'Escolha a forma de pagamento.';

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0 || !servico || preco === null || !pagamento) return;

    setEstado('enviando');
    try {
      await registrar({
        serviceId: servico.id.startsWith('local-') ? null : servico.id,
        serviceName: servico.name,
        price: preco,
        paymentMethod: pagamento,
      });
      setEstado('sucesso');
      mostrar({
        tipo: 'sucesso',
        titulo: 'Corte registrado com sucesso',
        descricao: `${servico.name} — ${moeda(preco)}`,
      });
      limpar();
      // O check fica visível o suficiente para ser lido, e some sozinho.
      setTimeout(() => setEstado('parado'), 1400);
    } catch (e) {
      setEstado('parado');
      mostrar({
        tipo: 'erro',
        titulo: 'Não deu para registrar',
        descricao: e instanceof Error ? e.message : 'Tente de novo em um instante.',
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="cartao p-4"
    >
      <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-neve">
        <Icone nome="tesoura" tamanho={17} className="text-ouro" />
        Registrar corte
      </h2>

      <form onSubmit={enviar} className="mt-3.5 flex flex-col gap-2.5" noValidate>
        <CampoLinha rotulo="Serviço" htmlFor="campo-servico" erro={erros.servico}>
          <Seletor
            id="campo-servico"
            valor={servicoId}
            aoMudar={escolherServico}
            opcoes={servicos.map((s) => ({ valor: s.id, rotulo: s.name }))}
            vazio="Selecione o serviço"
          />
        </CampoLinha>

        <CampoLinha rotulo="Valor (R$)" htmlFor="campo-valor" erro={erros.valor}>
          <input
            id="campo-valor"
            // decimal abre o teclado numérico com vírgula no Android e no iPhone.
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setErros((x) => ({ ...x, valor: undefined }));
            }}
            className="w-full bg-transparent px-3 py-3 text-[1rem] text-neve outline-none placeholder:text-fumaca-fraca"
          />
        </CampoLinha>

        <CampoLinha rotulo="Pagamento" htmlFor="campo-pagamento" erro={erros.pagamento}>
          <Seletor
            id="campo-pagamento"
            valor={pagamento}
            aoMudar={(v) => {
              setPagamento(v as PaymentMethod);
              setErros((e) => ({ ...e, pagamento: undefined }));
            }}
            opcoes={PAGAMENTOS.map((p) => ({ valor: p.value, rotulo: p.label }))}
            vazio="Selecione o pagamento"
          />
        </CampoLinha>

        <motion.button
          type="submit"
          disabled={estado !== 'parado'}
          whileTap={{ scale: 0.985 }}
          className="btn-ouro mt-1 flex h-[3.25rem] items-center justify-center gap-2 text-[1rem] disabled:opacity-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            {estado === 'enviando' ? (
              <motion.span
                key="enviando"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Girador />
                Registrando…
              </motion.span>
            ) : estado === 'sucesso' ? (
              <motion.span
                key="sucesso"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Icone nome="check" tamanho={19} strokeWidth={2.6} />
                Corte registrado
              </motion.span>
            ) : (
              <motion.span
                key="parado"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Icone nome="mais" tamanho={19} />
                Adicionar corte
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </motion.section>
  );
}

function Girador() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      className="block h-4 w-4 rounded-full border-2 border-noite/25 border-t-noite"
    />
  );
}
