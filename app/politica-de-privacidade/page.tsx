import type { Metadata } from 'next';
import Link from 'next/link';
import { business, fullAddress } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: `Como a ${business.name} trata os dados de quem faz pedido pelo site.`,
  alternates: { canonical: '/politica-de-privacidade' },
  // A página existe para quem procura, não para ranquear.
  robots: { index: true, follow: true },
};

/**
 * Política de privacidade.
 *
 * Escrita a partir do que o código FAZ, não de um modelo genérico: cada
 * afirmação aqui corresponde a uma linha do projeto (lib/seguranca.ts para o
 * IP, lib/store.ts para o armazenamento local, as rotas de API para o envio
 * ao WhatsApp e ao Mercado Pago). Se o comportamento mudar, este texto muda
 * junto — política que descreve outro sistema é pior que nenhuma.
 *
 * O que está marcado como pendente de confirmação: razão social e CNPJ. Não
 * foram informados, e não se inventa identidade jurídica de ninguém.
 */
export default function PoliticaDePrivacidade() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <Link
        href="/"
        className="text-sm font-bold text-white/85 underline underline-offset-4 hover:text-white"
      >
        ← Voltar ao cardápio
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
        Política de privacidade
      </h1>
      <p className="mt-3 text-sm text-muted">
        Como a {business.name} trata os dados de quem faz pedido por este site.
      </p>

      <div className="mt-10 flex flex-col gap-8 text-white/90 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-white [&_li]:leading-relaxed [&_p]:leading-relaxed">
        <section className="flex flex-col gap-3">
          <h2>Quem trata os dados</h2>
          <p>
            {business.name}, estabelecimento situado em {fullAddress}. Contato pelo telefone e
            WhatsApp {business.phoneDisplay}.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Quais dados coletamos</h2>
          <p>Somente o necessário para preparar e entregar o seu pedido:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="font-bold text-white">Nome</strong> — para a casa chamar você no
              balcão ou na entrega.
            </li>
            <li>
              <strong className="font-bold text-white">Telefone</strong> — opcional; serve para o
              entregador falar com você se precisar.
            </li>
            <li>
              <strong className="font-bold text-white">Endereço</strong> — rua, número, bairro e,
              se você informar, complemento, referência e CEP. Coletado apenas quando o pedido é
              para entrega. Na retirada, nenhum endereço é pedido.
            </li>
            <li>
              <strong className="font-bold text-white">E-mail</strong> — apenas se você escolher se
              identificar por e-mail.
            </li>
            <li>
              <strong className="font-bold text-white">Itens do pedido</strong> — o que você pediu,
              quantidades, observações e a forma de pagamento escolhida.
            </li>
          </ul>
          <p>
            Não pedimos CPF, não pedimos data de nascimento e não pedimos dados de cartão — o
            cartão, quando usado, é digitado direto no ambiente do Mercado Pago, que este site não
            enxerga.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Para que usamos</h2>
          <p>
            Exclusivamente para atender o seu pedido: preparar, cobrar quando for o caso, entregar
            e falar com você sobre ele. Não usamos os seus dados para publicidade, não montamos
            perfil de consumo e não vendemos nem compartilhamos a sua informação com quem não
            esteja listado abaixo.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Onde os dados vão parar</h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="font-bold text-white">WhatsApp (Meta)</strong> — o pedido é
              enviado como mensagem para o número da lanchonete. É por ali que a casa recebe e
              responde. Vale a política de privacidade da Meta.
            </li>
            <li>
              <strong className="font-bold text-white">Mercado Pago</strong> — apenas quando você
              escolhe pagar pelo site. Recebe o valor, os itens e o seu nome para emitir a
              cobrança. Os dados do cartão ficam com eles; nunca passam por este site.
            </li>
            <li>
              <strong className="font-bold text-white">Vercel</strong> — empresa que hospeda o
              site.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2>O que fica guardado no seu aparelho</h2>
          <p>
            A sua sacola, o seu endereço e os últimos pedidos ficam salvos no armazenamento local
            do seu próprio navegador, para você não redigitar tudo na próxima vez. Isso não sai do
            seu aparelho e não é enviado para nós. Limpar os dados do site no navegador apaga tudo
            de uma vez.
          </p>
          <p>
            O site não usa cookies de rastreamento, não carrega script de terceiro para publicidade
            e não tem ferramenta de analytics.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Endereço de rede (IP)</h2>
          <p>
            O seu IP não é armazenado. Para impedir que alguém dispare pedidos falsos em massa, o
            servidor transforma o endereço em um código embaralhado que muda todo dia e não permite
            voltar ao endereço original. Os registros do servidor passam por uma filtragem que
            substitui e-mail, telefone, CEP e IP por marcadores antes de qualquer coisa ser
            gravada.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Por quanto tempo</h2>
          <p>
            A conversa do pedido fica no WhatsApp da lanchonete pelo tempo em que a casa mantiver o
            histórico. Os registros de pagamento ficam com o Mercado Pago pelo prazo legal deles. O
            que está no seu navegador fica até você limpar.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Seus direitos</h2>
          <p>
            A Lei Geral de Proteção de Dados (Lei 13.709/2018) garante a você pedir acesso,
            correção ou exclusão dos seus dados, saber com quem foram compartilhados e retirar o
            consentimento. Para exercer qualquer um deles, fale com a casa pelo WhatsApp{' '}
            {business.phoneDisplay} — é o mesmo canal do pedido.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Menores de idade</h2>
          <p>
            O site não é direcionado a crianças. Pedido de menor de 16 anos deve ser feito por um
            responsável.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Mudanças nesta política</h2>
          <p>
            Se o site passar a coletar algo diferente, este texto é atualizado antes. A versão
            publicada aqui é sempre a que vale.
          </p>
        </section>
      </div>

      <p className="mt-12 border-t border-white/25 pt-6 text-xs leading-relaxed text-white/70">
        Documento preparado para a {business.name}. A razão social e o CNPJ do estabelecimento
        ainda não foram informados — quando forem, entram na seção “Quem trata os dados”.
      </p>
    </main>
  );
}
