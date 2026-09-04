/**
 * Medidas da composição UHD do hero.
 *
 * O vídeo original enviado tem 720×1280, 24 fps e 192 quadros. Para evitar
 * que o navegador estique uma fonte pequena em telas grandes, o site usa uma
 * recodificação UHD vertical 2160×3840, preservando exatamente os mesmos
 * 192 quadros e o mesmo movimento da câmera.
 */
export const HERO_FPS = 24;
export const HERO_DURATION_IN_FRAMES = 192;
export const HERO_WIDTH = 2160;
export const HERO_HEIGHT = 3840;

/**
 * Fonte principal do scroll-scrub em UHD. Todo quadro continua sendo keyframe
 * (`-g 1`) para que `seekTo()` responda imediatamente ao scroll.
 *
 * O WebM antigo fica apenas como fallback raro para navegadores sem H.264.
 */
export const HERO_FONTES = [
  { src: '/videos/remotion/hero-scrub-uhd.mp4', tipo: 'video/mp4' },
  { src: '/videos/remotion/hero-scrub.webm', tipo: 'video/webm; codecs="vp9"' },
] as const;

export const HERO_VIDEO_SRC = HERO_FONTES[0].src;

/** Roda no navegador: devolve a primeira fonte que o aparelho sabe decodificar. */
export const escolherFonteDoHero = () => {
  if (typeof document === 'undefined') return HERO_VIDEO_SRC;

  const teste = document.createElement('video');
  const suportada = HERO_FONTES.find((fonte) => teste.canPlayType(fonte.tipo) !== '');

  return (suportada ?? HERO_FONTES[0]).src;
};

/** Posters UHD: servidos sem nova recompressão no hero. */
export const HERO_POSTER_INICIO = '/imagens/hero/hero-inicio-uhd.webp';
export const HERO_POSTER_FINAL = '/imagens/hero/hero-final-uhd.webp';

/**
 * Marcos do percurso, em fração do scroll da seção. Medidos no vídeo:
 * 0,00 aérea · 0,25 descida · 0,50 piscina · 0,69 porta · 0,78 abertura
 * 0,92 interior · 1,00 vista externa final.
 *
 * O conteúdo comercial só entra depois que a câmera já atravessou a casa.
 */
export const HERO_REVELACAO_INICIO = 0.88;
export const HERO_REVELACAO_FIM = 0.97;

/** "Role para continuar" some assim que o movimento começa. */
export const HERO_CONVITE_FADE_INICIO = 0.04;
export const HERO_CONVITE_FADE_FIM = 0.12;
