import { WORDS } from '../data/words'
import { compareRound, type RoundResult } from './compare'
import { shuffle, type Rng } from './wordPicker'

export const MIN_WORDS = 1
export const MAX_WORDS = 100

export type Phase = 'setup' | 'memorize' | 'recall'

export interface GameState {
  phase: Phase
  targetCount: number
  /** Remaining words not yet shown this round. */
  deck: string[]
  /** Word currently on screen during `memorize`. */
  current: string | null
  /** Words the player decided to remember, in order. */
  chosen: string[]
  answers: string[]
  result: RoundResult | null
  revealed: boolean
  /** True if the answers were shown before checking; such rounds are not recorded. */
  peeked: boolean
}

export type GameAction =
  | { type: 'START'; count: number }
  | { type: 'SKIP' }
  | { type: 'KEEP' }
  | { type: 'SET_ANSWER'; index: number; value: string }
  | { type: 'CHECK' }
  | { type: 'TOGGLE_REVEAL' }
  | { type: 'REPLAY' }
  | { type: 'RESET' }

export const initialState: GameState = {
  phase: 'setup',
  targetCount: 10,
  deck: [],
  current: null,
  chosen: [],
  answers: [],
  result: null,
  revealed: false,
  peeked: false,
}

export function isValidCount(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_WORDS && n <= MAX_WORDS
}

function startRound(count: number, words: readonly string[], rng: Rng): GameState {
  const [current = null, ...deck] = shuffle(words, rng)
  return { ...initialState, phase: 'memorize', targetCount: count, current, deck }
}

/** Takes the next word off the deck; reshuffles skipped words back in if the deck runs dry. */
function drawNext(state: GameState, words: readonly string[], rng: Rng): Pick<GameState, 'current' | 'deck'> {
  if (state.deck.length > 0) {
    const [current = null, ...deck] = state.deck
    return { current, deck }
  }
  const pool = words.filter((w) => !state.chosen.includes(w) && w !== state.current)
  const [current = null, ...deck] = shuffle(pool, rng)
  return { current, deck }
}

export function createGameReducer(words: readonly string[] = WORDS, rng: Rng = Math.random) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'START':
        if (!isValidCount(action.count)) return state
        return startRound(action.count, words, rng)

      case 'SKIP':
        if (state.phase !== 'memorize') return state
        return { ...state, ...drawNext(state, words, rng) }

      case 'KEEP': {
        if (state.phase !== 'memorize' || state.current === null) return state
        const chosen = [...state.chosen, state.current]
        if (chosen.length >= state.targetCount) {
          return {
            ...state,
            phase: 'recall',
            chosen,
            current: null,
            answers: chosen.map(() => ''),
          }
        }
        return { ...state, chosen, ...drawNext({ ...state, chosen }, words, rng) }
      }

      case 'SET_ANSWER': {
        if (state.phase !== 'recall' || state.result) return state
        const answers = state.answers.slice()
        answers[action.index] = action.value
        return { ...state, answers }
      }

      case 'CHECK':
        if (state.phase !== 'recall' || state.result) return state
        return { ...state, result: compareRound(state.answers, state.chosen) }

      case 'TOGGLE_REVEAL':
        if (state.phase !== 'recall') return state
        return {
          ...state,
          revealed: !state.revealed,
          peeked: state.peeked || (!state.revealed && state.result === null),
        }

      case 'REPLAY':
        return startRound(state.targetCount, words, rng)

      case 'RESET':
        return { ...initialState, targetCount: state.targetCount }
    }
  }
}

export const gameReducer = createGameReducer()
