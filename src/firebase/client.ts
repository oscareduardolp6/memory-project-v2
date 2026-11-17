import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { firebaseConfig } from './config'

let appPromise: Promise<FirebaseApp> | null = null
let authPromise: Promise<Auth> | null = null

/** Firebase is only downloaded the first time one of these is called. */
export function getApp(): Promise<FirebaseApp> {
  appPromise ??= import('firebase/app').then(({ initializeApp }) =>
    initializeApp(firebaseConfig as Record<string, string>),
  )
  return appPromise
}

export function getAuth(): Promise<Auth> {
  authPromise ??= Promise.all([getApp(), import('firebase/auth')]).then(([app, { getAuth }]) => getAuth(app))
  return authPromise
}

export async function getDb() {
  const [app, firestore] = await Promise.all([getApp(), import('firebase/firestore')])
  return { db: firestore.getFirestore(app), firestore }
}
