"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { useReminders } from "@/hooks/useReminders";

/** O lembrete dentro do app: duas saídas diretas, nada de texto extra. */
export function ReminderDialog() {
  const router = useRouter();
  const { aberto, dispensar, mensagem } = useReminders();

  const ir = (destino: string) => {
    dispensar();
    router.push(destino);
  };

  return (
    <Sheet open={aberto} onClose={dispensar} title={BRAND.name}>
      <div className="pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ouro-suave text-ouro">
            <Bell size={20} />
          </span>
          <p className="pt-2 text-[16px] leading-relaxed text-tinta">{mensagem}</p>
        </div>
        <div className="mt-6 grid gap-2.5">
          <Button variant="principal" size="lg" full onClick={() => ir("/venda")}>
            REGISTRAR VENDA
          </Button>
          <Button variant="contorno" size="lg" full onClick={() => ir("/estoque")}>
            ATUALIZAR ESTOQUE
          </Button>
          <Button variant="texto" size="md" full onClick={dispensar}>
            Agora não
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
