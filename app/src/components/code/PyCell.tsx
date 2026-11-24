import { python } from '@codemirror/lang-python'
import CodeMirror from '@uiw/react-codemirror'
import { useEffect, useState, type ReactNode } from 'react'
import { useIsDark } from '../../lib/useIsDark'
import { restartPython, runPython, usePythonStatus, warmupPython, type OutputChunk } from './usePyodide'

// Constantes de módulo: si se recrean en cada render, CodeMirror se reconfigura sin parar
const EXTENSIONS = [python()]
const BASIC_SETUP = { foldGutter: false, highlightActiveLine: false }

interface Props {
  /** Código inicial (normalmente importado con `?raw` desde src/course/snippets). */
  code: string
  title?: string
  /** Texto breve bajo el título: qué observar en la salida (admite JSX, p. ej. un <StageRef>). */
  hint?: ReactNode
}

export function PyCell({ code: initial, title, hint }: Props) {
  const [code, setCode] = useState(initial.trimEnd())
  const [output, setOutput] = useState<OutputChunk[]>([])
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const status = usePythonStatus()
  const dark = useIsDark()

  useEffect(() => {
    warmupPython()
  }, [])

  async function run() {
    setRunning(true)
    setRan(true)
    setOutput([])
    await runPython(code, (c) => setOutput((o) => [...o, c]))
    setRunning(false)
  }

  const modified = code !== initial.trimEnd()

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          Python
        </span>
        <figcaption className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {title ?? 'Laboratorio'}
        </figcaption>
        <div className="ml-auto flex items-center gap-2">
          {modified && (
            <button
              type="button"
              onClick={() => setCode(initial.trimEnd())}
              className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Restablecer
            </button>
          )}
          {running && (
            <button
              type="button"
              onClick={restartPython}
              className="rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
              title="Detener: reinicia el intérprete de Python"
            >
              Detener
            </button>
          )}
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            title="Ejecutar (Ctrl+Enter)"
          >
            {running ? 'Ejecutando…' : '▶ Ejecutar'}
          </button>
        </div>
      </div>
      {hint && <p className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{hint}</p>}
      <div
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            if (!running) run()
          }
        }}
      >
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={EXTENSIONS}
          theme={dark ? 'dark' : 'light'}
          basicSetup={BASIC_SETUP}
          className="text-[13px]"
        />
      </div>
      {ran && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          {running && output.length === 0 && (
            <p className="text-xs text-slate-500">
              {status.state === 'loading' ? (status.detail ?? 'Cargando Python…') : 'Ejecutando…'}
            </p>
          )}
          {output.map((c, i) =>
            c.kind === 'image' ? (
              <img key={i} src={`data:image/png;base64,${c.png}`} alt="Gráfico generado por la celda" className="my-2 max-w-full rounded bg-white" />
            ) : (
              <pre
                key={i}
                className={`whitespace-pre-wrap font-mono text-[13px] leading-snug ${
                  c.kind === 'error'
                    ? 'text-red-700 dark:text-red-400'
                    : c.kind === 'stderr'
                      ? 'text-slate-500'
                      : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {c.kind === 'error' ? shortenTraceback(c.text) : c.text}
              </pre>
            ),
          )}
          {!running && output.length === 0 && <p className="text-xs text-slate-500">(sin salida)</p>}
        </div>
      )}
    </figure>
  )
}

/** Quita los marcos internos de Pyodide y deja el error del código del alumno. */
function shortenTraceback(t: string): string {
  const lines = t.split('\n')
  const i = lines.findIndex((l) => l.includes('File "<exec>"'))
  return i > 0 ? ['Traceback (most recent call last):', ...lines.slice(i)].join('\n') : t
}
