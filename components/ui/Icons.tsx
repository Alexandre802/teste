/**
 * Ícones de linha do site. Todos seguem o mesmo desenho da peça de referência:
 * traço de 1.8, pontas arredondadas, sem preenchimento, herdando `currentColor`
 * — é isso que faz a fileira de categorias e a faixa de benefícios parecerem
 * de uma família só.
 */
type Props = React.SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ───────────────────────────── interface ───────────────────────────── */

export const IconeMenu = (p: Props) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </Svg>
);

export const IconeUsuario = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6" />
  </Svg>
);

export const IconeCarrinho = (p: Props) => (
  <Svg {...p}>
    <path d="M2.6 3.4h2.2l2.3 10.6h9.7l2.2-7.7H6.2" />
    <circle cx="9.4" cy="19" r="1.6" />
    <circle cx="16.6" cy="19" r="1.6" />
  </Svg>
);

export const IconeBusca = (p: Props) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="6.6" />
    <path d="m15.8 15.8 4 4" />
  </Svg>
);

export const IconeLocal = (p: Props) => (
  <Svg {...p}>
    <path d="M12 21c4.2-4.4 6.3-7.7 6.3-10.3A6.3 6.3 0 0 0 5.7 10.7C5.7 13.3 7.8 16.6 12 21Z" />
    <circle cx="12" cy="10.4" r="2.3" />
  </Svg>
);

export const IconeSeta = (p: Props) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const IconeFechar = (p: Props) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconeMais = (p: Props) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Svg>
);

export const IconeMenos = (p: Props) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M5.5 12h13" />
  </Svg>
);

export const IconeLixeira = (p: Props) => (
  <Svg {...p}>
    <path d="M4 6.5h16M9.5 6.5V4.6h5v1.9M6.4 6.5l.9 13.1h9.4l.9-13.1" />
    <path d="M10.3 10.4v5.4M13.7 10.4v5.4" />
  </Svg>
);

export const IconeCoracao = (p: Props) => (
  <Svg {...p}>
    <path d="M12 20.2 4.8 13a4.4 4.4 0 0 1 6.2-6.2l1 1 1-1A4.4 4.4 0 0 1 19.2 13Z" />
  </Svg>
);

/* ─────────────────────────── faixa e serviços ─────────────────────────── */

export const IconeCaminhao = (p: Props) => (
  <Svg {...p}>
    <path d="M2.8 6.4h10.4v9.2H2.8z" />
    <path d="M13.2 9.6h3.7l3.3 3.2v2.8h-7z" />
    <circle cx="7" cy="17.8" r="1.7" />
    <circle cx="16.6" cy="17.8" r="1.7" />
  </Svg>
);

export const IconeTelefone = (p: Props) => (
  <Svg {...p}>
    <path d="M6.4 3.6h3l1.5 3.7-1.9 1.5a11 11 0 0 0 5.2 5.2l1.5-1.9 3.7 1.5v3a1.8 1.8 0 0 1-2 1.8C10.6 17.8 6.2 13.4 4.6 5.6a1.8 1.8 0 0 1 1.8-2Z" />
  </Svg>
);

export const IconeWhatsApp = (p: Props) => (
  <Svg {...p}>
    <path d="M20 11.6a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.6Z" />
    <path d="M9.2 9c.2 1.6 1.3 3.4 3 4.5.6.4 1.3.7 2 .9l.9-1.3 1.6.8-.5 1.4c-1.8.5-4-.5-5.6-2s-2.6-3.7-2.2-5.5l1.4-.4.8 1.6z" />
  </Svg>
);

export const IconeLoja = (p: Props) => (
  <Svg {...p}>
    <path d="M3.6 9.4h16.8V20H3.6z" />
    <path d="M3 9.4 4.7 4.6h14.6L21 9.4a2.6 2.6 0 0 1-4.5 1.8 2.6 2.6 0 0 1-4.5 0 2.6 2.6 0 0 1-4.5 0A2.6 2.6 0 0 1 3 9.4Z" />
    <path d="M9.8 20v-4.9h4.4V20" />
  </Svg>
);

export const IconePata = (p: Props) => (
  <Svg {...p}>
    <ellipse cx="7.2" cy="9.4" rx="1.9" ry="2.5" />
    <ellipse cx="12" cy="7.6" rx="1.9" ry="2.6" />
    <ellipse cx="16.8" cy="9.4" rx="1.9" ry="2.5" />
    <path d="M12 12.2c2.6 0 4.6 1.9 4.6 4 0 1.6-1.2 2.7-2.8 2.7h-3.6c-1.6 0-2.8-1.1-2.8-2.7 0-2.1 2-4 4.6-4Z" />
  </Svg>
);

export const IconeCartao = (p: Props) => (
  <Svg {...p}>
    <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="2.2" />
    <path d="M2.8 10h18.4M6.2 14.6h3.4" />
  </Svg>
);

