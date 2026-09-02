"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Loader2, MessageCircle, Pencil, User } from "lucide-react";

import type { Order } from "@/types";
import { Campo, CampoTexto } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { AvisoInformativo, EstadoErro, EstadoVazio } from "@/components/ui/Estados";
import { BotaoLink } from "@/components/ui/Botao";
import { Totais } from "@/components/cart/Totais";
import { LinhaPedido } from "@/components/cart/LinhaPedido";
import { TipoPedido } from "@/components/checkout/TipoPedido";
import { FormularioEndereco } from "@/components/checkout/FormularioEndereco";
import { FormaPagamento } from "@/components/checkout/FormaPagamento";
import {
  calcularSubtotal,
  calcularTaxa,
  calcularTotal,
  usePedido,
} from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";
import { validarEndereco } from "@/lib/endereco";
import { mascaraTelefone } from "@/lib/format";
import { pendenciasDoPedido } from "@/lib/validacao";
import { linkWhatsapp, montarMensagem } from "@/lib/whatsapp";
import { temWhatsapp } from "@/data/restaurant";
import {
  ErroDeRegistro,
  caixaLigado,
  novoTokenDeCheckout,
  registrarPedido,
} from "@/lib/checkout";
import { useZonas, cidadesEmUso } from "@/lib/zonas-store";

/**
 * Etapa 3: identificacao, endereco, pagamento, observacao e envio.
 *
 * Se o numero da casa nao estiver cadastrado, o botao de enviar NAO finge que
 * mandou: ele explica o que falta e oferece copiar a mensagem pronta.
 */
