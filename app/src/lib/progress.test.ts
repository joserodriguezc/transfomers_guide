import { describe, expect, it } from 'vitest'
import { mergeScore, PASS_SCORE } from './progress'

describe('progreso de los quizzes', () => {
  it('guarda el mejor puntaje y nunca lo baja', () => {
    const a = mergeScore(undefined, 0.5)
    expect(a.bestScore).toBe(0.5)
    expect(a.completed).toBe(false)
    const b = mergeScore(a, 0.3)
    expect(b.bestScore).toBe(0.5)
  })

  it('marca el módulo como completado al llegar al umbral', () => {
    expect(mergeScore(undefined, PASS_SCORE).completed).toBe(true)
    expect(mergeScore(mergeScore(undefined, 0.9), 0.1).completed).toBe(true)
  })
})
