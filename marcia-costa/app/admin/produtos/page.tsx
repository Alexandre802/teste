import { PainelVazio } from "@/components/admin/EstadoPainel";
import { TabelaProdutos } from "@/components/admin/TabelaProdutos";
import { buscarProdutos } from "@/lib/admin/consultas";
import { products } from "@/data/menu";
import { paraCentavos } from "@/lib/dinheiro";

export const dynamic = "force-dynamic";

/**
 * Produtos e custo.
 *
 * O preço de venda continua vindo do cardápio (data/menu.ts) e é espelhado no
 * banco pelo script de sincronização — é esse espelho que o servidor usa para
 * recalcular o pedido. Se os dois divergirem, a tela avisa: preço diferente
 * entre o que o cliente vê e o que é cobrado seria um problema sério.
 */
export default async function PaginaProdutos() {
  const produtos = await buscarProdutos();

  if (produtos.length === 0) {
    return (
      <div className="space-y-5">
        <Cabecalho />
        <PainelVazio
          titulo="Nenhum produto sincronizado"
          descricao="Rode npm run sincronizar-produtos para levar o cardápio e os custos para o banco. Sem isso, o site não consegue registrar pedido."
        />
      </div>
    );
  }

  const doCardapio = new Map(
    products.map((produto) => [produto.id, paraCentavos(produto.price)]),
  );

  return (
    <div className="space-y-5">
      <Cabecalho />
      <TabelaProdutos produtos={produtos} precosDoCardapio={[...doCardapio]} />
    </div>
  );
}

function Cabecalho() {
  return (
    <header>
      <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
        Produtos
      </h1>
      <p className="mt-0.5 text-sm text-tinta-media">
        Informe o custo de cada item para o lucro sair certo. O custo nunca
        aparece no site.
      </p>
    </header>
  );
}
