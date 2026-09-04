'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Player, type PlayerRef } from '@remotion/player';

import { RealEstateHero } from '@/remotion/RealEstateHero';
import {
  HERO_CONVITE_FADE_FIM,
  HERO_CONVITE_FADE_INICIO,
  HERO_DURATION_IN_FRAMES,
  HERO_FPS,
  HERO_HEIGHT,
  HERO_POSTER_FINAL,
  HERO_POSTER_INICIO,
  HERO_REVELACAO_FIM,
  HERO_REVELACAO_INICIO,
  HERO_WIDTH,
  escolherFonteDoHero,
} from '@/remotion/constants';
import { faixa, limitar, progressoParaQuadro, suavizarSaida } from '@/remotion/utils';
import { usePrefereMenosMovimento } from '@/lib/use-reduced-motion';
import { useMontado } from '@/lib/use-montado';
import { ScrollIndicator } from './ScrollIndicator';
import { HeroFinalContent } from './HeroFinalContent';

/**
 * Hero cinematográfico: o scroll percorre o vídeo, quadro a quadro.
 *
 * A seção é alta (ver `.hero-scroll` no globals.css) e tem dentro um container
 * `sticky` de uma tela. Enquanto a seção passa pela viewport, o progresso do
 * scroll vira um número de 0 a 1 e esse número escolhe o quadro do vídeo:
 *
 *     quadro = round(progresso × (duração − 1))
 *
 * A conversão é linear de propósito. Quem produz o movimento é o arquivo de
 * vídeo; qualquer easing aqui reordenaria os quadros e estragaria o ritmo
 * original da câmera. Parou de rolar, a câmera para. Voltou, ela volta.
 *
 * Nada de `setState` por quadro: as opacidades são escritas direto no DOM
 * dentro de um `requestAnimationFrame`, e o único estado de React que muda
 * durante o scroll é o booleano que libera o clique no conteúdo final.
 */
