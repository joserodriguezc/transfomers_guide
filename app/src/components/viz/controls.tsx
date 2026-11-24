import type { ReactNode } from 'react'
import { Tex } from '../lesson/Tex'

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 p-0.5 text-xs dark:border-slate-700" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2.5 py-1 font-medium ${
            value === o.value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="min-w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <span className="w-12 text-right font-mono text-xs">{value}</span>
    </label>
  )
}

/** Panel de lecturas en vivo (fórmulas con los valores actuales). */
export function Readout({ items }: { items: (string | null | false)[] }) {
  return (
    <div className="space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
      {items.filter(Boolean).map((t, i) => (
        <div key={i} className="overflow-x-auto">
          <Tex>{t as string}</Tex>
        </div>
      ))}
    </div>
  )
}

/** Diseño estándar: gráfico a la izquierda, controles y lecturas a la derecha (apilado en móvil). */
export function VizLayout({ plot, side }: { plot: ReactNode; side: ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="min-w-0">{plot}</div>
      <div className="min-w-0 space-y-3">{side}</div>
    </div>
  )
}

/** Entrada de matriz 2x2 editable. */
export function MatrixInput2({ value, onChange, name = 'A' }: { value: number[][]; onChange: (m: number[][]) => void; name?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Tex>{`${name} =`}</Tex>
      <div className="inline-flex items-stretch gap-1">
        <span className="w-1.5 rounded-l border-y-2 border-l-2 border-slate-400" />
        <div className="grid grid-cols-2 gap-1 py-0.5">
          {value.map((row, i) =>
            row.map((v, j) => (
              <input
                key={`${i}${j}`}
                type="number"
                step={0.1}
                value={v}
                aria-label={`${name}[${i + 1},${j + 1}]`}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (!Number.isFinite(n)) return
                  onChange(value.map((r, a) => r.map((c, b) => (a === i && b === j ? n : c))))
                }}
                className="w-16 rounded border border-slate-300 bg-white px-1 py-0.5 text-center font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            )),
          )}
        </div>
        <span className="w-1.5 rounded-r border-y-2 border-r-2 border-slate-400" />
      </div>
    </div>
  )
}
