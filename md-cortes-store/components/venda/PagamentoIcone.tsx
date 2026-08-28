import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types";

const ICONES = {
  pix: QrCode,
  dinheiro: Banknote,
  debito: Wallet,
  credito: CreditCard,
} as const;

export function PagamentoIcone({ forma, size = 22 }: { forma: PaymentMethod; size?: number }) {
  const Icone = ICONES[forma];
  return <Icone size={size} strokeWidth={1.8} />;
}