export const HeroScrollExperience = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const conviteRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const veuRef = useRef<HTMLDivElement>(null);

  const quadroExibido = useRef(-1);
  const rafRef = useRef<number | null>(null);

  const [reveladoPeloScroll, setReveladoPeloScroll] = useState(false);
  const [videoPronto, setVideoPronto] = useState(false);

  const montado = useMontado();
  const menosMovimento = usePrefereMenosMovimento();

  // Só faz sentido perguntar ao navegador quando existe navegador.
  const fonte = useMemo(() => (montado ? escolherFonteDoHero() : null), [montado]);

  // Sem movimento o percurso não acontece: o conteúdo já nasce clicável.
  const revelado = menosMovimento || reveladoPeloScroll;

  /* Um quadro de trabalho: lê a geometria, escolhe o quadro, ajusta o texto. */
  const atualizar = useCallback(() => {
    rafRef.current = null;

    const secao = secaoRef.current;
    if (!secao) return;

    const percorrivel = secao.offsetHeight - window.innerHeight;
    const progresso =
      percorrivel > 0 ? limitar(-secao.getBoundingClientRect().top / percorrivel) : 0;

    const quadro = progressoParaQuadro(progresso);
    if (quadro !== quadroExibido.current) {
      quadroExibido.current = quadro;
      playerRef.current?.seekTo(quadro);
    }

    const convite = conviteRef.current;
    if (convite) {
      const some = faixa(progresso, HERO_CONVITE_FADE_INICIO, HERO_CONVITE_FADE_FIM);
      convite.style.opacity = (1 - some).toFixed(3);
    }

    const entrada = suavizarSaida(
      faixa(progresso, HERO_REVELACAO_INICIO, HERO_REVELACAO_FIM),
    );

    const final = finalRef.current;
    if (final) {
      final.style.opacity = entrada.toFixed(3);
      final.style.transform = `translate3d(0, ${((1 - entrada) * 18).toFixed(2)}px, 0)`;
    }

    const veu = veuRef.current;
    if (veu) veu.style.opacity = entrada.toFixed(3);

    const jaVisivel = entrada > 0.5;
    setReveladoPeloScroll((atual) => (atual === jaVisivel ? atual : jaVisivel));
  }, []);

  /* Scroll e resize agendam no máximo um cálculo por frame de tela. */
  useEffect(() => {
    if (!montado || menosMovimento) return;

    const agendar = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(atualizar);
      }
    };

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar, { passive: true });
    agendar();

    return () => {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [atualizar, montado, menosMovimento]);

  /*
   * Pré-carga da fonte UHD. O poster só sai quando o navegador já conseguiu
   * decodificar dados reais do vídeo. Não existe mais timeout que esconda o
   * poster à força: em conexão lenta é melhor manter uma imagem UHD nítida do
   * que revelar um frame preto ou incompleto.
   */
  useEffect(() => {
    if (!fonte || menosMovimento) return;

    setVideoPronto(false);

    const sonda = document.createElement('video');
    sonda.preload = 'auto';
    sonda.muted = true;
    sonda.playsInline = true;

    const pronto = () => setVideoPronto(true);
    sonda.addEventListener('loadeddata', pronto, { once: true });
    sonda.addEventListener('canplay', pronto, { once: true });

    sonda.src = fonte;
    sonda.load();

    return () => {
      sonda.removeEventListener('loadeddata', pronto);
      sonda.removeEventListener('canplay', pronto);
      sonda.removeAttribute('src');
      sonda.load();
    };
  }, [fonte, menosMovimento]);

  return (
    <section id="inicio" ref={secaoRef} className="hero-scroll relative bg-preto">
      <noscript>
        {/* Sem JS não há percurso: uma tela só, com o conteúdo já visível. */}
        <style>{`
          .hero-scroll { height: 100vh; }
          .hero-convite { display: none; }
          .hero-final { opacity: 1 !important; transform: none !important; }
          .hero-veu { opacity: 1 !important; }
        `}</style>
      </noscript>

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-preto">
        {/* Caixa que cobre a viewport mantendo a proporção vertical do vídeo. */}
        <div className="hero-cobertura">
          <Image
            src={HERO_POSTER_INICIO}
            alt="Vista aérea de uma casa de alto padrão com piscina, cercada por mata e montanhas ao pôr do sol."
            fill
            priority
            unoptimized
            sizes="100vw"
            className={`hero-poster-inicio object-cover transition-opacity duration-500 ${
              videoPronto ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <Image
            src={HERO_POSTER_FINAL}
            alt="Sala de estar da casa, com abertura para a área externa, mesa de jantar e floresta ao fundo."
            fill
            unoptimized
            sizes="100vw"
            className="hero-poster-final object-cover"
          />

          {fonte && !menosMovimento ? (
            <Player
              ref={playerRef}
              component={RealEstateHero}
              durationInFrames={HERO_DURATION_IN_FRAMES}
              compositionWidth={HERO_WIDTH}
              compositionHeight={HERO_HEIGHT}
              fps={HERO_FPS}
              initialFrame={0}
              inputProps={{ src: fonte }}
              autoPlay={false}
              loop={false}
              controls={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
              showVolumeControls={false}
              numberOfSharedAudioTags={0}
              acknowledgeRemotionLicense
              className="pointer-events-none absolute inset-0"
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </div>

        {/* Escurecimento leve e permanente: legibilidade sem apagar o movimento. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-preto/15"
        />

        {/* Véu que entra junto com o conteúdo comercial, no fim do percurso. */}
        <div
          ref={veuRef}
          aria-hidden="true"
          className="hero-veu veu-hero pointer-events-none absolute inset-0"
          style={{ opacity: 0 }}
        />

        <div ref={conviteRef} className="hero-convite absolute inset-0">
          <ScrollIndicator />
        </div>

        <div
          ref={finalRef}
          className="hero-final absolute inset-0 will-change-[opacity,transform]"
          style={{ opacity: 0, transform: 'translate3d(0, 18px, 0)' }}
        >
          <HeroFinalContent visivel={revelado} />
        </div>
      </div>
    </section>
  );
};
