import type { OrderType } from "@/types";
import { formatarPreco } from "@/lib/format";

/**
 * Subtotal, taxa e total.
 *
 * taxa null significa "a casa ainda nao confirmou a taxa desta regiao". Nesse
 * caso a linha diz "a combinar" e o total nao inventa valor nenhum.
 */
export function Totais({
  subtotal,
  taxa,
  total,
  tipo,
}: {
  subtotal: number;
  taxa: number | null;
  total: number;
  tipo: OrderType | null;
}) {
  return (
    <dl className="space-y-2 border-t border-borda pt-4 text-[15px]">
      <div className="flex justify-between">
        <dt className="text-tinta-media">Subtotal</dt>
        <dd className="font-semibold text-tinta">{formatarPreco(subtotal)}</dd>
      </div>

      {tipo === "entrega" && (
        <div className="flex justify-between">
          <dt className="text-tinta-media">Taxa de entrega</dt>
          <dd className="font-semibold text-tinta">
            {taxa === null ? (
              <span className="text-[13px] font-medium text-tinta-suave">
                a combinar no WhatsApp
              </span>
            ) : (
              formatarPreco(taxa)
            )}
          </dd>
        </div>
      )}

      {tipo === "retirada" && (
        <div className="flex justify-between">
          <dt className="text-tinta-media">Retirada no balcão</dt>
          <dd className="font-semibold text-tinta">sem taxa</dd>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-borda pt-3">
        <dt className="fonte-titulo text-[17px] font-bold text-laranja">
          Total do pedido
        </dt>
        <dd className="text-xl font-extrabold text-laranja">
          {formatarPreco(total)}
        </dd>
      </div>

      {tipo === "entrega" && taxa === null && (
        <p className="text-[12px] leading-relaxed text-tinta-suave">
          A taxa de entrega ainda não está cadastrada no site. O valor final é
          combinado na conversa do WhatsApp antes de a comida sair.
        </p>
      )}
    </dl>
  );
}
