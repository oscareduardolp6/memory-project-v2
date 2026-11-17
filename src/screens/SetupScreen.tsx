import { useState, type FormEvent } from 'react'
import { Button, Card } from '../components/ui'
import { MAX_WORDS, MIN_WORDS, isValidCount } from '../game/gameReducer'

const PRESETS = [5, 10, 15, 20, 30]

const STEPS = [
  ['Elige', 'Te mostramos palabras al azar; quédate con las que puedas recordar.'],
  ['Memoriza', 'Repite hasta juntar la cantidad que elegiste. El orden importa.'],
  ['Recuerda', 'Escríbelas en el mismo orden y compara tus respuestas.'],
] as const

export function SetupScreen({ initialCount, onStart }: { initialCount: number; onStart: (n: number) => void }) {
  const [value, setValue] = useState(String(initialCount))
  const n = Number(value)
  const valid = value.trim() !== '' && isValidCount(n)

  const step = (delta: number) => {
    const next = Math.min(MAX_WORDS, Math.max(MIN_WORDS, (Number.isFinite(n) ? Math.round(n) : 0) + delta))
    setValue(String(next))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) onStart(n)
  }

  return (
    <div className="animate-fade-up space-y-8">
      <Card>
        <form onSubmit={submit} className="flex flex-col items-center gap-7 text-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Nueva ronda</p>
            <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl">
              ¿Cuántas palabras quieres recordar?
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button aria-label="Menos" className="size-12 !p-0 text-xl" onClick={() => step(-1)}>
              −
            </Button>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_WORDS}
              max={MAX_WORDS}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Cantidad de palabras"
              aria-invalid={!valid}
              className={`w-28 rounded-2xl border bg-bg/60 py-3 text-center font-display text-4xl font-semibold tabular-nums outline-none transition focus:border-accent ${
                valid ? 'border-line' : 'border-bad/70'
              }`}
            />
            <Button aria-label="Más" className="size-12 !p-0 text-xl" onClick={() => step(1)}>
              +
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Cantidades rápidas">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue(String(p))}
                className={`rounded-full border px-4 py-1.5 text-sm tabular-nums transition ${
                  n === p
                    ? 'border-accent/60 bg-accent/15 text-accent'
                    : 'border-line text-muted hover:border-faint hover:text-ink'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <p className={`-mt-3 h-4 text-xs ${valid ? 'text-transparent' : 'text-bad'}`}>
            Escribe un número entero entre {MIN_WORDS} y {MAX_WORDS}.
          </p>

          <Button type="submit" variant="primary" disabled={!valid} className="w-full max-w-xs py-3.5 text-base">
            Empezar
          </Button>
        </form>
      </Card>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="rounded-2xl border border-line/70 bg-surface/40 p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <span className="grid size-5 place-items-center rounded-full bg-surface-3 text-[11px] text-accent">
                {i + 1}
              </span>
              {title}
            </p>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
