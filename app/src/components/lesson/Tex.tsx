import katex from 'katex'
import { Fragment, useMemo } from 'react'

/** Renderiza una expresión LaTeX. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false, strict: false }),
    [children, block],
  )
  return block ? (
    <div className="katex-display" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

/** Texto plano con fragmentos LaTeX en línea entre `$…$` y código entre `…` (backticks). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') && p.length > 1 ? (
          <Tex key={i}>{p.slice(1, -1)}</Tex>
        ) : p.startsWith('`') && p.endsWith('`') && p.length > 1 ? (
          <code key={i} className="rounded bg-slate-100 px-1 font-mono text-[0.9em] dark:bg-slate-800">
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}
