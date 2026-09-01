import type { ReactNode } from 'react'
import { AlertTriangle, CalendarX2, Info } from 'lucide-react'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />
}

/** Esqueleto dos cards de serviço, no mesmo ritmo do conteúdo real. */
export function ServiceSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="surface-card p-4">
          <Skeleton className="mb-3 h-7 w-7 rounded-lg" />
          <Skeleton className="mb-2 h-4 w-4/5" />
          <Skeleton className="mb-3 h-3 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  )
}

export function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className="h-12" />
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-9 text-center">
      <span className="mb-3 text-muted">{icon ?? <CalendarX2 size={24} aria-hidden />}</span>
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description ? <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
  )
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'danger'
  title?: string
  children: ReactNode
}) {
  const styles = {
    info: 'border-line-strong bg-surface-2 text-muted',
    warning: 'border-warning/35 bg-warning/8 text-warning',
    danger: 'border-danger/40 bg-danger/8 text-danger',
  }[tone]

  const Icon = tone === 'info' ? Info : AlertTriangle

  return (
    <div role={tone === 'info' ? undefined : 'alert'} className={`flex gap-3 rounded-[12px] border px-4 py-3.5 text-sm ${styles}`}>
      <Icon size={17} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
      </div>
    </div>
  )
}
