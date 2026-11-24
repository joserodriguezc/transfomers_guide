import { useSyncExternalStore } from 'react'
import type { WorkerResponse } from './pyodideWorker'

export type OutputChunk =
  | { kind: 'stdout' | 'stderr' | 'error'; text: string }
  | { kind: 'image'; png: string }

type Status = { state: 'idle' | 'loading' | 'ready' | 'error'; detail?: string }

interface Pending {
  onChunk: (c: OutputChunk) => void
  resolve: () => void
}

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, Pending>()
let status: Status = { state: 'idle' }
const listeners = new Set<() => void>()
/** Las ejecuciones se encolan para que la salida de una celda no se mezcle con otra. */
let queue: Promise<void> = Promise.resolve()

function setStatus(s: Status) {
  status = s
  listeners.forEach((l) => l())
}

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    const m = ev.data
    if (m.type === 'status') {
      setStatus({ state: m.status, detail: m.detail })
      return
    }
    const p = pending.get(m.id)
    if (!p) return
    if (m.type === 'stdout' || m.type === 'stderr') p.onChunk({ kind: m.type, text: m.text })
    else if (m.type === 'image') p.onChunk({ kind: 'image', png: m.png })
    else if (m.type === 'done') {
      if (m.error) p.onChunk({ kind: 'error', text: m.error })
      pending.delete(m.id)
      p.resolve()
    }
  }
  worker.onerror = (e) => setStatus({ state: 'error', detail: e.message })
  return worker
}

/** Empieza a descargar Python en segundo plano. */
export function warmupPython() {
  if (status.state === 'idle') {
    setStatus({ state: 'loading', detail: 'Iniciando Python…' })
    getWorker().postMessage({ warmup: true })
  }
}

export function runPython(code: string, onChunk: (c: OutputChunk) => void): Promise<void> {
  const job = queue.then(
    () =>
      new Promise<void>((resolve) => {
        const id = nextId++
        pending.set(id, { onChunk, resolve })
        getWorker().postMessage({ id, code })
      }),
  )
  queue = job.catch(() => undefined)
  return job
}

/** Termina el intérprete (p. ej. ante un bucle infinito) y lo deja listo para reiniciarse. */
export function restartPython() {
  worker?.terminate()
  worker = null
  for (const p of pending.values()) {
    p.onChunk({ kind: 'error', text: 'Ejecución interrumpida: Python se reinició.' })
    p.resolve()
  }
  pending.clear()
  queue = Promise.resolve()
  setStatus({ state: 'idle' })
}

export function usePythonStatus(): Status {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => status,
  )
}
