'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** Linha menor sob o rótulo, como no CTA principal. */
  hint?: string
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-linear-to-b from-gold-light to-gold text-[#221703] font-semibold hover:brightness-[1.06] active:brightness-95 disabled:from-gold/40 disabled:to-gold/40 disabled:text-[#221703]/60',
  outline:
    'border border-line-gold text-gold hover:bg-gold/8 active:bg-gold/12 disabled:opacity-45',
  ghost: 'border border-line text-ink hover:bg-white/4 active:bg-white/6 disabled:opacity-45',
  danger:
    'border border-danger/50 text-danger hover:bg-danger/10 active:bg-danger/15 disabled:opacity-45',
}

/** Altura mínima de 48px: alvo de toque confortável no celular. */
const SIZES: Record<Size, string> = {
  md: 'min-h-12 px-5 text-[15px] rounded-[12px]',
  lg: 'min-h-14 px-6 text-base rounded-[14px]',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, hint, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex w-full items-center justify-center gap-2.5 transition-[filter,background-color,opacity] duration-200 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
      <span className="flex flex-col items-center leading-tight">
        <span>{children}</span>
        {hint && !loading ? (
          <span className="text-[11px] font-normal opacity-70">{hint}</span>
        ) : null}
      </span>
    </button>
  )
})
