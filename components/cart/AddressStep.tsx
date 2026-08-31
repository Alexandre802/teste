'use client';

import { useId, useState } from 'react';
import {
  formatarCep,
  validarEndereco,
  type CampoEndereco,
  type ErrosEndereco,
} from '@/lib/endereco';
import { bairroAtendido, prazoEstimado } from '@/lib/entrega';
import { useShop } from '@/lib/store';
import { Button } from '../ui/Button';

/**
 * Endereço de entrega.
 *
 * Só aparece quando o modo é "entrega" — na retirada esta tela é pulada
 * inteira, e o cliente nunca vê um campo de rua que não faz sentido para ele.
 *
 * Rua, número e bairro são obrigatórios: sem os três o entregador não sai.
 * O resto ajuda, mas não trava — exigir complemento em bairro de casa térrea
 * e CEP de cabeça só faria o cliente desistir no último passo.
 */
export default function AddressStep({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  const address = useShop((s) => s.address);
  const setAddress = useShop((s) => s.setAddress);

  /**
   * Os erros são DERIVADOS do endereço, não guardados em estado.
   *
   * Guardar `erros` num `useState` e atualizar em alguns lugares (no blur, no
   * envio, na digitação) já rendeu erro fantasma: a mensagem continuava na
   * tela depois de o campo ter sido corrigido, porque um dos caminhos
   * esquecia de recalcular. Derivando, a mensagem não tem como discordar do
   * valor — ela É o valor.
   */
  const erros: ErrosEndereco = validarEndereco(address);

  /** Campos já visitados: o erro só aparece depois de o cliente mexer. */
  const [tocados, setTocados] = useState<Set<CampoEndereco>>(new Set());
  /** Depois de tentar enviar, todo erro aparece, mesmo em campo não visitado. */
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const erroDe = (campo: CampoEndereco) =>
    tentouEnviar || tocados.has(campo) ? erros[campo] : undefined;

  const marcarTocado = (campo: CampoEndereco) =>
    setTocados((s) => (s.has(campo) ? s : new Set(s).add(campo)));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const campos = Object.keys(erros) as CampoEndereco[];
    if (campos.length > 0) {
      setTentouEnviar(true);
      // leva o foco para o primeiro campo com problema, senão em tela pequena
      // o erro fica fora da área visível e parece que o botão não funcionou
      document.getElementById(`end-${campos[0]}`)?.focus();
      return;
    }
    onDone();
  };

  const area = address.bairro.trim() ? bairroAtendido(address.bairro) : null;
  const prazo = prazoEstimado();

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <p className="text-sm leading-relaxed text-white/90">
        Para onde levamos o pedido? Rua, número e bairro são o mínimo para o entregador sair.
      </p>

      <Campo
        campo="rua"
        rotulo="Rua ou avenida"
        valor={address.rua}
        erro={erroDe('rua')}
        autoComplete="address-line1"
        onChange={(v) => setAddress({ rua: v })}
        onBlur={() => marcarTocado('rua')}
        obrigatorio
      />

      <div className="grid grid-cols-[1fr_1.4fr] gap-3">
        <Campo
          campo="numero"
          rotulo="Número"
          valor={address.numero}
          erro={erroDe('numero')}
          autoComplete="address-line2"
          inputMode="numeric"
          onChange={(v) => setAddress({ numero: v })}
          onBlur={() => marcarTocado('numero')}
          obrigatorio
        />
        <Campo
          campo="complemento"
          rotulo="Complemento"
          dica="opcional"
          valor={address.complemento}
          autoComplete="address-line3"
          onChange={(v) => setAddress({ complemento: v })}
          onBlur={() => marcarTocado('complemento')}
        />
      </div>

      <Campo
        campo="bairro"
        rotulo="Bairro"
        valor={address.bairro}
        erro={erroDe('bairro')}
        autoComplete="address-level3"
        onChange={(v) => setAddress({ bairro: v })}
        onBlur={() => marcarTocado('bairro')}
        obrigatorio
      />

      {/* A área atendida só é conferida quando a casa cadastrou os bairros.
          Enquanto a lista não existir, `bairroAtendido` devolve null e nada
          aqui aparece — recusar entrega por uma lista não confirmada perderia
          venda de bairro que a casa atende. */}
      {area === false && (
        <p className="rounded-2xl border border-white/45 bg-white/14 px-4 py-3 text-sm leading-relaxed text-white">
          Não temos confirmação de que entregamos nesse bairro. Você pode seguir com o pedido — a
          casa confirma pelo WhatsApp antes de preparar.
        </p>
      )}

      <Campo
        campo="referencia"
        rotulo="Ponto de referência"
        dica="opcional"
        valor={address.referencia}
        onChange={(v) => setAddress({ referencia: v })}
        onBlur={() => marcarTocado('referencia')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Campo
          campo="cep"
          rotulo="CEP"
          dica="opcional"
          valor={address.cep}
          erro={erroDe('cep')}
          autoComplete="postal-code"
          inputMode="numeric"
          onChange={(v) => setAddress({ cep: formatarCep(v) })}
          onBlur={() => marcarTocado('cep')}
        />
      </div>

      {prazo && (
        <p className="text-xs text-muted">Entrega estimada em {prazo} depois de confirmado.</p>
      )}

      <div className="mt-1 flex flex-col gap-2">
        <Button type="submit" size="lg" className="w-full">
          Continuar para o pagamento
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </form>
  );
}

/* ─────────────────────────── campo de texto ─────────────────────────── */

function Campo({
  campo,
  rotulo,
  dica,
  valor,
  erro,
  obrigatorio,
  autoComplete,
  inputMode,
  onChange,
  onBlur,
}: {
  campo: CampoEndereco;
  rotulo: string;
  dica?: string;
  valor: string;
  erro?: string;
  obrigatorio?: boolean;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text';
  onChange: (valor: string) => void;
  onBlur: () => void;
}) {
  const idErro = useId();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={`end-${campo}`} className="text-sm font-bold text-white">
        {rotulo}
        {dica && <span className="ml-1.5 font-semibold text-white/65">({dica})</span>}
      </label>
      <input
        id={`end-${campo}`}
        type="text"
        value={valor}
        required={obrigatorio}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-2xl bg-white/15 px-4 py-3 text-white placeholder:text-white/55 ring-1 ring-inset focus:outline-none focus:ring-2 ${
          erro ? 'ring-2 ring-white' : 'ring-white/35 focus:ring-white'
        }`}
      />
      {erro && (
        <p id={idErro} role="alert" className="text-xs font-semibold text-white">
          {erro}
        </p>
      )}
    </div>
  );
}