export const IconeSelo = (p: Props) => (
  <Svg {...p}>
    {/* medalha com fitas — o selo de marca premiada */}
    <circle cx="12" cy="9.2" r="5.2" />
    <path d="m8.7 13.7-1.5 6.1 4.8-2.5 4.8 2.5-1.5-6.1" />
    <path d="m12 6.6 1 2 2.3.3-1.7 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.7-1.6 2.3-.3Z" />
  </Svg>
);

export const IconeTesoura = (p: Props) => (
  <Svg {...p}>
    <circle cx="6.2" cy="17.4" r="2.4" />
    <circle cx="17.8" cy="17.4" r="2.4" />
    <path d="M8 15.7 17.4 4.4M16 15.7 6.6 4.4" />
  </Svg>
);

export const IconeAtendente = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="8.2" r="3.4" />
    <path d="M5 20c.6-3.4 3.4-5.3 7-5.3s6.4 1.9 7 5.3" />
    <path d="M17.6 6.4a3 3 0 0 1 2.6 3v1.8" />
  </Svg>
);

/* ───────────────────────────── espécies ───────────────────────────── */

export const IconeCachorro = (p: Props) => (
  <Svg {...p}>
    {/* orelhas caídas nas laterais da cabeça */}
    <path d="M7.1 7.9C4.9 7.9 3.3 9.9 3.3 12.5c0 2 1 3.6 2.6 4.2" />
    <path d="M16.9 7.9c2.2 0 3.8 2 3.8 4.6 0 2-1 3.6-2.6 4.2" />
    <path d="M12 4.6c2.9 0 5.2 2.4 5.2 5.4v2.6c0 3.5-2.3 6.3-5.2 6.3s-5.2-2.8-5.2-6.3V10c0-3 2.3-5.4 5.2-5.4Z" />
    <path d="M10.1 11.3h.02M13.9 11.3h.02" />
    <path d="M12 13.5c-.9 0-1.7.5-1.7 1.2s.8 1.1 1.7 1.1 1.7-.4 1.7-1.1-.8-1.2-1.7-1.2Z" />
  </Svg>
);

export const IconeGato = (p: Props) => (
  <Svg {...p}>
    {/* orelhas triangulares e cara redonda */}
    <path d="M5.5 10.9 4.7 5.2a.6.6 0 0 1 .9-.6L9.9 7" />
    <path d="m18.5 10.9.8-5.7a.6.6 0 0 0-.9-.6L14.1 7" />
    <path d="M12 6.9c3.9 0 7 2.9 7 6.5s-3.1 6.1-7 6.1-7-2.5-7-6.1 3.1-6.5 7-6.5Z" />
    <path d="M9.7 12.6h.02M14.3 12.6h.02" />
    <path d="M12 14.7v1.1M12 15.8l-1.3.8M12 15.8l1.3.8" />
  </Svg>
);

export const IconePeixe = (p: Props) => (
  <Svg {...p}>
    {/* corpo virado para a direita, cauda à esquerda */}
    <ellipse cx="13.6" cy="12" rx="6.4" ry="5.1" />
    <path d="M7.4 12 3 8.4v7.2L7.4 12Z" />
    <path d="M16.6 10.3h.02" />
    <path d="M12.4 8.4c1 2.2 1 5 0 7.2" />
  </Svg>
);

export const IconeAve = (p: Props) => (
  <Svg {...p}>
    {/* cabeça, bico, corpo, cauda e pés */}
    <circle cx="15.1" cy="7.4" r="2.6" />
    <path d="m17.6 6.8 3.3.8-3.1 1.3" />
    <path d="M13.3 9.5c-2.7 1-4.5 3.4-4.5 6.1 0 .5.1 1 .2 1.4h5.5c2.6 0 4.7-2.1 4.7-4.7 0-1-.3-2-.9-2.8" />
    <path d="M9 17 3.4 19.2l4.1-4.4" />
    <path d="M11.4 17v2.2M14.4 17v2.2" />
  </Svg>
);

export const IconeCoelho = (p: Props) => (
  <Svg {...p}>
    {/* orelhas compridas e cara redonda */}
    <ellipse cx="9.3" cy="7.3" rx="1.7" ry="3.9" transform="rotate(-14 9.3 7.3)" />
    <ellipse cx="14.7" cy="7.3" rx="1.7" ry="3.9" transform="rotate(14 14.7 7.3)" />
    <path d="M12 10.5c3.1 0 5.5 2.2 5.5 4.9s-2.4 4.6-5.5 4.6-5.5-1.9-5.5-4.6 2.4-4.9 5.5-4.9Z" />
    <path d="M10.1 14.6h.02M13.9 14.6h.02" />
    <path d="M12 16.3v1M12 17.3l-1.1.7M12 17.3l1.1.7" />
  </Svg>
);

