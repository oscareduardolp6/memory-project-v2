import { useEffect, useRef, useState } from 'react'
import { OWNER_UID } from '../firebase/config'
import type { useAuth } from '../firebase/useAuth'
import { Spinner } from './ui'

type Auth = ReturnType<typeof useAuth>

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  )
}

export function AuthButton({ auth, onOpenHistory }: { auth: Auth; onOpenHistory: () => void }) {
  const { status, user, isOwner, error, signIn, signOut } = auth
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (status === 'off') return null

  const iconBtn =
    'grid size-9 place-items-center rounded-full text-faint transition hover:bg-surface-2 hover:text-ink ' +
    'focus-visible:outline-2 focus-visible:outline-accent'

  if (status === 'loading') {
    return (
      <span className={iconBtn} aria-label="Cargando sesión">
        <Spinner className="size-4" />
      </span>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {error && <span className="text-xs text-bad">{error}</span>}
        <button type="button" className={iconBtn} onClick={signIn} title="Iniciar sesión con Google" aria-label="Iniciar sesión">
          <UserIcon />
        </button>
      </div>
    )
  }

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(user.uid)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked; the UID is still selectable */
    }
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="grid size-9 place-items-center overflow-hidden rounded-full border border-line transition hover:border-faint focus-visible:outline-2 focus-visible:outline-accent"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cuenta"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <UserIcon />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-up absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-line bg-surface-2 p-2 text-sm shadow-2xl shadow-black/50"
        >
          <div className="px-3 py-2">
            <p className="truncate font-medium">{user.name ?? 'Sesión iniciada'}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>

          {!OWNER_UID && (
            <div className="mx-1 my-1 rounded-xl bg-bg/60 p-3 text-xs">
              <p className="mb-1 text-muted">Tu UID (ponlo en VITE_OWNER_UID y en firestore.rules):</p>
              <code className="block break-all text-ink select-all">{user.uid}</code>
              <button type="button" onClick={copyUid} className="mt-2 text-accent hover:underline">
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          )}

          {OWNER_UID && !isOwner && (
            <p className="mx-1 my-1 rounded-xl bg-bg/60 p-3 text-xs text-muted">Esta cuenta no guarda progreso.</p>
          )}

          <div className="mt-1 border-t border-line pt-1">
            {isOwner && (
              <button
                type="button"
                role="menuitem"
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-surface-3"
                onClick={() => {
                  setOpen(false)
                  onOpenHistory()
                }}
              >
                Ver progreso
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-muted hover:bg-surface-3 hover:text-ink"
              onClick={() => {
                setOpen(false)
                void signOut()
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
