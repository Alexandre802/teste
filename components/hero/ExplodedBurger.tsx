'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { BURGER_STACK } from './BurgerLayers';

/**
 * O lanche se desmonta conforme a página rola.
 *
 * O progresso é calculado da geometria da seção do hero, não de `useScroll`
 * com `target`: quando este componente monta, a ref do pai ainda está vazia e
 * o framer cairia em medir a página inteira — o lanche mal se mexeria.
 * A medição fica num ref, atualizada no mount e em resize, e é lida dentro da
 * transformação, que roda uma vez por frame.
 *
 * Só transform e opacity são animados, então a composição roda na GPU.
 * Degradações: `prefers-reduced-motion` entrega o lanche montado e imóvel;
 * telas pequenas e aparelhos fracos usam afastamento menor e dispensam os
 * rótulos de cada ingrediente.
 */

interface Props {
  /** Seção que define a janela de rolagem — o hero. */
  targetRef: React.RefObject<HTMLElement | null>;
}

function useDeviceTier() {
  const [tier, setTier] = useState<'full' | 'lite'>('full');

  useEffect(() => {
    const compute = () => {
      const narrow = window.matchMedia('(max-width: 767px)').matches;
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowMemory = (nav.deviceMemory ?? 8) <= 4;
      const veryFewCores = (navigator.hardwareConcurrency ?? 8) <= 2;
      setTier(narrow || lowMemory || veryFewCores ? 'lite' : 'full');
    };
    compute();
    window.addEventListener('resize', compute, { passive: true });
    return () => window.removeEventListener('resize', compute);
  }, []);

  return tier;
}

function Layer({
  progress,
  offset,
  spread,
  label,
  showLabel,
  children,
}: {
  progress: MotionValue<number>;
  offset: number;
  spread: number;
  label: string;
  showLabel: boolean;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [0, offset * spread]);
  const rotate = useTransform(progress, [0, 1], [0, offset * 2.2]);
  const labelOpacity = useTransform(progress, [0.3, 0.6], [0, 1]);

  return (
    <motion.div style={{ y, rotate }} className="absolute inset-0 will-change-transform">
      {children}
      {showLabel && (
        <motion.span
          style={{ opacity: labelOpacity, top: `${50 + offset * 16}%` }}
          className="pointer-events-none absolute right-0 -translate-y-1/2 rounded-full border border-white/25 bg-ink/75 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}

export default function ExplodedBurger({ targetRef }: Props) {
  const reduce = useReducedMotion();
  const tier = useDeviceTier();
  const { scrollY } = useScroll();

  // início da seção e quanto dela é rolável, em pixels
  const geometry = useRef({ start: 0, span: 1 });

  useEffect(() => {
    const measure = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      geometry.current = {
        start: rect.top + window.scrollY,
        span: Math.max(1, el.offsetHeight - window.innerHeight),
      };
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [targetRef]);

  const raw = useTransform(scrollY, (y) => {
    const { start, span } = geometry.current;
    return Math.min(1, Math.max(0, (y - start) / span));
  });

  const progress = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.25 });

  // no mobile o afastamento precisa caber acima do título, sem invadi-lo
  const spread = tier === 'lite' ? 52 : 168;
  const scale = useTransform(progress, [0, 1], [1, tier === 'lite' ? 0.95 : 0.9]);

  if (reduce) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-[14rem] halo sm:max-w-[22rem] lg:max-w-[34rem]">
        {BURGER_STACK.map(({ key, Component }) => (
          <Component key={key} className="absolute inset-0 h-full w-full" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      style={{ scale }}
      className="relative mx-auto aspect-square w-full max-w-[14rem] halo sm:max-w-[22rem] lg:max-w-[34rem]"
      role="img"
      aria-label="Ilustração de um lanche da Michel Food House que se separa em pão, tomate, alface, queijo e carne conforme a página rola"
    >
      {BURGER_STACK.map(({ key, label, offset, Component }) => (
        <Layer
          key={key}
          progress={progress}
          offset={offset}
          spread={spread}
          label={label}
          showLabel={tier === 'full'}
        >
          <Component className="h-full w-full drop-shadow-[0_18px_28px_rgba(80,25,0,0.45)]" />
        </Layer>
      ))}
    </motion.div>
  );
}
