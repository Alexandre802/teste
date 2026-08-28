"use client";

import { useState } from "react";
import { Download, FlaskConical, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useToast } from "@/components/ui/Toast";
import { getSupabase } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SyncStatus } from "@/components/layout/SyncStatus";
import { baixarCsv } from "@/utils/csv";
import { csvDespesas, csvEstoque, csvVendas } from "@/services/exportacao";
import { FORNECEDOR_DEMONSTRACAO, PRODUTOS_DEMONSTRACAO } from "@/services/demonstracao";
import { toDateKey } from "@/lib/date";
import { PagamentoIcone } from "@/components/venda/PagamentoIcone";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const toast = useToast();
  const catalogo = useCatalogo();
  const estado = useStore();
  const [carregandoDemo, setCarregandoDemo] = useState(false);

  const dados = {
    products: estado.products,
    variants: estado.variants,
    inventory: estado.inventory,
    sales: estado.sales,
    saleItems: estado.saleItems,
    movements: estado.movements,
    expenses: estado.expenses,
    suppliers: estado.suppliers,
    closings: estado.closings,
    settings: estado.settings,
    ownerName: estado.ownerName,
  };

  const hoje = toDateKey(new Date());

  async function carregarDemonstracao() {
    setCarregandoDemo(true);
    try {
      const fornecedorId = await estado.saveSupplier(FORNECEDOR_DEMONSTRACAO);
      for (const produto of PRODUTOS_DEMONSTRACAO) {
        await estado.saveProduct({ ...produto, supplierId: fornecedorId });
      }
      toast({
        tone: "sucesso",
        title: "Exemplos carregados",
        description: "São peças de demonstração. Edite ou apague quando quiser.",
      });
      router.push("/estoque");
    } catch {
      toast({ tone: "erro", title: "Não foi possível carregar os exemplos" });
    } finally {
      setCarregandoDemo(false);
    }
  }

  async function sair() {
    const supabase = getSupabase();
    await estado.reset();
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <PageHeader title="Configurações" />

      <Card className="mb-4">
        <CardHeader title="Pagamento padrão" />
        <p className="px-4 text-[13px] text-cinza">Já vem marcado na tela de venda.</p>
        <div className="flex flex-wrap gap-2 px-4 pb-4 pt-3">
          {PAYMENT_METHODS.map((forma) => (
            <Chip
              key={forma.id}
              active={estado.settings.defaultPayment === forma.id}
              onClick={() => estado.saveSettings({ defaultPayment: forma.id as PaymentMethod })}
            >
              <span className="flex items-center gap-1.5">
                <PagamentoIcone forma={forma.id} size={15} />
                {forma.label}
              </span>
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Sincronização" action={<SyncStatus />} />
        <div className="px-4 pb-4">
          <p className="mb-3 text-[13px] leading-relaxed text-cinza">
            Vendas feitas sem internet ficam guardadas no aparelho e sobem sozinhas quando o sinal volta.
            {estado.outbox.length > 0
              ? ` ${estado.outbox.length} ${estado.outbox.length === 1 ? "operação aguarda" : "operações aguardam"} envio.`
              : ""}
          </p>
          <Button variant="suave" size="md" full onClick={() => estado.sync()}>
            <RefreshCw size={17} />
            Sincronizar agora
          </Button>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Exportar dados" />
        <div className="grid gap-2.5 px-4 pb-4">
          <Button
            variant="contorno"
            size="md"
            full
            onClick={() => baixarCsv(`vendas-${hoje}.csv`, csvVendas(dados))}
          >
            <Download size={17} />
            Vendas (CSV)
          </Button>
          <Button
            variant="contorno"
            size="md"
            full
            onClick={() => baixarCsv(`estoque-${hoje}.csv`, csvEstoque(catalogo))}
          >
            <Download size={17} />
            Estoque (CSV)
          </Button>
          <Button
            variant="contorno"
            size="md"
            full
            onClick={() => baixarCsv(`despesas-${hoje}.csv`, csvDespesas(dados))}
          >
            <Download size={17} />
            Despesas (CSV)
          </Button>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Dados de demonstração" />
        <div className="px-4 pb-4">
          <p className="mb-3 text-[13px] leading-relaxed text-cinza">
            Carrega quatro peças de exemplo para você ver o app funcionando. Não são dados da sua loja — apague ou
            edite depois.
          </p>
          <Button variant="suave" size="md" full loading={carregandoDemo} onClick={carregarDemonstracao}>
            <FlaskConical size={17} />
            Carregar exemplos
          </Button>
        </div>
      </Card>

      <Button variant="perigo" size="md" full onClick={sair}>
        <LogOut size={17} />
        Sair da conta
      </Button>
    </>
  );
}
