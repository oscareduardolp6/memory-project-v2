import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { SessionRecord } from '../firebase/sessions'

// Validated pair (dataviz validate_palette.js, dark, surface #12151d): all checks pass.
const SERIES_ROUND = '#5b82f0'
const SERIES_AVG = '#d9772f'
const AVG_WINDOW = 5

const HEIGHT = 240
const M = { top: 12, right: 14, bottom: 26, left: 40 }

const pct = (s: SessionRecord) => (s.correct / s.wordCount) * 100

export function movingAverage(values: number[], window = AVG_WINDOW): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}

const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function ProgressChart({ sessions }: { sessions: SessionRecord[] }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const values = useMemo(() => sessions.map(pct), [sessions])
  const avg = useMemo(() => movingAverage(values), [values])

  const n = sessions.length
  const innerW = Math.max(10, width - M.left - M.right)
  const innerH = HEIGHT - M.top - M.bottom
  const x = (i: number) => M.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => M.top + innerH - (v / 100) * innerH
  const path = (vs: number[]) => vs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')

  const showDots = n <= 60
  const xTicks = useMemo(() => {
    if (n === 0) return []
    const count = Math.min(n, Math.max(2, Math.floor(innerW / 70)))
    const set = new Set<number>()
    for (let k = 0; k < count; k++) set.add(Math.round((k / Math.max(1, count - 1)) * (n - 1)))
    return [...set]
  }, [n, innerW])

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = n <= 1 ? 0 : Math.round((px / rect.width) * (n - 1))
    setActive(Math.min(n - 1, Math.max(0, i)))
  }

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const d = e.key === 'ArrowRight' ? 1 : -1
      setActive((a) => Math.min(n - 1, Math.max(0, (a ?? (d > 0 ? -1 : n)) + d)))
    } else if (e.key === 'Escape') setActive(null)
  }

  const a = active !== null ? sessions[active] : undefined
  const TIP_W = 192
  // Sit beside the crosshair (right side first) so the tooltip never hides the hovered point.
  const tipLeft =
    active === null
      ? 0
      : x(active) + 12 + TIP_W <= width
        ? x(active) + 12
        : Math.max(0, x(active) - 12 - TIP_W)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-2">
          <svg width="18" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="17" y2="4" stroke={SERIES_ROUND} strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="4" r="3" fill={SERIES_ROUND} />
          </svg>
          % de aciertos por ronda
        </span>
        <span className="flex items-center gap-2">
          <svg width="18" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="17" y2="4" stroke={SERIES_AVG} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
          </svg>
          Media de las últimas {AVG_WINDOW}
        </span>
      </div>

      <div ref={wrap} className="relative">
        <svg
          width={width}
          height={HEIGHT}
          className="block overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-lg"
          role="img"
          aria-label={`Gráfica de ${n} rondas. Usa las flechas para recorrerlas.`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + innerW} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth="1" />
              <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-faint text-[11px] tabular-nums">
                {t}%
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text key={i} x={x(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-faint text-[11px] tabular-nums">
              {i + 1}
            </text>
          ))}

          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + innerH} stroke="var(--color-muted)" strokeWidth="1" />
          )}

          <path d={path(values)} fill="none" stroke={SERIES_ROUND} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path
            d={path(avg)}
            fill="none"
            stroke={SERIES_AVG}
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {values.map((v, i) =>
            showDots || i === active ? (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={i === active ? 5.5 : 4}
                fill={SERIES_ROUND}
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            ) : null,
          )}
          {active !== null && (
            <circle cx={x(active)} cy={y(avg[active] ?? 0)} r={4} fill={SERIES_AVG} stroke="var(--color-surface)" strokeWidth="2" />
          )}

          <rect
            x={M.left - 8}
            y={M.top}
            width={innerW + 16}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {a && active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-48 rounded-xl border border-line bg-surface-2/95 p-3 text-xs shadow-xl backdrop-blur"
            style={{ left: tipLeft }}
          >
            <p className="mb-2 text-muted">
              Ronda {active + 1} · {dateFmt.format(a.createdAt)}
            </p>
            <p className="flex items-center gap-2">
              <span className="h-0.5 w-3 rounded" style={{ background: SERIES_ROUND }} />
              <span className="text-sm font-semibold text-ink tabular-nums">{Math.round(values[active] ?? 0)}%</span>
              <span className="text-muted">
                {a.correct}/{a.wordCount}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2">
              <span className="h-0.5 w-3 rounded" style={{ background: SERIES_AVG }} />
              <span className="text-sm font-semibold text-ink tabular-nums">{Math.round(avg[active] ?? 0)}%</span>
              <span className="text-muted">media</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
