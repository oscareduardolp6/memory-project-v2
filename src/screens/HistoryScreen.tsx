import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProgressChart } from '../components/ProgressChart'
import { Button, Card, Spinner } from '../components/ui'
import { listSessions, type SessionRecord } from '../firebase/sessions'

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; sessions: SessionRecord[] }

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
const pct = (s: SessionRecord) => Math.round((s.correct / s.wordCount) * 100)

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
    </div>
  )
}

export function HistoryScreen({ uid, onBack }: { uid: string; onBack: () => void }) {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [showAll, setShowAll] = useState(false)

  const fetchData = useCallback(() => {
    setLoad({ status: 'loading' })
    listSessions(uid)
      .then((sessions) => setLoad({ status: 'ready', sessions }))
      .catch(() => setLoad({ status: 'error' }))
  }, [uid])

  useEffect(fetchData, [fetchData])

  const all = load.status === 'ready' ? load.sessions : []
  const counts = useMemo(() => [...new Set(all.map((s) => s.wordCount))].sort((a, b) => a - b), [all])
  const sessions = useMemo(() => (filter === 'all' ? all : all.filter((s) => s.wordCount === filter)), [all, filter])

  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    const last10 = sessions.slice(-10)
    const avg10 = last10.reduce((acc, s) => acc + s.correct / s.wordCount, 0) / last10.length
    const best = Math.max(...sessions.map(pct))
    const perfect = sessions.filter((s) => s.correct === s.wordCount).map((s) => s.wordCount)
    return {
      rounds: sessions.length,
      avg10: Math.round(avg10 * 100),
      best,
      maxPerfect: perfect.length ? Math.max(...perfect) : null,
    }
  }, [sessions])

  const recent = useMemo(() => sessions.slice().reverse(), [sessions])
  const visible = showAll ? recent : recent.slice(0, 15)

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Tu progreso</h1>
        <Button variant="ghost" onClick={onBack}>
          ← Volver
        </Button>
      </div>

      {load.status === 'loading' && (
        <div className="grid place-items-center py-24 text-muted">
          <Spinner className="size-7" />
        </div>
      )}

      {load.status === 'error' && (
        <Card className="space-y-4 text-center">
          <p className="text-muted">No se pudo cargar tu historial.</p>
          <Button onClick={fetchData}>Reintentar</Button>
        </Card>
      )}

      {load.status === 'ready' && all.length === 0 && (
        <Card className="text-center text-muted">
          Aún no hay rondas guardadas. Juega una y compara tus respuestas para empezar a ver tu progreso.
        </Card>
      )}

      {load.status === 'ready' && all.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por número de palabras">
            {(['all', ...counts] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3.5 py-1 text-sm tabular-nums transition ${
                  filter === c
                    ? 'border-accent/60 bg-accent/15 text-accent'
                    : 'border-line text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {c === 'all' ? 'Todas' : `${c} palabras`}
              </button>
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Rondas" value={String(stats.rounds)} />
              <Stat label="Promedio" value={`${stats.avg10}%`} hint="últimas 10" />
              <Stat label="Mejor ronda" value={`${stats.best}%`} />
              <Stat label="Máximo perfecto" value={stats.maxPerfect ? String(stats.maxPerfect) : '—'} hint="palabras al 100%" />
            </div>
          )}

          <Card className="!p-4 sm:!p-6">
            {sessions.length > 0 ? <ProgressChart sessions={sessions} /> : null}
          </Card>

          <Card className="!p-0 overflow-hidden">
            <table className="w-full text-sm">
              <caption className="px-5 pt-4 pb-2 text-left text-xs font-semibold tracking-wide text-muted uppercase">
                Rondas recientes
              </caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-faint">
                  <th className="px-5 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 text-right font-medium">Palabras</th>
                  <th className="px-3 py-2 text-right font-medium">Aciertos</th>
                  <th className="px-5 py-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-2.5 text-muted">{dateFmt.format(s.createdAt)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{s.wordCount}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{s.correct}</td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{pct(s)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent.length > visible.length && (
              <div className="border-t border-line p-2 text-center">
                <Button variant="ghost" onClick={() => setShowAll(true)}>
                  Ver todas ({recent.length})
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
