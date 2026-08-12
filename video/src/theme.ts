/**
 * Tokens de identidade visual da Waatzo — amostrados diretamente das imagens
 * de referência (referencias/imagens). Não alterar sem nova amostragem.
 */

export const COLORS = {
  /** Roxo/índigo principal (blobs, logo, botões) */
  primary: '#4B45F1',
  /** Índigo do texto em destaque */
  primaryText: '#3B31F2',
  /** Variação mais profunda (sombra do logo, gradientes) */
  primaryDeep: '#3A2FEE',
  /** Roxo claro dos blobs secundários */
  primarySoft: '#6E68F5',

  /** Quase-preto azulado dos títulos */
  dark: '#0B1024',
  /** Texto de corpo dentro dos cards */
  body: '#1A1D2E',
  /** Texto secundário / horários */
  muted: '#757AA6',
  /** Texto placeholder */
  placeholder: '#9AA0BE',

  /** Fundo da página (fora do card) */
  pageBg: '#FAFAFB',
  /** Fundo do card branco */
  cardBg: '#FDFDFE',
  /** Branco puro (bolhas, chips) */
  white: '#FFFFFF',

  /** Lavanda dos chips e ícones */
  lavender: '#E0DFFD',
  lavenderDeep: '#CDCBFB',
  lavenderLine: '#D8D6FB',
  lavenderFan: '#EFEEFC',

  /** Pêssego das decorações em leque */
  peach: '#FBCB96',
  peachSoft: '#FDE1C5',

  /** Verde do WhatsApp / confirmações */
  green: '#25D366',
  greenDot: '#4ADE5C',
  greenDeep: '#12A84C',

  /** Âmbar do banner de alerta */
  amber: '#FF9300',
  amberBg: '#FDF0DC',

  /** Sombra base */
  shadow: 'rgba(24, 22, 78, 0.10)',
  shadowSoft: 'rgba(24, 22, 78, 0.06)',
  shadowStrong: 'rgba(24, 22, 78, 0.16)',
} as const;

export const FONT = {
  family: 'Inter, system-ui, sans-serif',
  black: 900,
  extra: 800,
  bold: 700,
  semi: 600,
  medium: 500,
  regular: 400,
} as const;

/** Sombras usadas nos cards das referências. */
export const SHADOW = {
  card: '0 18px 46px rgba(24, 22, 78, 0.10), 0 3px 10px rgba(24, 22, 78, 0.05)',
  cardSoft: '0 10px 28px rgba(24, 22, 78, 0.07)',
  cardStrong: '0 26px 64px rgba(24, 22, 78, 0.16)',
  sheet: '0 30px 80px rgba(24, 22, 78, 0.10)',
  phone: '0 34px 80px rgba(24, 22, 78, 0.22)',
  chip: '0 6px 18px rgba(75, 69, 241, 0.22)',
} as const;

/** Escala de referência: as artes vieram em 941x1672 e o vídeo é 1080x1920. */
export const REF_SCALE = 1080 / 941;

/** Converte uma coordenada da arte de referência para o espaço do vídeo. */
export const ref = (v: number) => Math.round(v * REF_SCALE);
