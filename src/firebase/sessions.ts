import type { RoundResult } from '../game/compare'
import { getDb } from './client'

export interface SessionRecord {
  id: string
  createdAt: Date
  wordCount: number
  correct: number
  incorrect: number
  positions: boolean[]
}

const sessionsPath = (uid: string) => ['users', uid, 'sessions'] as const

/** Stores only the score of a round — never the words themselves. */
export async function saveSession(uid: string, result: RoundResult): Promise<void> {
  const { db, firestore } = await getDb()
  await firestore.addDoc(firestore.collection(db, ...sessionsPath(uid)), {
    createdAt: firestore.serverTimestamp(),
    wordCount: result.positions.length,
    correct: result.correct,
    incorrect: result.incorrect,
    positions: result.positions,
  })
}

export async function listSessions(uid: string): Promise<SessionRecord[]> {
  const { db, firestore } = await getDb()
  const q = firestore.query(firestore.collection(db, ...sessionsPath(uid)), firestore.orderBy('createdAt', 'asc'))
  const snap = await firestore.getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      wordCount: data.wordCount,
      correct: data.correct,
      incorrect: data.incorrect,
      positions: data.positions ?? [],
    }
  })
}
