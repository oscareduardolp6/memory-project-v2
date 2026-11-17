import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:bg-[#a6baff] shadow-[0_8px_24px_-12px_rgb(143_168_255/0.8)]',
  secondary: 'bg-surface-2 text-ink border border-line hover:bg-surface-3',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  danger: 'text-bad hover:bg-bad/10',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden rounded-md border border-current/25 px-1.5 py-0.5 font-sans text-[11px] leading-none opacity-70 sm:inline-block">
      {children}
    </kbd>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 ${className}`}>
      {children}
    </section>
  )
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
