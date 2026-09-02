import {
  ROTULO_PAGAMENTO,
  ROTULO_STATUS,
  type StatusPagamento,
  type StatusPedido,
} from "@/lib/admin/tipos";

const CORES_STATUS: Record<StatusPedido, string> = {
  pending: "bg-nevoa text-tinta-media",
  confirmed: "bg-azul-claro text-azul-info",
  preparing: "bg-creme text-laranja-queimado",
  out_for_delivery: "bg-creme-forte text-laranja-queimado",
  completed: "bg-verde-claro text-verde-positivo",
  cancelled: "bg-vermelho-claro text-vermelho",
};

const CORES_PAGAMENTO: Record<StatusPagamento, string> = {
  pending: "bg-nevoa text-tinta-media",
  paid: "bg-verde-claro text-verde-positivo",
  refunded: "bg-vermelho-claro text-vermelho",
  cancelled: "bg-nevoa text-tinta-suave",
};

/** Selo de status do pedido. Cor e texto juntos, nunca só a cor. */
export function SeloStatus({ status }: { status: StatusPedido }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${CORES_STATUS[status]}`}
    >
      {ROTULO_STATUS[status]}
    </span>
  );
}

export function SeloPagamento({ status }: { status: StatusPagamento }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${CORES_PAGAMENTO[status]}`}
    >
      {ROTULO_PAGAMENTO[status]}
    </span>
  );
}
