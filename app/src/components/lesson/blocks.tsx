import { Children, isValidElement, useState, type ReactNode } from 'react'
import { detectNotation } from '../../lib/notation'
import { READING_CLAUSE, sectionMeta, type SectionKind } from './meta'
import { RichText, Tex } from './Tex'

/** Sección principal de una etapa. Su <h2> alimenta el índice lateral. */
export function Section({
  kind,
  title,
  id,
  children,
}: {
  kind: SectionKind
  title?: string
  id?: string
  children: ReactNode
}) {
  const meta = sectionMeta[kind]
  return (
    <section className="mt-12 first:mt-0">
      <h2 id={id ?? kind} data-icon={meta.icon} className="flex items-center gap-3">
        <span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg dark:bg-brand-500/15">
          {meta.icon}
        </span>
        <span data-title>{title ?? meta.label}</span>
      </h2>
      {children}
    </section>
  )
}

/**
 * Fórmula destacada con nombre, su lectura en palabras (`reading`, obligatoria en las
 * formalizaciones: lo comprueba stages.test.ts) y una explicación opcional de los símbolos.
 */
export function Formula({
  tex,
  label,
  reading,
  notation = true,
  children,
}: {
  tex: string
  label?: string
  reading?: string
  /** Muestra la explicación automática de los símbolos (ℝⁿ, ∈, ∑, ‖·‖…). */
  notation?: boolean
  children?: ReactNode
}) {
  const symbols = notation ? detectNotation(tex) : []
  return (
    <div className="not-prose my-6 rounded-xl border border-brand-100 bg-brand-50/50 px-5 py-4 dark:border-brand-500/20 dark:bg-brand-500/5">
      {label && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">{label}</p>}
      <Tex block>{tex}</Tex>
      {reading && (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          <span className="font-semibold">{READING_CLAUSE}</span> <span className="italic">«<RichText text={reading} />»</span>
        </p>
      )}
      {symbols.length > 0 && (
        <details className="group mt-2 text-sm" open>
          <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Notación
          </summary>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {symbols.map((s) => (
              <div key={s.tex} className="contents">
                <dt className="text-right">
                  <Tex>{s.tex}</Tex>
                </dt>
                <dd className="text-slate-600 dark:text-slate-300">{s.meaning}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      {children && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 [&_p]:my-1">{children}</div>}
    </div>
  )
}

/** Ejemplo resuelto: los pasos se revelan uno a uno para que el alumno intente anticiparlos. */
export function WorkedExample({ title, problem, children }: { title?: string; problem?: ReactNode; children: ReactNode }) {
  const all = Children.toArray(children)
  // El enunciado puede pasarse como <Problem> (admite Markdown y $…$) o con la prop `problem`
  const statement = all.find((c) => isValidElement(c) && c.type === Problem) ?? problem
  const steps = all.filter((c) => !(isValidElement(c) && c.type === Problem))
  const [shown, setShown] = useState(1)
  return (
    <div className="my-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="!my-0 text-sm font-semibold">{title ?? 'Ejemplo resuelto'}</p>
        {statement && <div className="text-sm [&_p]:my-1">{statement}</div>}
      </div>
      <ol className="!my-0 list-none !pl-0">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="!my-0 flex gap-3 border-b border-slate-100 px-5 py-3 last:border-0 dark:border-slate-800/70">
            <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{s}</div>
          </li>
        ))}
      </ol>
      {shown < steps.length && (
        <div className="not-prose flex gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShown((n) => n + 1)}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Siguiente paso ({shown}/{steps.length})
          </button>
          <button
            type="button"
            onClick={() => setShown(steps.length)}
            className="rounded-md px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Mostrar todo
          </button>
        </div>
      )}
    </div>
  )
}

/** Enunciado de un ejemplo resuelto. */
export function Problem({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Step({ children }: { children: ReactNode }) {
  return <>{children}</>
}

const calloutStyles = {
  tip: { cls: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30', icon: '💡', title: 'Idea clave' },
  warning: { cls: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30', icon: '⚠️', title: 'Cuidado' },
  note: { cls: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30', icon: '📝', title: 'Nota' },
  ml: { cls: 'border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30', icon: '🤖', title: 'En machine learning' },
} as const

export function Callout({
  kind = 'note',
  title,
  children,
}: {
  kind?: keyof typeof calloutStyles
  title?: string
  children: ReactNode
}) {
  const s = calloutStyles[kind]
  return (
    <aside className={`my-6 rounded-xl border-l-4 px-5 py-3 ${s.cls}`}>
      <p className="!mb-1 !mt-0 text-sm font-semibold">
        {s.icon} {title ?? s.title}
      </p>
      <div className="text-[0.95em] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </aside>
  )
}

/** Lista de ideas clave al final de la etapa. */
export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl bg-slate-50 px-5 py-4 dark:bg-slate-900">
      <p className="!mt-0 text-sm font-semibold uppercase tracking-wide text-slate-500">Lo que te llevas</p>
      <div className="[&_ul]:my-0">{children}</div>
    </div>
  )
}

/** Contenedor de una visualización interactiva con título e instrucciones. */
export function Figure({ title, caption, children }: { title?: string; caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="not-prose my-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      {title && <p className="mb-3 text-sm font-semibold">{title}</p>}
      {children}
      {caption && <figcaption className="mt-3 text-xs text-slate-500 dark:text-slate-400">{caption}</figcaption>}
    </figure>
  )
}
