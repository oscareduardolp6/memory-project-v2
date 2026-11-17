/** Set to false to require accents to match exactly (old app behaviour). */
export const IGNORE_ACCENTS = true

export function normalize(word: string, ignoreAccents = IGNORE_ACCENTS): string {
  let w = word.trim().toLocaleLowerCase('es')
  if (ignoreAccents) {
    // Strip diacritics but keep ñ (n + combining tilde) as its own letter.
    w = w
      .normalize('NFD')
      .replace(/ñ/g, 'ñ')
      .replace(/[̀-ͯ]/g, '')
  }
  return w.replace(/\s+/g, ' ')
}

export function isMatch(answer: string, expected: string): boolean {
  return normalize(answer) === normalize(expected)
}

export interface RoundResult {
  positions: boolean[]
  correct: number
  incorrect: number
}

export function compareRound(answers: readonly string[], expected: readonly string[]): RoundResult {
  const positions = expected.map((word, i) => isMatch(answers[i] ?? '', word))
  const correct = positions.filter(Boolean).length
  return { positions, correct, incorrect: positions.length - correct }
}
