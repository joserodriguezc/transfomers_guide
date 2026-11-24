import { describe, expect, it } from 'vitest'
import { isCorrect, parseNumber, score, type Question } from './quizEngine'

describe('parseNumber', () => {
  it('acepta formatos habituales', () => {
    expect(parseNumber('14')).toBe(14)
    expect(parseNumber(' 1,5 ')).toBe(1.5)
    expect(parseNumber('-3/4')).toBe(-0.75)
    expect(parseNumber('√2')).toBeCloseTo(Math.SQRT2)
    expect(parseNumber('sqrt(14)')).toBeCloseTo(3.7417)
    expect(parseNumber('2√3')).toBeCloseTo(3.4641)
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('1/0')).toBeNull()
    expect(parseNumber('')).toBeNull()
  })
})

describe('isCorrect / score', () => {
  const qs: Question[] = [
    { type: 'choice', prompt: '', options: ['a', 'b'], answer: 1, explanation: '' },
    { type: 'numeric', prompt: '', answer: 3.7417, tolerance: 0.001, explanation: '' },
    { type: 'matrix', prompt: '', answer: [[1, 0], [0, 1]], explanation: '' },
  ]
  it('corrige cada tipo', () => {
    expect(isCorrect(qs[0], 1)).toBe(true)
    expect(isCorrect(qs[0], 0)).toBe(false)
    expect(isCorrect(qs[1], 'sqrt(14)')).toBe(true)
    expect(isCorrect(qs[1], '3.7')).toBe(false)
    expect(isCorrect(qs[2], [['1', '0'], ['0', '1']])).toBe(true)
    expect(isCorrect(qs[2], [['1', '0'], ['0', '']])).toBe(false)
    expect(isCorrect(qs[2], null)).toBe(false)
  })
  it('calcula el puntaje', () => {
    expect(score(qs, [1, '3.7417', [['1', '0'], ['0', '1']]])).toBe(1)
    expect(score(qs, [0, null, null])).toBe(0)
  })
})
