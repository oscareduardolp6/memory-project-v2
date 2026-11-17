import { describe, expect, it } from 'vitest'
import { WORDS } from '../data/words'
import { compareRound, isMatch, normalize } from './compare'
import { createGameReducer, initialState, type GameAction, type GameState } from './gameReducer'

const reducer = createGameReducer()
const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(reducer, state)

function playRound(state: GameState, count: number, skipsBetween = 1): GameState {
  let s = run(state, { type: 'START', count })
  expect(s.phase).toBe('memorize')
  while (s.phase === 'memorize') {
    for (let i = 0; i < skipsBetween; i++) s = reducer(s, { type: 'SKIP' })
    s = reducer(s, { type: 'KEEP' })
  }
  return s
}

describe('word list', () => {
  it('has a large set of unique single tokens', () => {
    expect(WORDS.length).toBeGreaterThan(800)
    expect(new Set(WORDS).size).toBe(WORDS.length)
    for (const w of WORDS) expect(w).toMatch(/^[a-záéíóúüñ]+$/)
  })
})

describe('compare', () => {
  it('ignores case, surrounding spaces and accents', () => {
    expect(normalize('  Árbol ')).toBe('arbol')
    expect(isMatch('ARBOL', 'árbol')).toBe(true)
    expect(isMatch('cancion', 'canción')).toBe(true)
  })

  it('keeps ñ distinct from n', () => {
    expect(isMatch('pina', 'piña')).toBe(false)
    expect(isMatch('PIÑA', 'piña')).toBe(true)
  })

  it('scores position by position', () => {
    const r = compareRound(['gato', 'perro', ''], ['gato', 'casa', 'sol'])
    expect(r).toEqual({ positions: [true, false, false], correct: 1, incorrect: 2 })
  })
})

describe('gameReducer', () => {
  it('rejects invalid counts', () => {
    for (const count of [0, -3, 2.5, 101, Number.NaN]) {
      expect(reducer(initialState, { type: 'START', count })).toBe(initialState)
    }
  })

  it('never repeats a word within a round (skipped or kept)', () => {
    let s = run(initialState, { type: 'START', count: 20 })
    const seen: string[] = []
    while (s.phase === 'memorize') {
      seen.push(s.current!)
      s = reducer(s, { type: seen.length % 2 ? 'SKIP' : 'KEEP' })
    }
    expect(new Set(seen).size).toBe(seen.length)
    expect(s.chosen).toHaveLength(20)
  })

  it('moves to recall with one empty answer per chosen word', () => {
    const s = playRound(initialState, 5)
    expect(s.phase).toBe('recall')
    expect(s.answers).toEqual(['', '', '', '', ''])
  })

  it('checks once and locks answers', () => {
    let s = playRound(initialState, 3)
    s = run(s, ...s.chosen.map((value, index): GameAction => ({ type: 'SET_ANSWER', index, value })))
    s = reducer(s, { type: 'CHECK' })
    expect(s.result?.correct).toBe(3)
    const locked = reducer(s, { type: 'SET_ANSWER', index: 0, value: 'x' })
    expect(locked).toBe(s)
  })

  it('flags a round as peeked only when answers are shown before checking', () => {
    const s = playRound(initialState, 2)
    expect(run(s, { type: 'TOGGLE_REVEAL' }, { type: 'TOGGLE_REVEAL' }, { type: 'CHECK' }).peeked).toBe(true)
    expect(run(s, { type: 'CHECK' }, { type: 'TOGGLE_REVEAL' }).peeked).toBe(false)
    expect(run(s, { type: 'TOGGLE_REVEAL' }, { type: 'REPLAY' }).peeked).toBe(false)
  })

  // Regression: the old app could not finish a second round without reloading.
  it('plays several rounds in a row after RESET and REPLAY', () => {
    let s = playRound(initialState, 4)
    s = run(s, { type: 'CHECK' }, { type: 'RESET' })
    expect(s.phase).toBe('setup')
    expect(s.chosen).toEqual([])

    s = playRound(s, 6)
    expect(s.phase).toBe('recall')
    expect(s.chosen).toHaveLength(6)
    expect(s.result).toBeNull()

    s = run(s, { type: 'CHECK' }, { type: 'REPLAY' })
    expect(s.phase).toBe('memorize')
    expect(s.targetCount).toBe(6)
    expect(s.chosen).toEqual([])
    while (s.phase === 'memorize') s = reducer(s, { type: 'KEEP' })
    expect(s.chosen).toHaveLength(6)
  })
})
