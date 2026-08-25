'use client';

import { useEffect, useState } from 'react';
import { business } from '@/lib/business';
import { Logo } from '../ui/Logo';

const NAV = [
  { href: '#inicio', label: 'Início' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#sobre', label: 'Sobre nós' },
  { href: '#promocoes', label: 'Promoções' },
  { href: '#contato', label: 'Contato' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#inicio');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // marca o item da navbar correspondente à seção visível
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/25 bg-ember/70 py-2.5 backdrop-blur-xl' : 'border-b border-transparent py-5'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[86rem] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" className="flex shrink-0 items-center gap-3 text-white">
          <Logo size={scrolled ? 36 : 44} className="transition-all duration-300" />
          <span className={`font-extrabold tracking-tight transition-all ${scrolled ? 'text-base' : 'text-lg'}`}>
            {business.name}
          </span>
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? 'page' : undefined}
              className="relative py-1 text-sm font-semibold text-white/85 transition-colors hover:text-white"
            >
              {item.label}
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-white transition-all duration-300 ${
                  active === item.href ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#cardapio"
            className="hidden rounded-full border border-white/55 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white hover:text-white sm:inline-flex"
          >
            Peça agora
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="rounded-full p-2.5 text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="menu-mobile" aria-label="Navegação" className="mt-2.5 border-y border-white/25 bg-ember/85 backdrop-blur-xl lg:hidden">
          <ul className="mx-auto flex w-full max-w-[86rem] flex-col px-5 py-2 sm:px-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/18 py-3.5 font-semibold text-white last:border-0"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
