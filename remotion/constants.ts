/**
 * Medidas do vídeo de referência do hero.
 *
 * O vídeo é a fonte oficial do movimento da câmera. O Remotion não reconstrói
 * a trajetória: ele apenas controla QUAL QUADRO do arquivo está na tela. Estes
 * números vêm do próprio arquivo (`ffprobe`) e precisam continuar batendo com
 * ele — se o vídeo for trocado, atualize aqui.
 */
export const HERO_FPS = 24;
export const HERO_DURATION_IN_FRAMES = 192;
export const HERO_WIDTH = 720;
export const HERO_HEIGHT = 1280;

/**
 * Recodificações do original com um keyframe em cada quadro (`-g 1`), para o
 * seek do scroll responder na hora. O original fica em `hero-original.mp4`.
 *
 * O H.264 cobre praticamente todos os navegadores e é a primeira escolha; o
 * VP9 existe porque algumas compilações de Chromium em Linux saem sem os
 * codecs proprietários e ficariam sem hero nenhum.
 */
export const HERO_FONTES = [
  { src: '/videos/remotion/hero-scrub.mp4', tipo: 'video/mp4; codecs="avc1.42E01E"' },
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

/** Primeiro quadro — evita tela preta enquanto o vídeo carrega. */
export const HERO_POSTER_INICIO = '/imagens/hero/hero-inicio.webp';
/** Último quadro — é o que aparece em `prefers-reduced-motion`. */
export const HERO_POSTER_FINAL = '/imagens/hero/hero-final.webp';

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
