/**
 * Identidade da loja num lugar só.
 *
 * Para trocar a logo provisória pela oficial basta substituir os arquivos em
 * `public/marca/` (mesmos nomes) ou apontar `logo.src` para o novo caminho —
 * nenhum componente conhece o desenho, todos passam por aqui.
 */
export const BRAND = {
  name: "MD Cortes Store",
  shortName: "MD Cortes",
  owner: "Maicon",
  tagline: "Gerencie suas vendas e seu estoque.",
  logo: {
    /** Marca completa (monograma + nome), usada no login e na abertura. */
    full: "/marca/logo.svg",
    /** Só o monograma, para cabeçalho e ícone do app. */
    mark: "/marca/monograma.svg",
    icon192: "/marca/icone-192.png",
    icon512: "/marca/icone-512.png",
    maskable: "/marca/icone-maskable-512.png",
  },
  colors: {
    gold: "#C98A13",
    goldLight: "#E8B84B",
    ink: "#111111",
  },
} as const;
