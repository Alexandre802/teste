import { Cabecalho } from "@/components/layout/Cabecalho";
import { Rodape } from "@/components/layout/Rodape";
import { Hero } from "@/components/home/Hero";
import { Diferenciais } from "@/components/home/Diferenciais";
import { BannerDelivery } from "@/components/home/BannerDelivery";
import { Destaques } from "@/components/home/Destaques";
import { Informacoes } from "@/components/home/Informacoes";
import { FeedInstagram } from "@/components/home/Instagram";
import { BarraPedido } from "@/components/cart/BarraPedido";

/**
 * HOME. O cliente conhece a casa antes de ver produto: hero, diferenciais,
 * delivery, destaques, informacoes. O cardapio completo fica em /cardapio.
 */
export default function Home() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="pb-28 sm:pb-8">
        <Hero />
        <Diferenciais />
        <BannerDelivery />
        <Destaques />
        <FeedInstagram />
        <Informacoes />
      </main>
      <Rodape />
      <BarraPedido />
    </>
  );
}
