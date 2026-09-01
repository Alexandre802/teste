/**
 * Identidade do MD_agenda.
 *
 * O símbolo é um calendário com uma tesoura dentro — agendamento e barbearia
 * em um traço só. Sem gradiente, sem brilho: contorno dourado sobre o fundo
 * escuro, do jeito que aguenta 16px na aba do navegador.
 */

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="4.25"
        y="6.75"
        width="23.5"
        height="21"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M10.5 3.5v6M21.5 3.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.25 13.25h23.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path
        d="M10.6 16.4 21 24.2M21.4 16.4 11 24.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10.1" cy="24.4" r="1.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="21.9" cy="24.4" r="1.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function Wordmark({
  size = 'md',
  tagline = true,
  businessName = 'MD_agenda',
}: {
  size?: 'sm' | 'md' | 'lg'
  tagline?: boolean
  businessName?: string
}) {
  const mark = size === 'lg' ? 40 : size === 'md' ? 32 : 26
  const text = size === 'lg' ? 'text-[28px]' : size === 'md' ? 'text-[22px]' : 'text-[18px]'
  const [prefix, ...rest] = businessName.split('_')
  const suffix = rest.join('_')

  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={mark} className="text-gold" />
      <div className="leading-none">
        <div className={`${text} font-semibold tracking-tight`}>
          <span className="text-gold">{prefix}</span>
          {suffix ? <span className="text-ink">_{suffix}</span> : null}
        </div>
        {tagline ? (
          <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted">
            Seu horário, sem complicação
          </div>
        ) : null}
      </div>
    </div>
  )
}
