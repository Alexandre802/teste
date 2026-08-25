import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-bold transition-[transform,box-shadow,background-color,color] duration-200 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px';

const variants: Record<Variant, string> = {
  primary:
    'bg-white text-cocoa shadow-[0_12px_30px_-12px_rgba(110,40,5,0.7)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(110,40,5,0.85)]',
  outline:
    'border border-white/55 text-white hover:-translate-y-0.5 hover:bg-white hover:text-cocoa',
  ghost: 'text-white/85 hover:text-white',
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