export function TelaPagamento() {
  const router = useRouter();
  const hidratado = useHidratado();
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState<string | null>(null);
  // Trava o botão enquanto o pedido está sendo gravado: dois toques não podem
  // virar dois pedidos.
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const zonas = useZonas((estado) => estado.zonas);
  const carregarZonas = useZonas((estado) => estado.carregar);
  const cidades = cidadesEmUso(zonas);

  // A área de entrega e a taxa vêm da mesma configuração que o servidor usa.
  useEffect(() => {
    void carregarZonas();
  }, [carregarZonas]);

  const estado = usePedido();
  const {
    items,
    orderType,
    address,
    customer,
    payment,
    precisaTroco,
    trocoPara,
    observation,
  } = estado;

  const subtotal = calcularSubtotal(items);
  const taxa = calcularTaxa(orderType, address);
  const total = calcularTotal(subtotal, taxa);

  const pedido: Order = useMemo(
    () => ({
      items,
      orderType,
      address,
      customer,
      payment,
      precisaTroco,
      trocoPara,
      observation,
      subtotal,
      deliveryFee: orderType === "entrega" ? taxa : null,
      total,
    }),
    [
      items,
      orderType,
      address,
      customer,
      payment,
      precisaTroco,
      trocoPara,
      observation,
      subtotal,
      taxa,
      total,
    ],
  );

  const pendencias = pendenciasDoPedido(pedido, cidades);

  // Estas pendencias ja aparecem coladas no proprio campo. Repeti-las na lista
  // do rodape so faria a mesma frase surgir duas vezes na tela.
  const COM_ERRO_NO_CAMPO = new Set(["nome", "troco", "endereco"]);
  const pendenciasGerais = pendencias.filter(
    (pendencia) => !COM_ERRO_NO_CAMPO.has(pendencia.campo),
  );
  const errosEndereco =
    tentouEnviar && orderType === "entrega"
      ? validarEndereco(address, cidades)
      : {};
  const erroTroco = tentouEnviar
    ? pendencias.find((p) => p.campo === "troco")?.mensagem
    : undefined;

  /**
   * Confere o pedido e leva o cliente ate o que falta. Vale para os dois
   * caminhos: enviar pelo WhatsApp e copiar a mensagem. Mensagem incompleta
   * nao sai daqui de jeito nenhum.
   */
  const pedidoCompleto = () => {
    setTentouEnviar(true);
    if (pendencias.length === 0) return true;
    // Leva o cliente ate o primeiro campo com problema; se o que falta nao tem
    // campo proprio (carrinho, tipo, pagamento), leva ate a lista do rodape.
    const alvo =
      document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      document.getElementById("pendencias");
    alvo?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  /**
   * Grava o pedido no fluxo de caixa e devolve o número.
   *
   * Se o caixa estiver desligado neste ambiente, segue sem número — é o site
   * de antes, e nada se perde. Se o caixa estiver ligado mas não responder, o
   * erro sobe: o WhatsApp NÃO abre como se tivesse dado tudo certo.
   */
  const gravarNoCaixa = async (): Promise<number | null> => {
    if (!caixaLigado) return null;
    if (estado.pedidoRegistrado) return estado.pedidoRegistrado.order_number;

    const token = estado.checkoutToken || novoTokenDeCheckout();
    try {
      const registrado = await registrarPedido(pedido, token);
      estado.definirPedidoRegistrado({
        order_id: registrado.order_id,
        order_number: registrado.order_number,
      });
      return registrado.order_number;
    } catch (erro) {
      if (
        erro instanceof ErroDeRegistro &&
        erro.message === "fluxo_de_caixa_desligado"
      ) {
        return null;
      }
      throw erro;
    }
  };

  const enviar = async () => {
    if (enviando) return;
    if (!pedidoCompleto()) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const numero = await gravarNoCaixa();
      const destino = linkWhatsapp(pedido, numero);
      if (!destino) return;
      window.open(destino, "_blank", "noopener,noreferrer");
      router.push("/confirmacao");
    } catch (erro) {
      setErroEnvio(
        erro instanceof Error && erro.message
          ? erro.message
          : "Não foi possível registrar seu pedido. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const copiar = async () => {
    if (enviando) return;
    if (!pedidoCompleto()) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      const numero = await gravarNoCaixa();
      await navigator.clipboard.writeText(montarMensagem(pedido, numero));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch (erro) {
      if (erro instanceof ErroDeRegistro) {
        setErroEnvio(erro.message);
      } else {
        setErroCopia(
          "Não conseguimos copiar automaticamente. Selecione o texto do pedido abaixo e copie à mão.",
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!hidratado) {
    return (
      <p className="py-16 text-center text-sm text-tinta-media">
        Carregando seu pedido…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <EstadoVazio
        titulo="Seu pedido está vazio"
        descricao="Adicione itens ao pedido para escolher a forma de pagamento."
        acao={<BotaoLink href="/cardapio">Ver cardápio</BotaoLink>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="fonte-titulo text-[17px] font-bold text-tinta">
            Resumo do pedido
          </h2>
          <Link
            href="/pedido"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-laranja"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Link>
        </div>

        <ul className="mb-4">
          {items.map((item) => (
            <LinhaPedido key={item.lineId} item={item} />
          ))}
        </ul>

        <Totais
          subtotal={subtotal}
          taxa={taxa}
          total={total}
          tipo={orderType}
        />
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <TipoPedido valor={orderType} aoEscolher={estado.definirTipo} />
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <fieldset>
          <legend className="fonte-titulo mb-3 flex items-center gap-2 text-[17px] font-bold text-tinta">
            <User className="h-5 w-5 text-laranja" aria-hidden="true" />
            Seus dados
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              rotulo="Nome"
              autoComplete="name"
              placeholder="Como podemos te chamar?"
              value={customer.nome}
              erro={
                tentouEnviar
                  ? pendencias.find((p) => p.campo === "nome")?.mensagem
                  : undefined
              }
              onChange={(evento) =>
                estado.definirCliente({ nome: evento.target.value })
              }
            />
            <Campo
              rotulo="Telefone"
              opcional
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(12) 90000-0000"
              value={customer.telefone}
              onChange={(evento) =>
                estado.definirCliente({
                  telefone: mascaraTelefone(evento.target.value),
                })
              }
            />
          </div>
        </fieldset>
      </section>

      {orderType === "entrega" && (
        <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
          <FormularioEndereco
            endereco={address}
            erros={errosEndereco}
            aoMudar={estado.definirEndereco}
          />
        </section>
      )}

      {orderType === "retirada" && (
        <AvisoInformativo>
          Retirada no balcão: não pedimos endereço. Avisamos pelo WhatsApp
          assim que o pedido estiver pronto.
        </AvisoInformativo>
      )}

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <FormaPagamento
          valor={payment}
          precisaTroco={precisaTroco}
          trocoPara={trocoPara}
          erroTroco={erroTroco}
          aoEscolher={estado.definirPagamento}
          aoDefinirPrecisaTroco={estado.definirPrecisaTroco}
          aoDefinirTroco={estado.definirTrocoPara}
        />
      </section>

      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta sm:p-5">
        <CampoTexto
          rotulo="Observações do pedido"
          opcional
          placeholder="Ex.: Sem cebola, por favor."
          maxLength={400}
          value={observation}
          onChange={(evento) => estado.definirObservacao(evento.target.value)}
        />
      </section>

      <div id="pendencias" className="space-y-2">
        {tentouEnviar &&
          pendenciasGerais.map((pendencia) => (
            <EstadoErro key={pendencia.campo} mensagem={pendencia.mensagem} />
          ))}
        {erroCopia && <EstadoErro mensagem={erroCopia} />}
        {erroEnvio && <EstadoErro mensagem={erroEnvio} />}
      </div>

      {!temWhatsapp && (
        <AvisoInformativo>
          O número de WhatsApp da casa ainda não foi cadastrado neste site, então
          o envio automático está desativado. Copie a mensagem pronta abaixo e
          mande para a Márcia pelo canal que você já usa.
        </AvisoInformativo>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-borda bg-white/97 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        {temWhatsapp ? (
          <Botao
            larguraTotal
            tamanho="grande"
            variante="whatsapp"
            disabled={enviando}
            onClick={enviar}
          >
            {enviando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Registrando seu pedido…
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Enviar pedido no WhatsApp
              </>
            )}
          </Botao>
        ) : (
          <Botao
            larguraTotal
            tamanho="grande"
            disabled={enviando}
            onClick={copiar}
          >
            {enviando ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : copiado ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Copy className="h-5 w-5" aria-hidden="true" />
            )}
            {enviando
              ? "Registrando seu pedido…"
              : copiado
                ? "Mensagem copiada"
                : "Copiar mensagem do pedido"}
          </Botao>
        )}
      </div>

      <details className="rounded-bloco border border-borda bg-nevoa p-4">
        <summary className="cursor-pointer text-sm font-semibold text-tinta">
          Ver a mensagem que será enviada
        </summary>
        <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-tinta-media">
          {montarMensagem(pedido, estado.pedidoRegistrado?.order_number)}
        </pre>
      </details>
    </div>
  );
}
