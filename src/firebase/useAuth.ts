import { useCallback, useEffect, useState } from 'react'
import { getAuth } from './client'
import { OWNER_UID, firebaseEnabled } from './config'

const HAD_LOGIN_KEY = 'mp.hadLogin'

export interface AuthUser {
  uid: string
  name: string | null
  email: string | null
  photoURL: string | null
}

export type AuthStatus = 'off' | 'idle' | 'loading' | 'ready'

function readFlag(): boolean {
  try {
    return localStorage.getItem(HAD_LOGIN_KEY) === '1'
  } catch {
    return false
  }
}

function writeFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(HAD_LOGIN_KEY, '1')
    else localStorage.removeItem(HAD_LOGIN_KEY)
  } catch {
    /* storage unavailable: session just won't auto-restore */
  }
}

let unsubscribe: (() => void) | null = null

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>(() =>
    !firebaseEnabled ? 'off' : readFlag() ? 'loading' : 'idle',
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  const subscribe = useCallback(async () => {
    if (unsubscribe) return
    const [auth, { onAuthStateChanged }] = await Promise.all([getAuth(), import('firebase/auth')])
    unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, name: u.displayName, email: u.email, photoURL: u.photoURL } : null)
      setStatus('ready')
      if (!u) writeFlag(false)
    })
  }, [])

  // Only previous owners of a session pay the cost of loading Firebase on startup.
  useEffect(() => {
    if (firebaseEnabled && readFlag()) {
      subscribe().catch(() => setStatus('idle'))
    }
  }, [subscribe])

  const signIn = useCallback(async () => {
    setError(null)
    setStatus('loading')
    try {
      await subscribe()
      const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([getAuth(), import('firebase/auth')])
      await signInWithPopup(auth, new GoogleAuthProvider())
      writeFlag(true)
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('No se pudo iniciar sesión')
      }
      setStatus((s) => (s === 'loading' ? 'ready' : s))
    }
  }, [subscribe])

  const signOut = useCallback(async () => {
    writeFlag(false)
    const [auth, { signOut }] = await Promise.all([getAuth(), import('firebase/auth')])
    await signOut(auth)
  }, [])

  const isOwner = Boolean(user && OWNER_UID && user.uid === OWNER_UID)

  return { status, user, isOwner, error, signIn, signOut }
}
