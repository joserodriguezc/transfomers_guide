/// <reference lib="webworker" />
/**
 * Web Worker que ejecuta Python (Pyodide) fuera del hilo principal.
 * Los paquetes (numpy, scipy, scikit-learn, sympy, pandas, matplotlib…) se cargan
 * bajo demanda a partir de los imports de cada celda.
 */

export const PYODIDE_VERSION = '314.0.8'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

export type WorkerRequest = { id: number; code: string }
export type WorkerResponse =
  | { type: 'status'; status: 'loading' | 'ready'; detail?: string }
  | { type: 'stdout'; id: number; text: string }
  | { type: 'stderr'; id: number; text: string }
  | { type: 'image'; id: number; png: string }
  | { type: 'done'; id: number; error?: string }

// Tipado mínimo de la API de Pyodide que usamos
interface PyProxyLike {
  toString(): string
  destroy?: () => void
}
interface Pyodide {
  setStdout(o: { batched: (s: string) => void }): void
  setStderr(o: { batched: (s: string) => void }): void
  loadPackagesFromImports(code: string, o?: { messageCallback?: (m: string) => void }): Promise<unknown>
  runPythonAsync(code: string, o?: { globals?: unknown }): Promise<unknown>
  runPython(code: string, o?: { globals?: unknown }): unknown
  globals: { get(name: string): (...a: unknown[]) => PyProxyLike & { set(k: string, v: unknown): void } }
}

const post = (msg: WorkerResponse) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg)

let currentId = 0
let pyodidePromise: Promise<Pyodide> | null = null

function getPyodide(): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      post({ type: 'status', status: 'loading', detail: 'Descargando Python…' })
      const mod = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)
      const py: Pyodide = await mod.loadPyodide({ indexURL: INDEX_URL })
      py.setStdout({ batched: (text) => post({ type: 'stdout', id: currentId, text }) })
      py.setStderr({ batched: (text) => post({ type: 'stderr', id: currentId, text }) })
      post({ type: 'status', status: 'loading', detail: 'Cargando NumPy…' })
      await py.loadPackagesFromImports('import numpy', { messageCallback: () => {} })
      py.runPython(`
import os
import warnings
os.environ["MPLBACKEND"] = "AGG"
# Avisos internos de las librerías que no aportan nada al alumno
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message=".*deprecated.*")
# plt.show() con el backend AGG avisa de que no puede abrir una ventana; las figuras se muestran igual bajo la celda
warnings.filterwarnings("ignore", message=".*non-interactive.*")

def __show_result(x):
    # Como en Jupyter, se muestra el valor de la última expresión, salvo los objetos de matplotlib
    # (Text, Line2D…) que devuelven plt.title, plt.plot, etc., y que solo son ruido
    return x is not None and not type(x).__module__.startswith("matplotlib") and not (
        isinstance(x, list) and x and type(x[0]).__module__.startswith("matplotlib")
    )

def __collect_figures():
    import sys
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import base64, io
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
`)
      post({ type: 'status', status: 'ready' })
      return py
    })()
  }
  return pyodidePromise
}

self.onmessage = async (ev: MessageEvent<WorkerRequest | { warmup: true }>) => {
  if ('warmup' in ev.data) {
    getPyodide().catch((e) => post({ type: 'status', status: 'loading', detail: String(e) }))
    return
  }
  const { id, code } = ev.data
  currentId = id
  try {
    const py = await getPyodide()
    await py.loadPackagesFromImports(code, {
      messageCallback: (m) => {
        if (m.startsWith('Loading')) post({ type: 'stderr', id, text: `⏳ ${m.replace('Loading', 'Cargando')}` })
      },
    })
    // Cada celda corre en un espacio de nombres limpio: los ejemplos son autocontenidos
    const ns = py.globals.get('dict')()
    ns.set('__name__', '__main__')
    const result = (await py.runPythonAsync(code, { globals: ns })) as PyProxyLike | string | number | undefined
    if (result !== undefined && result !== null) {
      const show = py.globals.get('__show_result') as unknown as (x: unknown) => boolean
      if (show(result)) post({ type: 'stdout', id, text: typeof result === 'object' ? result.toString() : String(result) })
      if (typeof result === 'object') result.destroy?.()
    }
    const figs = py.runPython('__collect_figures()') as PyProxyLike & { toJs(): string[] }
    for (const png of figs.toJs()) post({ type: 'image', id, png })
    figs.destroy?.()
    ns.destroy?.()
    post({ type: 'done', id })
  } catch (e) {
    post({ type: 'done', id, error: e instanceof Error ? e.message : String(e) })
  }
}
