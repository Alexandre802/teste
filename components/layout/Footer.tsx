import Link from 'next/link';
import { business } from '@/data/business';
import { especies, departamentos, paraSecao } from '@/data/categories';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeLocal, IconeLoja, IconeTelefone, IconeWhatsApp } from '@/components/ui/Icons';

/**
 * Rodapé. Só mostra o que a loja confirmou: endereço completo e horário ainda
 * estão como `null` em data/business.ts e por isso não aparecem — assim que
 * forem preenchidos, entram sozinhos.
 */
export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-brand-700 text-white">
      <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/80">
            {business.nomeLinha1}
          </p>
          <p className="text-xl font-extrabold leading-tight">{business.nomeLinha2}</p>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/80">
            {business.descricao}
          </p>
          <p className="mt-4 inline-block rounded-lg bg-brand-800 px-3 py-2 text-center leading-none">
            <span className="block text-lg font-bold italic">PremieR</span>
            <span className="mt-1 block border-t border-white/35 pt-1 text-[9px] font-semibold tracking-[0.14em]">
              SUPER PREMIUM
            </span>
          </p>
        </div>

        <nav aria-label="Categorias por espécie">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">Espécies</h2>
          <ul className="mt-3 space-y-2">
            {especies.map((especie) => (
              <li key={especie.id}>
                <Link href={paraSecao(especie.ancora)} className="text-[13px] text-white/80 hover:text-white hover:underline">
                  {especie.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Departamentos">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">Departamentos</h2>
          <ul className="mt-3 space-y-2">
            {departamentos.slice(0, 7).map((departamento) => (
              <li key={departamento.nome}>
                <Link href={paraSecao(departamento.ancora)} className="text-[13px] text-white/80 hover:text-white hover:underline">
                  {departamento.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">Atendimento</h2>
          <ul className="mt-3 space-y-3 text-[13px] text-white/85">
            <li>
              <a href={business.telefoneLink} className="flex items-center gap-2 hover:text-white hover:underline">
                <IconeTelefone className="h-[18px] w-[18px] shrink-0" />
                {business.telefone}
              </a>
            </li>
            <li>
              <a
                href={linkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white hover:underline"
              >
                <IconeWhatsApp className="h-[18px] w-[18px] shrink-0" />
                {business.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <IconeLoja className="h-[18px] w-[18px] shrink-0" />
              Loja física em {business.cidadeUf}
            </li>
            {business.enderecoCompleto ? (
              <li className="flex items-start gap-2">
                <IconeLocal className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                {business.enderecoCompleto}
              </li>
            ) : null}
            {business.horarios.length > 0 ? (
              <li className="pt-1">
                <span className="block font-semibold text-white">Horários</span>
                {business.horarios.map((horario) => (
                  <span key={horario.dias} className="block">
                    {horario.dias}: {horario.abre} às {horario.fecha}
                  </span>
                ))}
              </li>
            ) : null}
          </ul>

          <Link
            href="/login"
            className="mt-4 inline-block rounded-full border border-white/45 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
          >
            Minha conta
          </Link>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="shell flex flex-col gap-1 py-4 text-[12px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {business.nome}. Todos os direitos reservados.
          </p>
          <p>{business.entrega.observacao}</p>
        </div>
      </div>
    </footer>
  );
}
