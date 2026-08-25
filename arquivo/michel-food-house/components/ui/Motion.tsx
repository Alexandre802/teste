'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';

/* ──────────────────────────── grão ────────────────────────────
   Ruído fino por cima de tudo. Gradiente puro dá aquele aspecto
   plástico de render; o grão devolve textura e some com o "liso
   demais" sem custar frame nenhum (é uma imagem estática). */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.14] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        backgroundSize: '140px 140px',
      }}
    />
  );
}

/* ─────────────────────── barra de progresso ─────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-white/85"
    />
  );
}

/* ──────────────────────────── marquise ────────────────────────
   Faixa correndo, com a direção e a velocidade reagindo ao scroll.
   É o que dá cara de lanchonete de rua em vez de template. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1200, 0, 1200], [-4, 1, 4], { clamp: false });
  const direction = useRef(1);

  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = direction.current * 1.6 * (delta / 1000);
    const f = factor.get();
    direction.current = f < 0 ? -1 : 1;
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const linha = (
    <span className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="flex items-center gap-8">
          <span>{t}</span>
          <span className="text-white/50" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={`relative overflow-hidden border-y border-white/25 bg-white/10 py-3 ${className}`}
      aria-hidden="true"
    >
      <motion.div
        style={reduce ? undefined : { x }}
        className="flex whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.2em] text-white"
      >
        {linha}
        {linha}
        {linha}
        {linha}
      </motion.div>
    </div>
  );
}

/** wrap circular usado pela marquise */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/* ─────────────────── título revelado palavra a palavra ─────── */
export function SplitHeading({
  text,
  className = '',
  id,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  const reduce = useReducedMotion();
  const words = text.split(' ');

  if (reduce) return (
    <Tag id={id} className={className}>
      {text}
    </Tag>
  );

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ staggerChildren: 0.07 }}
        className="inline-flex flex-wrap justify-inherit"
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em]">
            <motion.span
              variants={{
                hidden: { y: '110%', opacity: 0 },
                shown: { y: '0%', opacity: 1 },
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {w}
              {i < words.length - 1 && ' '}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/* ───────────────────── número que sobe ao aparecer ─────────── */
export function CountUp({
  to,
  decimals = 0,
  duration = 1.2,
  className,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000));
          // desaceleração no fim, para o número "assentar"
          setShown(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/* ───────────────── inclinação 3D suave no ponteiro ─────────── */
export function useTilt(max = 7) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 240, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 240, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { ref, onMove, onLeave, rotateX: rx as MotionValue<number>, rotateY: ry as MotionValue<number> };
}

/* ───────────────────── deslocamento por parallax ───────────── */
export function useParallax(distance = 40) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return { ref, y: reduce ? undefined : y };
}
