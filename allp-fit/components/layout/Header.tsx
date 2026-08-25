'use client';

/**
 * Cabeçalho: transparente sobre o hero e, a partir da primeira rolagem, vidro
 * fosco escuro. No celular vira menu de tela cheia.
 *
 * A seção visível é destacada por IntersectionObserver — o menu acompanha a
 * leitura em vez de ficar estático.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { BotaoLink } from '@/components/ui/Button';
import { academy, mensagens, whatsapp } from '@/data/academy';
import { menu } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState('inicio');
  const semMovimento = useReducedMotion();

  // sombra/vidro a partir da primeira rolagem
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  // seção em leitura
  useEffect(() => {
    const alvos = menu
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (alvos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel) setAtiva(visivel.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    );

    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, []);

  // menu aberto: trava a rolagem do fundo e fecha no Esc
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const noTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    window.addEventListener('keydown', noTeclado);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener('keydown', noTeclado);
    };
  }, [aberto]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500',
        rolou
          ? 'border-b border-white/8 bg-void/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
        <a
          href="#inicio"
          className="shrink-0 rounded-lg"
          aria-label="Allp Fit — início"
          onClick={() => setAberto(false)}
        >
          <Logo />
        </a>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {menu.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={ativa === item.id ? 'true' : undefined}
                  className={cn(
                    'relative block rounded-full px-3 py-2 text-[0.82rem] font-medium transition-colors duration-300',
                    ativa === item.id ? 'text-white' : 'text-cinza hover:text-white',
                  )}
                >
                  {item.rotulo}
                  {ativa === item.id && (
                    <motion.span
                      layoutId="menu-ativo"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-ciano shadow-[0_0_10px_var(--color-ciano)]"
                      transition={
                        semMovimento
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <BotaoLink href="#planos" tamanho="md" className="hidden sm:inline-flex">
            Quero treinar
          </BotaoLink>

          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-celular"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-white transition-colors hover:border-ciano/60 lg:hidden"
          >
            {aberto ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {/* fio de luz no pé do cabeçalho, quando ele ganha fundo */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-roxo to-transparent transition-opacity duration-500',
          rolou ? 'opacity-70' : 'opacity-0',
        )}
      />

      <AnimatePresence>
        {aberto && (
          <motion.div
            id="menu-celular"
            key="menu-celular"
            initial={semMovimento ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={semMovimento ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/8 lg:hidden"
          >
            <nav aria-label="Navegação" className="shell py-6">
              <ul className="grid gap-1">
                {menu.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={semMovimento ? false : { opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={() => setAberto(false)}
                      className="flex items-center justify-between border-b border-white/6 py-3.5 font-display text-lg font-bold text-white"
                    >
                      {item.rotulo}
                      <span aria-hidden className="text-sm text-cinza">
                        0{menu.indexOf(item) + 1}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 grid gap-3">
                <BotaoLink href="#planos" tamanho="lg" onClick={() => setAberto(false)}>
                  Ver planos
                </BotaoLink>
                <BotaoLink
                  href={whatsapp(mensagens.geral)}
                  variante="led"
                  tamanho="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar no WhatsApp
                </BotaoLink>
                <a
                  href={`tel:+${academy.telefone.e164}`}
                  className="pt-1 text-center text-sm text-cinza"
                >
                  {academy.telefone.exibicao}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