export const IconeReptil = (p: Props) => (
  <Svg {...p}>
    {/* tartaruga: casco, cabeça e patas */}
    <path d="M4.3 15.7c0-3.7 3-6.7 6.8-6.7s6.8 3 6.8 6.7Z" />
    <circle cx="19.9" cy="13.5" r="1.9" />
    <path d="M6.6 15.7v1.4a1.4 1.4 0 0 0 2.8 0v-1.4M12.9 15.7v1.4a1.4 1.4 0 0 0 2.8 0v-1.4" />
    <path d="M11.1 9v6.7M7.7 10.6l1.3 5.1M14.5 10.6l-1.3 5.1" />
  </Svg>
);

/* ─────────────────────────── departamentos ─────────────────────────── */

export const IconeRacao = (p: Props) => (
  <Svg {...p}>
    <path d="M6.4 4.6h11.2l1.4 4v9.8a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 18.4V8.6Z" />
    <path d="M5 8.6h14M9.6 12.4h4.8M9.6 15.6h4.8" />
  </Svg>
);

export const IconeSache = (p: Props) => (
  <Svg {...p}>
    <path d="M5.6 6.4h12.8v13.2H5.6z" />
    <path d="M5.6 6.4 7 4.4h10l1.4 2M9.6 10.6h4.8M9.6 14h4.8" />
  </Svg>
);

export const IconePetisco = (p: Props) => (
  <Svg {...p}>
    <path d="M4.6 12.4c0-1.3 1-2.3 2.3-2.3h10.2c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3H6.9a2.3 2.3 0 0 1-2.3-2.3Z" />
    <path d="M4.7 10.2 3 8.6M4.7 14.6 3 16.2M19.3 10.2 21 8.6M19.3 14.6 21 16.2" />
  </Svg>
);

export const IconeTapete = (p: Props) => (
  <Svg {...p}>
    <rect x="3.2" y="6.4" width="17.6" height="11.2" rx="1.6" />
    <path d="M6.6 9.8h4M6.6 12.4h6.4" />
    <path d="M16.6 14.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" />
  </Svg>
);

export const IconeBrinquedo = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.6" />
    <path d="M4.6 12c2-1.6 4.5-2.4 7.4-2.4s5.4.8 7.4 2.4M9 5.2c1.6 2 2.4 4.3 2.4 6.8S10.6 17 9 19" />
  </Svg>
);

export const IconeColeira = (p: Props) => (
  <Svg {...p}>
    <path d="M4.4 9.6a7.8 7.8 0 0 0 15.2 0" />
    <path d="M4.4 9.6a7.8 7.8 0 0 1 15.2 0" />
    <path d="M12 17.4v2.2" />
    <circle cx="12" cy="20.4" r="1.4" />
  </Svg>
);

export const IconeCama = (p: Props) => (
  <Svg {...p}>
    <path d="M3 16.4v-3a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3" />
    <path d="M3 16.4h18v3H3zM6.6 10.4V8.2a1.8 1.8 0 0 1 1.8-1.8h7.2a1.8 1.8 0 0 1 1.8 1.8v2.2" />
  </Svg>
);

export const IconeHigiene = (p: Props) => (
  <Svg {...p}>
    <path d="M8 9.6h8v10.2H8z" />
    <path d="M10.4 9.6V6.4h3.2v3.2M11 4.2h2v2.2h-2z" />
    <path d="M10.4 13h3.2" />
  </Svg>
);

export const IconeSaude = (p: Props) => (
  <Svg {...p}>
    <path d="M6.6 8.4h10.8v9.4a2.2 2.2 0 0 1-2.2 2.2H8.8a2.2 2.2 0 0 1-2.2-2.2Z" />
    <path d="M8.6 8.4V6a2 2 0 0 1 2-2h2.8a2 2 0 0 1 2 2v2.4" />
    <path d="M12 11.6v4.6M9.7 13.9h4.6" />
  </Svg>
);

export const IconeCheck = (p: Props) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="m5 12.5 4.6 4.5L19 7" />
  </Svg>
);

/* Mapa usado pelas listas em data/ — a chave é o nome do ícone no dado. */
export const icones = {
  cachorro: IconeCachorro,
  gato: IconeGato,
  peixe: IconePeixe,
  ave: IconeAve,
  coelho: IconeCoelho,
  reptil: IconeReptil,
  racao: IconeRacao,
  sache: IconeSache,
  petisco: IconePetisco,
  tapete: IconeTapete,
  brinquedo: IconeBrinquedo,
  coleira: IconeColeira,
  cama: IconeCama,
  higiene: IconeHigiene,
  saude: IconeSaude,
  caminhao: IconeCaminhao,
  whatsapp: IconeWhatsApp,
  loja: IconeLoja,
  pata: IconePata,
  cartao: IconeCartao,
  selo: IconeSelo,
  tesoura: IconeTesoura,
  atendente: IconeAtendente,
} as const;

export type NomeIcone = keyof typeof icones;
