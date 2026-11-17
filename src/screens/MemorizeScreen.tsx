import { useEffect, useRef } from 'react'
import { Button, Card, Kbd } from '../components/ui'

interface Props {
  word: string | null
  kept: number
  total: number
  onSkip: () => void
  onKeep: () => void
  onCancel: () => void
}

export function MemorizeScreen({ word, kept, total, onSkip, onKeep, onCancel }: Props) {
  const handlers = useRef({ onSkip, onKeep })
  handlers.current = { onSkip, onKeep }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      if ((e.target as HTMLElement | null)?.closest('input, textarea, [role="menu"]')) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        handlers.current.onKeep()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlers.current.onSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pct = (kept / total) * 100

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-muted">
          Palabra <span className="font-semibold text-ink tabular-nums">{kept + 1}</span> de{' '}
          <span className="tabular-nums">{total}</span>
        </p>
        <Button variant="ghost" className="!px-3 !py-1.5" onClick={onCancel}>
          Cancelar ronda
        </Button>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={kept}
        aria-label="Palabras memorizadas"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent-2 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Card className="flex flex-col items-center gap-10 py-14 text-center sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">¿Puedes recordarla?</p>
        <p
          key={word ?? ''}
          className="animate-word-in max-w-full font-display text-[clamp(2rem,11vw,4.5rem)] leading-tight font-semibold tracking-tight break-words text-ink"
          aria-live="polite"
        >
          {word}
        </p>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <Button onClick={onSkip} className="py-3.5">
            <Kbd>←</Kbd> Otra
          </Button>
          <Button variant="primary" onClick={onKeep} className="py-3.5">
            La recuerdo <Kbd>→</Kbd>
          </Button>
        </div>
      </Card>
    </div>
  )
}
