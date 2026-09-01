'use client'

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

const SHELL =
  'w-full rounded-[12px] border bg-surface-2 px-4 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-150 focus:border-gold focus:outline-none'

interface BaseProps {
  label: string
  hint?: string
  error?: string | null
  icon?: ReactNode
  counter?: string
}

export function TextField({
  label,
  hint,
  error,
  icon,
  className = '',
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${SHELL} h-13 py-3 ${icon ? 'pl-11' : ''} ${
            error ? 'border-danger' : 'border-line'
          } ${className}`}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextAreaField({
  label,
  hint,
  error,
  counter,
  className = '',
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${SHELL} min-h-24 resize-none py-3 ${error ? 'border-danger' : 'border-line'} ${className}`}
        {...rest}
      />
      <div className="mt-1.5 flex items-start justify-between gap-3">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-[13px] text-muted">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {counter ? <span className="text-[12px] text-muted tabular-nums">{counter}</span> : null}
      </div>
    </div>
  )
}
