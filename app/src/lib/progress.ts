import { useSyncExternalStore } from 'react'

export interface StageProgress {
  /** Mejor puntaje obtenido en el quiz (0–1). */
  bestScore: number
  completed: boolean
  updatedAt: string
}

/** Progreso por módulo, indexado por slug (identidad estable del módulo). */
export type Progress = Record<string, StageProgress>

export const PASS_SCORE = 0.7
const KEY = 'tfg-progress-v1'

const listeners = new Set<() => void>()
let cache: Progress | null = null

function read(): Progress {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    cache = {}
  }
  return cache
}

function write(next: Progress) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* almacenamiento no disponible: el progreso vive solo en memoria */
  }
  listeners.forEach((l) => l())
}

/** Nuevo mejor puntaje: nunca baja, y el módulo queda completado al llegar a PASS_SCORE. */
export function mergeScore(prev: StageProgress | undefined, score: number, now = new Date()): StageProgress {
  const bestScore = Math.max(prev?.bestScore ?? 0, score)
  return { bestScore, completed: bestScore >= PASS_SCORE, updatedAt: now.toISOString() }
}

export function recordQuiz(slug: string, score: number) {
  write({ ...read(), [slug]: mergeScore(read()[slug], score) })
}

export function resetProgress() {
  write({})
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => ({}))
}
