import { describe, expect, it } from 'vitest'
import type { Question } from '../components/quiz/quizEngine'
import { stages } from './curriculum'

const modules = import.meta.glob<{ quiz: Question[] }>('./quizzes/*.ts', { eager: true })

describe('bancos de preguntas', () => {
  it('cada archivo corresponde a una etapa existente', () => {
    for (const path of Object.keys(modules)) {
      const slug = path.match(/([\w-]+)\.ts$/)![1]
      expect(stages.some((s) => s.slug === slug), path).toBe(true)
    }
  })

  it('cada etapa tiene su MDX y su banco de preguntas', () => {
    const mdx = import.meta.glob('./stages/*.mdx')
    for (const s of stages) {
      expect(Object.keys(mdx), s.slug).toContain(`./stages/${s.slug}.mdx`)
      expect(Object.keys(modules), s.slug).toContain(`./quizzes/${s.slug}.ts`)
    }
  })

  for (const [path, mod] of Object.entries(modules)) {
    it(`${path} está bien formado`, () => {
      expect(mod.quiz.length).toBeGreaterThanOrEqual(4)
      for (const q of mod.quiz) {
        expect(q.prompt.length, path).toBeGreaterThan(0)
        expect(q.explanation.length, q.prompt).toBeGreaterThan(0)
        // Los $ de LaTeX deben ir en pares
        expect((q.prompt.match(/\$/g) ?? []).length % 2, q.prompt).toBe(0)
        // Si una pregunta usa ℝ, debe aclarar que son los números reales
        const all = [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])].join(' ')
        if (all.includes('\\mathbb{R}')) expect(all, q.prompt).toMatch(/números reales/)
        if (q.type === 'choice') {
          expect(q.answer, q.prompt).toBeGreaterThanOrEqual(0)
          expect(q.answer, q.prompt).toBeLessThan(q.options.length)
          expect(new Set(q.options).size, q.prompt).toBe(q.options.length)
        }
        if (q.type === 'matrix') {
          const cols = q.answer[0].length
          expect(q.answer.every((r) => r.length === cols), q.prompt).toBe(true)
        }
        if (q.type === 'numeric') expect(Number.isFinite(q.answer)).toBe(true)
      }
    })
  }
})
