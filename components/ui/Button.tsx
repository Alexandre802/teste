import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-bold transition-[transform,box-shadow,background-color,color] duration-200 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px';

const variants: Record<Variant, string> = {
  primary:
    'bg-cream text-ink shadow-[0_10px_30px_-10px_rgba(255,106,0,0.8)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_-10px_rgba(255,106,0,0.95)]',
  outline:
    'border border-cream/35 text-cream hover:-translate-y-0.5 hover:border-gold hover:text-gold',
  ghost: 'text-cream/85 hover:text-gold',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-8 py-4 text-base sm:text-lg',
} as const;

interface Common {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Common & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
