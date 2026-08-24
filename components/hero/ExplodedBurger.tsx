'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { BURGER_LAYERS, SOURCE, type BurgerLayer } from './BurgerLayers';

/**
 * O lanche do hero se abre conforme a página rola.
 *
 * Em scroll = 0 as camadas estão encaixadas e o lanche parece montado; em
 * scroll = 1 cada uma voltou à posição exata da fotografia de referência.
 *
 * O progresso vem da geometria da seção do hero, e não de `useScroll` com
 * `target`: quando este componente monta, a ref do pai ainda está vazia e o
 * framer acabaria medindo a página inteira. Só `transform` é animado.
 */

interface Props {
  targetRef: React.RefObject<HTMLElement | null>;
}

function Layer({
  layer,
  progress,
  boxHeight,
  showLabel,
  priority,
}: {
  layer: BurgerLayer;
  progress: MotionValue<number>;
  boxHeight: MotionValue<number>;
  showLabel: boolean;
  priority: boolean;
}) {
  // shift é dado em pixels da foto original: converte para a altura atual
  const y = useTransform([progress, boxHeight], ([p, h]: number[]) =>
    (layer.shift * (h / SOURCE.h)) * (1 - p),
  );
  const labelOpacity = useTransform(progress, [0.35, 0.65], [0, 1]);

  return (
    <motion.div
      style={{
        y,
        top: `${(layer.top / SOURCE.h) * 100}%`,
        height: `${(layer.height / SOURCE.h) * 100}%`,
      }}
      className="absolute inset-x-0 will-change-transform"
    >
      <Image
        src={layer.src}
        alt=""
        width={SOURCE.w}
        height={layer.height}
        priority={priority}
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 40vw"
        className="h-full w-full object-contain"
      />
      {showLabel && (
        <motion.span
          style={{ opacity: labelOpacity }}
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold tracking-wide text-ember shadow-lg"
        >
          {layer.alt}
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ExplodedBurger({ targetRef }: Props) {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  const { scrollY } = useScroll();

  const boxRef = useRef<HTMLDivElement>(null);
  const boxHeight = useMotionValue<number>(SOURCE.h);
  const geometry = useRef({ start: 0, span: 1 });

  useEffect(() => {
    const measure = () => {
      const hero = targetRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        geometry.current = {
          start: rect.top + window.scrollY,
          span: Math.max(1, hero.offsetHeight - window.innerHeight),
        };
      }
      if (boxRef.current) boxHeight.set(boxRef.current.offsetHeight);
      setWide(window.matchMedia('(min-width: 1024px)').matches);
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [targetRef, boxHeight]);

  const raw = useTransform(scrollY, (y) => {
    const { start, span } = geometry.current;
    return Math.min(1, Math.max(0, (y - start) / span));
  });
  const progress = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.25 });
  const still = useMotionValue(0);

  return (
    <div
      ref={boxRef}
      className="relative mx-auto w-full max-w-[13.5rem] sm:max-w-[20rem] lg:max-w-[32rem]"
      style={{ aspectRatio: `${SOURCE.w} / ${SOURCE.h}` }}
      role="img"
      aria-label="Lanche da Michel Food House que se separa em pão, tomate, alface, queijo e carne conforme a página rola"
    >
      {BURGER_LAYERS.map((layer, i) => (
        <Layer
          key={layer.src}
          layer={layer}
          // sem movimento: o lanche fica montado e imóvel
          progress={reduce ? still : progress}
          boxHeight={boxHeight}
          showLabel={wide && !reduce}
          priority={i < 3}
        />
      ))}
    </div>
  );
}
