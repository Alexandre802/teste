import { servicos } from '@/data/banners';
import { linkWhatsApp } from '@/lib/whatsapp';
import { icones } from '@/components/ui/Icons';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * "Serviços para o seu pet". Cada card leva a uma conversa de WhatsApp já com o
 * assunto escrito, para o cliente não precisar explicar do zero.
 */
export default function ServicesSection() {
  return (
    <section id="servicos" aria-labelledby="titulo-servicos" className="shell pt-10">
      <SectionHeader id="titulo-servicos" titulo="Serviços para o seu pet" />
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {servicos.map((servico) => {
          const Icone = icones[servico.icone];
          return (
            <li key={servico.titulo} className="card-flat flex gap-3 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-2">
                <Icone className="h-6 w-6 text-brand-700" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold leading-tight text-ink">{servico.titulo}</h3>
                <p className="mt-1 text-[13px] leading-snug text-ink-3">{servico.texto}</p>
                <a
                  href={linkWhatsApp(servico.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[13px] font-bold text-brand-500 hover:underline"
                >
                  {servico.acao}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
