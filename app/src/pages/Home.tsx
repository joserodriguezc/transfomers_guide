import { Link } from 'react-router-dom'
import { parts, stageLoader, stages } from '../course/curriculum'
import { resetProgress, useProgress } from '../lib/progress'

export function Home() {
  const progress = useProgress()
  const done = stages.filter((s) => progress[s.slug]?.completed).length
  const next = stages.find((s) => !progress[s.slug]?.completed) ?? stages[0]

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Curso interactivo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Transformers: de los primeros principios a los sistemas inteligentes</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          {stages.length} módulos, de la tokenización y la atención a la visión, el audio, la difusión, el razonamiento, los
          agentes y el despliegue. En cada uno: la intuición con gráficos interactivos, las fórmulas explicadas símbolo a símbolo,
          un ejemplo resuelto paso a paso, código Python ejecutable en el navegador y preguntas para comprobar lo aprendido.
        </p>
        <p className="mt-2 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
          Temario inspirado en <em>Transformers: The Definitive Guide</em> (Nicole Koenigstein, O’Reilly, 2026). Cada módulo indica
          el capítulo que lo amplía.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to={`/modulo/${next.slug}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {done === 0 ? 'Empezar el curso' : `Continuar: módulo ${next.n}`}
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full bg-emerald-500" style={{ width: `${(done / stages.length) * 100}%` }} />
            </div>
            {done}/{stages.length} módulos
          </div>
          {done > 0 && (
            <button
              type="button"
              onClick={() => confirm('¿Borrar todo tu progreso?') && resetProgress()}
              className="text-xs text-slate-400 underline hover:text-slate-600"
            >
              Reiniciar progreso
            </button>
          )}
        </div>
      </section>

      <div className="space-y-10">
        {parts.map((part) => (
          <section key={part.id}>
            <h2 className="text-lg font-semibold">
              <span className="text-slate-400">Parte {part.id} · </span>
              {part.title}
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{part.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stages
                .filter((s) => s.part === part.id)
                .map((s) => {
                  const p = progress[s.slug]
                  const available = Boolean(stageLoader(s))
                  return (
                    <Link
                      key={s.slug}
                      to={`/modulo/${s.slug}`}
                      className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                        p?.completed
                          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">Módulo {s.n}</span>
                        {p?.completed ? (
                          <span className="font-semibold text-emerald-600">✓ {Math.round(p.bestScore * 100)}%</span>
                        ) : p ? (
                          <span className="text-amber-600">{Math.round(p.bestScore * 100)}%</span>
                        ) : !available ? (
                          <span className="text-slate-400">próximamente</span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-semibold group-hover:text-brand-600">{s.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.summary}</p>
                    </Link>
                  )
                })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
