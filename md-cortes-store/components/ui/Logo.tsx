import Image from "next/image";
import { BRAND } from "@/lib/brand";

/**
 * Marca da loja.
 *
 * O nome é texto de verdade com a fonte do app, não um desenho: assim ele sai
 * igual no iPhone, no Android e no computador — um SVG com <text> depende da
 * fonte instalada no aparelho e vira outro logo em cada um. Só o cabide é
 * desenho.
 *
 * Para colocar a logo oficial: ponha o arquivo em public/marca/ e troque este
 * componente por uma <Image>. Nenhuma tela conhece o desenho, todas passam aqui.
 */
export function Logo({ size = 120, priority = false }: { size?: number; priority?: boolean }) {
  void priority;
  const monograma = Math.round(size * 0.58);
  const nome = Math.round(size * 0.235);

  return (
    <div className="flex select-none flex-col items-center" role="img" aria-label={BRAND.name}>
      <span
        className="marca bg-gradient-to-b from-[#E8B84B] via-[#C98A13] to-[#A96F0B] bg-clip-text font-bold leading-none text-transparent"
        style={{ fontSize: monograma, letterSpacing: "-0.02em" }}
        aria-hidden
      >
        MD
      </span>
      <Cabide largura={Math.round(monograma * 1.08)} style={{ marginTop: -Math.round(monograma * 0.33) }} />
      <span
        className="marca whitespace-nowrap font-bold leading-none text-tinta"
        style={{ fontSize: nome, marginTop: Math.round(size * 0.07) }}
        aria-hidden
      >
        {BRAND.name}
      </span>
      <Filete largura={Math.round(size * 1.3)} />
    </div>
  );
}

function Cabide({ largura, style }: { largura: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={largura}
      height={largura * 0.5}
      viewBox="0 0 120 60"
      fill="none"
      aria-hidden
      style={style}
      className="text-ouro"
    >
      <path
        d="M60 22c0-7 6-9 6-14a6 6 0 0 0-12 0"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M60 26 9 54c-2.6 1.5-1.6 5.5 1.5 5.5h99c3.1 0 4.1-4 1.5-5.5L60 26Z"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Filete({ largura }: { largura: number }) {
  return (
    <svg
      width={largura}
      height={Math.round(largura * 0.07)}
      viewBox="0 0 400 28"
      fill="none"
      aria-hidden
      className="mt-2"
    >
      <path d="M8 16h150M242 16h150" stroke="#DEBE7A" strokeWidth="2" strokeLinecap="round" />
      <path d="M180 22l-5-16 9 6 16-13 16 13 9-6-5 16z" fill="#C98A13" />
    </svg>
  );
}

/** Só o monograma, para o cabeçalho. */
export function Monogram({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={BRAND.logo.mark}
      alt=""
      width={size}
      height={size}
      aria-hidden
      style={{ width: size, height: size }}
    />
  );
}
