import { PainelErro } from "@/components/admin/EstadoPainel";
import { TelaConfiguracoes } from "@/components/admin/TelaConfiguracoes";
import { buscarZonas } from "@/lib/admin/consultas";
import { criarClienteServidor, usuarioDoPainel } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PaginaConfiguracoes() {
  const supabase = await criarClienteServidor();
  const usuario = await usuarioDoPainel();
  if (!supabase || !usuario) {
    return <PainelErro mensagem="Sessão não encontrada." />;
  }

  const [{ data: dados }, zonas] = await Promise.all([
    supabase.from("comida_caseira_settings").select("*").eq("id", true).single(),
    buscarZonas(),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
          Configurações
        </h1>
        <p className="mt-0.5 text-sm text-tinta-media">
          Dados da casa, taxas de entrega e acesso
        </p>
      </header>

      <TelaConfiguracoes
        dados={{
          telefone: dados?.telefone ?? "",
          whatsapp: dados?.whatsapp ?? "",
          instagram: dados?.instagram ?? "",
          endereco: dados?.endereco ?? "",
          som_novo_pedido: dados?.som_novo_pedido ?? true,
        }}
        zonas={zonas}
        papel={usuario.role}
        nome={usuario.nome}
        email={usuario.email}
      />
    </div>
  );
}
