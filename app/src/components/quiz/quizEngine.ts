/** Tipos de pregunta del curso. Los textos admiten LaTeX en línea entre `$…$`. */
export type Question =
  | {
      type: 'choice'
      prompt: string
      options: string[]
      /** Índice de la opción correcta. */
      answer: number
      explanation: string
    }
  | {
      type: 'numeric'
      prompt: string
      answer: number
      /** Tolerancia absoluta (por defecto 0.01). */
      tolerance?: number
      explanation: string
    }
  | {
      type: 'matrix'
      prompt: string
      answer: number[][]
      tolerance?: number
      explanation: string
    }

export type Response = number | string | string[][] | null

/**
 * Convierte el texto del alumno en número. Acepta coma decimal ("1,5"),
 * fracciones ("-3/4") y raíces simples ("sqrt(2)", "√2", "2√3").
 */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s+/g, '').replace(',', '.').replace(/−/g, '-')
  if (s === '') return null
  const frac = s.match(/^(-?[\d.]+)\/(-?[\d.]+)$/)
  if (frac) {
    const d = Number(frac[2])
    return d === 0 ? null : Number(frac[1]) / d
  }
  const root = s.match(/^(-?[\d.]*)\*?(?:√|sqrt\()([\d.]+)\)?$/)
  if (root) {
    const k = root[1] === '' ? 1 : root[1] === '-' ? -1 : Number(root[1])
    return k * Math.sqrt(Number(root[2]))
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function isCorrect(q: Question, r: Response): boolean {
  if (r === null) return false
  switch (q.type) {
    case 'choice':
      return r === q.answer
    case 'numeric': {
      const n = typeof r === 'number' ? r : typeof r === 'string' ? parseNumber(r) : null
      return n !== null && Math.abs(n - q.answer) <= (q.tolerance ?? 0.01)
    }
    case 'matrix': {
      if (!Array.isArray(r)) return false
      const tol = q.tolerance ?? 0.01
      return q.answer.every((row, i) =>
        row.every((v, j) => {
          const n = parseNumber(r[i]?.[j] ?? '')
          return n !== null && Math.abs(n - v) <= tol
        }),
      )
    }
  }
}

export function score(questions: Question[], responses: Response[]): number {
  if (questions.length === 0) return 0
  const ok = questions.filter((q, i) => isCorrect(q, responses[i] ?? null)).length
  return ok / questions.length
}
