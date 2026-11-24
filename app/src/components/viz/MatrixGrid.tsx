import type { ReactNode } from 'react'
import { fmt } from '../../lib/linalg'

export type CellTone = 'a' | 'b' | 'c' | 'd' | 'muted' | 'ghost'

const toneCls: Record<CellTone, string> = {
  a: 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-500/25 dark:border-blue-400 dark:text-blue-100',
  b: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-500/25 dark:border-red-400 dark:text-red-100',
  c: 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-500/25 dark:border-emerald-400 dark:text-emerald-100',
  d: 'bg-amber-100 border-amber-500 text-amber-900 dark:bg-amber-500/25 dark:border-amber-400 dark:text-amber-100',
  muted: 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600',
  ghost: 'border-dashed bg-transparent border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500',
}

/** Cuadrícula de una matriz con celdas coloreables, índices opcionales y clic por celda. */
export function MatrixGrid({
  values,
  tone,
  showIndices = false,
  dimZeros = false,
  digits = 2,
  size = 'md',
  indexBase = 0,
  label,
  onCellClick,
  onCellHover,
}: {
  values: number[][]
  tone?: (i: number, j: number) => CellTone | undefined
  showIndices?: boolean
  dimZeros?: boolean
  digits?: number
  size?: 'xs' | 'sm' | 'md'
  /** Primer número de los índices de fila y columna (0 como NumPy, 1 como en matemáticas). */
  indexBase?: number
  label?: ReactNode
  onCellClick?: (i: number, j: number) => void
  onCellHover?: (cell: [number, number] | null) => void
}) {
  const cols = values[0]?.length ?? 0
  const cell = size === 'xs' ? 'h-6 min-w-6 px-0.5 text-[10px]' : size === 'sm' ? 'h-7 min-w-7 px-1.5 text-[11px]' : 'h-9 min-w-10 px-1.5 text-sm'
  return (
    <div className="inline-flex flex-col items-center gap-1">
      {label && <div className="text-sm">{label}</div>}
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `${showIndices ? 'auto ' : ''}repeat(${cols}, auto)` }} onMouseLeave={() => onCellHover?.(null)}>
        {showIndices && (
          <>
            <span />
            {Array.from({ length: cols }, (_, j) => (
              <span key={j} className="text-center font-mono text-[10px] text-slate-400">
                {j + indexBase}
              </span>
            ))}
          </>
        )}
        {values.map((row, i) => (
          <Row key={i}>
            {showIndices && <span className="self-center pr-1 text-right font-mono text-[10px] text-slate-400">{i + indexBase}</span>}
            {row.map((v, j) => {
              const t = tone?.(i, j) ?? (dimZeros && v === 0 ? 'muted' : undefined)
              const Tag = onCellClick ? 'button' : 'span'
              return (
                <Tag
                  key={j}
                  type={onCellClick ? 'button' : undefined}
                  onClick={onCellClick ? () => onCellClick(i, j) : undefined}
                  onMouseEnter={() => onCellHover?.([i, j])}
                  onFocus={() => onCellHover?.([i, j])}
                  className={`${cell} inline-flex items-center justify-center rounded-md border font-mono tabular-nums transition-colors ${
                    t ? toneCls[t] : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  } ${onCellClick ? 'cursor-pointer hover:ring-2 hover:ring-brand-500' : ''}`}
                >
                  {fmt(v, digits)}
                </Tag>
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <>{children}</>
}
