import DetalhePedido from '@/components/admin/telas/DetalhePedido';

export const metadata = { title: 'Detalhes do pedido' };

export default async function PaginaDetalhePedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetalhePedido id={id} />;
}
