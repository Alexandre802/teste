import { STATUS_LABEL, type AppointmentStatus } from '@/types'

const TONE: Record<AppointmentStatus, string> = {
  pending: 'border-warning/40 text-warning bg-warning/8',
  confirmed: 'border-success/40 text-success bg-success/8',
  completed: 'border-line-strong text-muted bg-white/4',
  cancelled: 'border-danger/40 text-danger bg-danger/8',
  no_show: 'border-danger/30 text-danger/85 bg-danger/6',
}

export function StatusBadge({
  status,
  className = '',
}: {
  status: AppointmentStatus
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${TONE[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
