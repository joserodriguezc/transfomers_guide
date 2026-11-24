import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStage, neighbors, parts, stageLoader, stages } from '../course/curriculum'
import { useProgress } from '../lib/progress'
import { StageContext } from '../components/lesson/stageContext'
import { mdxComponents } from '../mdxComponents'

type MdxContent = ComponentType<{ components?: Record<string, unknown> }>

/**
 * Un componente lazy por etapa, creado UNA vez al cargar el módulo. Crearlo durante el render rompe la
 * navegación: React Router navega dentro de una transición, React descarta y reintenta el render
 * mientras el MDX carga, y cada reintento crearía un lazy nuevo que vuelve a suspenderse.
 */
const STAGE_CONTENT = new Map<string, MdxContent>()
for (const s of stages) {
  const loader = stageLoader(s)
  if (loader) STAGE_CONTENT.set(s.slug, lazy(loader) as unknown as MdxContent)
}

export function StagePage() {
  const { slug } = useParams()
  const stage = getStage(slug)
  const progress = useProgress()
  const articleRef = useRef<HTMLElement>(null)
  const [toc, setToc] = useState<{ id: string; text: string; icon: string }[]>([])

  const Content = stage ? STAGE_CONTENT.get(stage.slug) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
    if (stage) document.title = `${stage.n}. ${stage.title} · Guía de Transformers`
  }, [stage])

  // Construye el índice lateral a partir de los <h2> de la etapa, cuando el MDX ya cargó
  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    let last = ''
    const build = () => {
      const items = [...el.querySelectorAll('h2[id]')].map((h) => ({
        id: h.id,
        // Solo el título: el icono ya se muestra aparte
        text: (h.querySelector('[data-title]') ?? h).textContent ?? '',
        icon: h.getAttribute('data-icon') ?? '§',
      }))
      const key = JSON.stringify(items)
      if (key !== last) {
        last = key
        setToc(items)
      }
    }
    build()
    // Solo observamos los hijos directos: el MDX llega de forma diferida (lazy)
    const obs = new MutationObserver(build)
    obs.observe(el, { childList: true })
    return () => obs.disconnect()
  }, [Content])

  if (!stage) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p>No existe ese módulo.</p>
        <Link to="/" className="text-brand-600 underline">
          Volver al curso
        </Link>
      </main>
    )
  }

  const { prev, next } = neighbors(stage)
  const part = parts.find((p) => p.id === stage.part)!

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-20 space-y-6 text-sm">
          {toc.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">En este módulo</p>
              <ul className="space-y-1">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' })
                    }} className="flex gap-2 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                      <span className="w-5 text-center">{t.icon}</span>
                      <span>{t.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Módulos</p>
            <ul className="max-h-[45vh] space-y-0.5 overflow-y-auto pr-1">
              {stages.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/modulo/${s.slug}`}
                    className={`flex gap-2 rounded px-2 py-1 ${
                      s.slug === stage.slug ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-100' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-5 text-right font-mono text-xs leading-5">{progress[s.slug]?.completed ? '✓' : s.n}</span>
                    <span className="truncate">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      <main className="min-w-0 max-w-3xl">
        <header className="mb-10">
          <p className="text-sm text-slate-500">
            Parte {part.id} · {part.title} — <span className="font-mono">Módulo {stage.n}</span>
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{stage.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{stage.summary}</p>
          <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
            <p className="mb-1 font-semibold">Al terminar este módulo sabrás:</p>
            <ul className="list-disc space-y-0.5 pl-5 text-slate-600 dark:text-slate-300">
              {stage.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </header>

        <article ref={articleRef} className="lesson">
          {Content ? (
            <StageContext.Provider value={stage.slug}>
            <Suspense fallback={<p className="text-slate-500">Cargando módulo…</p>}>
              {/* Falso positivo: Content sale de STAGE_CONTENT, creado una sola vez al cargar el módulo */}
              {/* oxlint-disable-next-line react/static-components */}
              <Content components={mdxComponents} />
            </Suspense>
            </StageContext.Provider>
          ) : (
            <p className="rounded-xl bg-slate-50 p-6 text-slate-500 dark:bg-slate-900">Este módulo todavía está en preparación.</p>
          )}
        </article>

        <nav className="mt-16 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-slate-800">
          {prev ? (
            <Link to={`/modulo/${prev.slug}`} className="rounded-xl border border-slate-200 p-4 hover:border-brand-500 dark:border-slate-800">
              <span className="text-xs text-slate-500">← Módulo {prev.n}</span>
              <p className="font-medium">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/modulo/${next.slug}`} className="rounded-xl border border-slate-200 p-4 text-right hover:border-brand-500 dark:border-slate-800">
              <span className="text-xs text-slate-500">Módulo {next.n} →</span>
              <p className="font-medium">{next.title}</p>
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}
