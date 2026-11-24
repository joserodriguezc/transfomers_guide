export type SectionKind = 'why' | 'intuition' | 'formal' | 'example' | 'lab' | 'quiz' | 'ml' | 'extensions'

export const sectionMeta: Record<SectionKind, { label: string; icon: string }> = {
  why: { label: '¿Por qué importa?', icon: '🎯' },
  intuition: { label: 'Intuición', icon: '💡' },
  formal: { label: 'Formalización', icon: '∑' },
  example: { label: 'Ejemplo resuelto', icon: '✍️' },
  lab: { label: 'Laboratorio Python', icon: '🧪' },
  quiz: { label: 'Comprueba tu comprensión', icon: '❓' },
  ml: { label: 'Conexión con ML y resumen', icon: '🤖' },
  extensions: { label: 'Retos y extensiones', icon: '🚀' },
}

/** Cláusula que introduce la lectura en palabras de cada fórmula. */
export const READING_CLAUSE = 'Esta fórmula se lee:'
