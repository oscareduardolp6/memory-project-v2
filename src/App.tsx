import { Suspense, lazy, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { AuthButton } from './components/AuthButton'
import { Button, Spinner } from './components/ui'
import { useAuth } from './firebase/useAuth'
import type { RoundResult } from './game/compare'
import { gameReducer, initialState, isValidCount } from './game/gameReducer'
import { MemorizeScreen } from './screens/MemorizeScreen'
import { RecallScreen } from './screens/RecallScreen'
import { SetupScreen } from './screens/SetupScreen'

const HistoryScreen = lazy(() => import('./screens/HistoryScreen').then((m) => ({ default: m.HistoryScreen })))

const LAST_COUNT_KEY = 'mp.lastCount'

function readLastCount(): number {
  try {
    const n = Number(localStorage.getItem(LAST_COUNT_KEY))
    return isValidCount(n) ? n : initialState.targetCount
  } catch {
    return initialState.targetCount
  }
}

function saveLastCount(n: number) {
  try {
    localStorage.setItem(LAST_COUNT_KEY, String(n))
  } catch {
    /* ignore */
  }
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => ({ ...initialState, targetCount: readLastCount() }))
  const [view, setView] = useState<'game' | 'history'>('game')
  const auth = useAuth()
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const savedFor = useRef<RoundResult | null>(null)

  const persist = useCallback(
    async (result: RoundResult) => {
      if (!auth.user) return
      setSaveStatus('saving')
      try {
        const { saveSession } = await import('./firebase/sessions')
        await saveSession(auth.user.uid, result)
        setSaveStatus('saved')
      } catch (e) {
        console.error(e)
        setSaveStatus('error')
      }
    },
    [auth.user],
  )

  // Record each checked round exactly once, only for the owner and only if answers weren't peeked.
  useEffect(() => {
    const { result, peeked } = state
    if (!result) {
      setSaveStatus('idle')
      return
    }
    if (!auth.isOwner || peeked || savedFor.current === result) return
    savedFor.current = result
    void persist(result)
  }, [state, auth.isOwner, persist])

  // Leaving the history view if the owner signs out.
  useEffect(() => {
    if (view === 'history' && !auth.isOwner) setView('game')
  }, [view, auth.isOwner])

  const goHome = () => {
    if (state.phase !== 'setup' && !state.result && !confirm('¿Salir de la ronda actual?')) return
    dispatch({ type: 'RESET' })
    setView('game')
  }

  const saveSlot = auth.isOwner ? (
    <p className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
      {state.peeked ? (
        'Ronda no registrada: viste las respuestas antes de comparar.'
      ) : saveStatus === 'saving' ? (
        <>
          <Spinner className="size-3.5" /> Guardando en tu progreso…
        </>
      ) : saveStatus === 'saved' ? (
        <>
          <span className="text-good">✓</span> Guardado en tu progreso
        </>
      ) : saveStatus === 'error' ? (
        <>
          <span className="text-bad">No se pudo guardar.</span>
          <button type="button" className="text-accent hover:underline" onClick={() => state.result && persist(state.result)}>
            Reintentar
          </button>
        </>
      ) : null}
    </p>
  ) : null

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <button type="button" onClick={goHome} className="group flex items-center gap-2.5 rounded-lg" aria-label="Inicio">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Memory<span className="text-accent">.</span>
          </span>
        </button>
        <AuthButton auth={auth} onOpenHistory={() => setView('history')} />
      </header>

      <main className="flex-1 pt-4 pb-16 sm:pt-10">
        {view === 'history' && auth.user ? (
          <Suspense
            fallback={
              <div className="grid place-items-center py-24 text-muted">
                <Spinner className="size-7" />
              </div>
            }
          >
            <HistoryScreen uid={auth.user.uid} onBack={() => setView('game')} />
          </Suspense>
        ) : state.phase === 'setup' ? (
          <SetupScreen
            key="setup"
            initialCount={state.targetCount}
            onStart={(n) => {
              saveLastCount(n)
              dispatch({ type: 'START', count: n })
            }}
          />
        ) : state.phase === 'memorize' ? (
          <MemorizeScreen
            word={state.current}
            kept={state.chosen.length}
            total={state.targetCount}
            onSkip={() => dispatch({ type: 'SKIP' })}
            onKeep={() => dispatch({ type: 'KEEP' })}
            onCancel={goHome}
          />
        ) : (
          <RecallScreen key={state.chosen.join('|')} state={state} dispatch={dispatch} saveSlot={saveSlot} tracking={auth.isOwner} />
        )}
      </main>

      <footer className="flex items-center justify-between py-6 text-xs text-faint">
        <span>Memory Project v2</span>
        {auth.isOwner && view === 'game' && (
          <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setView('history')}>
            Ver progreso
          </Button>
        )}
      </footer>
    </div>
  )
}
