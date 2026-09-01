/**
 * Substitui `lib/brand` no build de demonstração.
 *
 * A página é um arquivo só, então não existe `/marca/…` para buscar: as
 * imagens da marca entram embutidas. O resto da identidade (nome, cores,
 * lema) continua vindo do arquivo original — nada é duplicado aqui.
 */
import { BRAND as ORIGINAL } from "../../lib/brand";
import monograma from "../../public/marca/monograma.svg";
import icone192 from "../../public/marca/icone-192.png";

export const BRAND = {
  ...ORIGINAL,
  logo: {
    ...ORIGINAL.logo,
    full: monograma,
    mark: monograma,
    icon192: icone192,
    icon512: icone192,
    maskable: icone192,
  },
} as const;
