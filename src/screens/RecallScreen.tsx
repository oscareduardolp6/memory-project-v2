import { useEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { ScoreSummary } from '../components/ScoreSummary'
import { Button, Card } from '../components/ui'
import type { GameAction, GameState } from '../game/gameReducer'

interface Props {
  state: GameState
  dispatch: (a: GameAction) => void
  /** Extra status line under the score (e.g. "progreso guardado"). */
  saveSlot?: ReactNode
  /** Whether rounds are being recorded (owner signed in). */
  tracking?: boolean
}

export function RecallScreen({ state, dispatch, saveSlot, tracking = false }: Props) {
  const { chosen, answers, result, revealed, peeked } = state
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const checked = result !== null

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (checked) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [checked])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    dispatch({ type: 'CHECK' })
  }

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const next = inputs.current[i + 1]
    if (next) next.focus()
    else submit()
  }

  return (
    <div className="animate-fade-up space-y-5">
      <Card className="space-y-6">
        {checked ? (
          <div className="space-y-3">
            <ScoreSummary result={result} />
            {saveSlot}
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold">Escribe las palabras en orden</h1>
            <p className="text-sm text-muted">
              Enter pasa a la siguiente. No importan mayúsculas ni acentos.
            </p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6" autoComplete="off">
          <ol className="grid gap-3 sm:grid-cols-2">
            {chosen.map((word, i) => {
              const ok = result?.positions[i]
              const showAnswer = revealed || (checked && !ok)
              const tone = !checked
                ? 'border-line focus-within:border-accent'
                : ok
                  ? 'border-good/60 bg-good/[0.07]'
                  : 'border-bad/60 bg-bad/[0.07]'
              return (
                <li key={i} className={`rounded-xl border bg-bg/50 transition ${tone}`}>
                  <label className="flex items-center gap-3 px-3">
                    <span className="w-6 shrink-0 text-right text-xs font-semibold text-faint tabular-nums">
                      {i + 1}
                    </span>
                    <input
                      ref={(el) => {
                        inputs.current[i] = el
                      }}
                      value={answers[i] ?? ''}
                      onChange={(e) => dispatch({ type: 'SET_ANSWER', index: i, value: e.target.value })}
                      onKeyDown={onKeyDown(i)}
                      readOnly={checked}
                      aria-label={`Palabra ${i + 1}`}
                      placeholder={`Palabra ${i + 1}`}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-faint/70"
                    />
                    {checked && (
                      <span className={`text-lg ${ok ? 'text-good' : 'text-bad'}`} aria-label={ok ? 'Correcta' : 'Incorrecta'}>
                        {ok ? '✓' : '✗'}
                      </span>
                    )}
                  </label>
                  {showAnswer && (
                    <p className={`border-t border-line/60 px-3 py-1.5 pl-12 text-sm ${checked ? 'text-ink/80' : 'text-warn'}`}>
                      {word}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>

          {checked ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" className="sm:flex-1" onClick={() => dispatch({ type: 'REPLAY' })}>
                Otra ronda de {chosen.length}
              </Button>
              <Button className="sm:flex-1" onClick={() => dispatch({ type: 'RESET' })}>
                Cambiar cantidad
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="primary" className="sm:flex-1">
                  Comparar
                </Button>
                <Button className="sm:flex-1" onClick={() => dispatch({ type: 'TOGGLE_REVEAL' })}>
                  {revealed ? 'Ocultar respuestas' : 'Mostrar respuestas'}
                </Button>
              </div>
              {peeked && tracking && (
                <p className="text-center text-xs text-muted">
                  Viste las respuestas: esta ronda no se registrará en tu progreso.
                </p>
              )}
            </div>
          )}
        </form>
      </Card>

      {!checked && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>
            Cancelar ronda
          </Button>
        </div>
      )}
    </div>
  )
}
