import { PainelVazio } from "@/components/admin/EstadoPainel";
import { buscarClientes } from "@/lib/admin/consultas";
import { formatarData } from "@/lib/admin/periodo";
import { formatarCentavos } from "@/lib/dinheiro";

export const dynamic = "force-dynamic";

/**
 * Clientes montados sozinhos a partir dos pedidos. Guardamos só nome e
 * telefone — o que é preciso para atender e mais nada.
 */
export default async function PaginaClientes() {
  const clientes = await buscarClientes();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Clientes
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Montado a partir dos pedidos, sem cadastro manual
        </p>
      </header>

      {clientes.length === 0 ? (
        <PainelVazio
          titulo="Nenhum cliente ainda"
          descricao="Quem pedir pelo site com telefone entra aqui automaticamente."
        />
      ) : (
        <ul className="space-y-2">
          {clientes.map((cliente) => (
            <li
              key={cliente.id}
              className="flex flex-wrap items-center gap-3 rounded-bloco border border-borda bg-white p-4 shadow-carta"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-tinta">
                  {cliente.nome}
                </p>
                <p className="text-[13px] text-tinta-media">
                  {cliente.telefone || "sem telefone"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-extrabold text-tinta">
                  {formatarCentavos(cliente.total_cents)}
                </p>
                <p className="text-[12px] text-tinta-suave">
                  {cliente.pedidos}{" "}
                  {cliente.pedidos === 1 ? "pedido" : "pedidos"}
                  {cliente.ultimo_pedido_at &&
                    ` · último em ${formatarData(cliente.ultimo_pedido_at)}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
