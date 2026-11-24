import { describe, expect, it } from 'vitest'

const sources = import.meta.glob<string>('./stages/*.mdx', { eager: true, query: '?raw', import: 'default' })

/** Texto de la sección de formalización de una etapa. */
function formalSection(src: string): string {
  const start = src.indexOf('<Section kind="formal">')
  if (start < 0) return ''
  const end = src.indexOf('</Section>', start)
  return src.slice(start, end < 0 ? undefined : end)
}

describe('contenido de las etapas', () => {
  for (const [path, src] of Object.entries(sources)) {
    describe(path, () => {
      it('tiene las secciones de la plantilla', () => {
        for (const kind of ['why', 'intuition', 'formal', 'example', 'lab', 'quiz', 'ml']) {
          expect(src, `falta <Section kind="${kind}">`).toContain(`<Section kind="${kind}"`)
        }
      })

      it('cada <Formula> indica cómo se lee (prop reading)', () => {
        // Las etiquetas <Formula …> se escriben en una sola línea (el tex puede contener '>')
        const tags = src.split('\n').filter((l) => l.includes('<Formula '))
        for (const tag of tags) {
          expect(tag, `fórmula sin lectura: ${tag.slice(0, 80)}…`).toMatch(/\breading="[^"]{10,}"/)
        }
      })

      it('las fórmulas en bloque usan $$ en líneas propias (en una sola línea, remark-math las muestra en línea)', () => {
        const bad = src.split('\n').filter((l) => /^\s*\$\$.+\$\$\s*$/.test(l))
        expect(bad, 'escribe $$ / fórmula / $$ en tres líneas').toEqual([])
      })

      it('ℝ fuera de <Formula> va acompañado de su aclaración («números reales»)', () => {
        for (const line of src.split('\n')) {
          if (line.includes('\\mathbb{R}') && !line.includes('<Formula ')) {
            expect(line, 'aclara que ℝ son los números reales').toMatch(/números reales/)
          }
        }
      })

      it('la formalización presenta las fórmulas en bloque con <Formula>, no con $$', () => {
        const formal = formalSection(src)
        expect(formal).toContain('<Formula')
        expect(formal.split('\n').some((l) => l.trim().startsWith('$$')), 'usa <Formula reading="…"> en lugar de $$').toBe(false)
      })
    })
  }
})
