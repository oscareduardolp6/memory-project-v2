import type { RoundResult } from '../game/compare'

function message(pct: number) {
  if (pct === 100) return '¡Perfecto!'
  if (pct >= 80) return 'Muy bien'
  if (pct >= 50) return 'Vas bien'
  return 'Sigue practicando'
}

export function ScoreSummary({ result }: { result: RoundResult }) {
  const total = result.positions.length
  const pct = Math.round((result.correct / total) * 100)
  const r = 34
  const c = 2 * Math.PI * r
  const color = pct === 100 ? 'var(--color-good)' : pct >= 50 ? 'var(--color-accent)' : 'var(--color-bad)'

  return (
    <div className="animate-fade-up flex items-center gap-5">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-xl font-semibold tabular-nums">
          {pct}%
        </span>
      </div>
      <div>
        <p className="font-display text-2xl font-semibold">{message(pct)}</p>
        <p className="text-muted">
          <span className="font-semibold text-good tabular-nums">{result.correct}</span> de{' '}
          <span className="tabular-nums">{total}</span> en el orden correcto
        </p>
      </div>
    </div>
  )
}
