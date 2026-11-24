import type { ReactNode } from 'react'
import type { VizColor } from './plane'

/**
 * Gráficos SVG mínimos compartidos por las visualizaciones del curso. Los colores salen de los
 * tokens --viz-* (index.css), así que funcionan igual en modo claro y oscuro.
 */

const fill = (c: VizColor) => `var(--viz-${c})`

/**
 * Mapa de calor. Con `diverging`, los positivos usan el color `a` y los negativos el `b`;
 * si no, la intensidad es el valor normalizado a [0, 1].
 */
export function Heatmap({
  values,
  rowLabels,
  colLabels,
  cell = 28,
  diverging = false,
  color = 'a',
  showValues = false,
  digits = 2,
  highlight,
  max,
  onCellClick,
  ariaLabel = 'Mapa de calor',
}: {
  values: number[][]
  rowLabels?: string[]
  colLabels?: string[]
  cell?: number
  diverging?: boolean
  color?: VizColor
  showValues?: boolean
  digits?: number
  highlight?: (i: number, j: number) => boolean
  /** Valor que corresponde a la intensidad máxima (por defecto, el máximo absoluto). */
  max?: number
  onCellClick?: (i: number, j: number) => void
  ariaLabel?: string
}) {
  const rows = values.length
  const cols = values[0]?.length ?? 0
  const finite = values.flat().filter(Number.isFinite)
  const vmax = max ?? Math.max(1e-9, ...finite.map(Math.abs))
  const left = rowLabels ? Math.max(...rowLabels.map((l) => l.length)) * 7 + 8 : 0
  const top = colLabels ? Math.max(...colLabels.map((l) => l.length)) * 6 + 10 : 0
  const W = left + cols * cell
  const H = top + rows * cell
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto max-w-full" style={{ width: W }} role="img" aria-label={ariaLabel}>
      {colLabels?.map((l, j) => (
        <text
          key={j}
          x={left + j * cell + cell / 2}
          y={top - 4}
          fontSize={11}
          fill="var(--viz-text)"
          transform={`rotate(-45 ${left + j * cell + cell / 2} ${top - 4})`}
        >
          {l}
        </text>
      ))}
      {rowLabels?.map((l, i) => (
        <text key={i} x={left - 6} y={top + i * cell + cell / 2 + 4} fontSize={11} textAnchor="end" fill="var(--viz-text)">
          {l}
        </text>
      ))}
      {values.map((r, i) =>
        r.map((v, j) => {
          const masked = !Number.isFinite(v)
          const t = masked ? 0 : Math.min(1, Math.abs(v) / vmax)
          const c: VizColor = diverging && v < 0 ? 'b' : color
          return (
            <g key={`${i}-${j}`} onClick={onCellClick ? () => onCellClick(i, j) : undefined} className={onCellClick ? 'cursor-pointer' : undefined}>
              <rect x={left + j * cell + 1} y={top + i * cell + 1} width={cell - 2} height={cell - 2} rx={3} fill="var(--viz-grid)" opacity={masked ? 0.35 : 0.5} />
              {!masked && <rect x={left + j * cell + 1} y={top + i * cell + 1} width={cell - 2} height={cell - 2} rx={3} fill={fill(c)} opacity={0.08 + 0.92 * t} />}
              {masked && (
                <line x1={left + j * cell + 6} y1={top + i * cell + cell - 6} x2={left + j * cell + cell - 6} y2={top + i * cell + 6} stroke="var(--viz-muted)" strokeWidth={1} />
              )}
              {highlight?.(i, j) && (
                <rect x={left + j * cell + 1} y={top + i * cell + 1} width={cell - 2} height={cell - 2} rx={3} fill="none" stroke="var(--viz-d)" strokeWidth={2.5} />
              )}
              {showValues && !masked && (
                <text
                  x={left + j * cell + cell / 2}
                  y={top + i * cell + cell / 2 + 3.5}
                  fontSize={Math.min(11, cell / 3)}
                  textAnchor="middle"
                  fill={t > 0.55 ? '#fff' : 'var(--viz-text)'}
                  className="font-mono"
                >
                  {v.toFixed(digits)}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

export interface Series {
  y: number[]
  /** Valores del eje x (por defecto 0, 1, 2…). */
  x?: number[]
  color?: VizColor
  label?: string
  dashed?: boolean
  width?: number
  /** Dibuja puntos en lugar de (o además de) la línea. */
  dots?: boolean
  noLine?: boolean
}

/** Gráfico de líneas con ejes automáticos. */
export function LineChart({
  series,
  width = 480,
  height = 220,
  yRange,
  xRange,
  xLabel,
  yLabel,
  bands,
  vlines,
  hlines,
  children,
  ariaLabel = 'Gráfico de líneas',
}: {
  series: Series[]
  width?: number
  height?: number
  yRange?: [number, number]
  xRange?: [number, number]
  xLabel?: string
  yLabel?: string
  /** Bandas sombreadas en x: [desde, hasta, color]. */
  bands?: [number, number, VizColor][]
  vlines?: [number, VizColor][]
  hlines?: [number, VizColor][]
  children?: (sx: (x: number) => number, sy: (y: number) => number) => ReactNode
  ariaLabel?: string
}) {
  const pad = { l: 40, r: 10, t: 10, b: xLabel ? 34 : 22 }
  const xs = series.flatMap((s) => s.x ?? s.y.map((_, i) => i))
  const ys = series.flatMap((s) => s.y).filter(Number.isFinite)
  const [x0, x1] = xRange ?? [Math.min(...xs), Math.max(...xs)]
  let [y0, y1] = yRange ?? [Math.min(...ys), Math.max(...ys)]
  if (y0 === y1) [y0, y1] = [y0 - 1, y1 + 1]
  const sx = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * (width - pad.l - pad.r)
  const sy = (y: number) => pad.t + (1 - (y - y0) / (y1 - y0)) * (height - pad.t - pad.b)
  const ticks = (a: number, b: number, n = 4) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)
  const fmtTick = (v: number) => (Math.abs(v) >= 1000 ? v.toExponential(0) : Number(v.toPrecision(3)).toString())
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      {bands?.map(([a, b, c], i) => (
        <rect key={i} x={sx(a)} y={pad.t} width={Math.max(0, sx(b) - sx(a))} height={height - pad.t - pad.b} fill={fill(c)} opacity={0.12} />
      ))}
      {ticks(y0, y1).map((t) => (
        <g key={`y${t}`}>
          <line x1={pad.l} x2={width - pad.r} y1={sy(t)} y2={sy(t)} stroke="var(--viz-grid)" />
          <text x={pad.l - 4} y={sy(t) + 3} fontSize={10} textAnchor="end" fill="var(--viz-muted)">
            {fmtTick(t)}
          </text>
        </g>
      ))}
      {ticks(x0, x1).map((t) => (
        <text key={`x${t}`} x={sx(t)} y={height - pad.b + 12} fontSize={10} textAnchor="middle" fill="var(--viz-muted)">
          {fmtTick(t)}
        </text>
      ))}
      {y0 < 0 && y1 > 0 && <line x1={pad.l} x2={width - pad.r} y1={sy(0)} y2={sy(0)} stroke="var(--viz-axis)" />}
      {hlines?.map(([v, c], i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={sy(v)} y2={sy(v)} stroke={fill(c)} strokeDasharray="5 4" />
      ))}
      {vlines?.map(([v, c], i) => (
        <line key={i} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={height - pad.b} stroke={fill(c)} strokeDasharray="5 4" />
      ))}
      {series.map((s, k) => {
        const X = s.x ?? s.y.map((_, i) => i)
        const pts = s.y.map((v, i) => [X[i], v] as const).filter(([, v]) => Number.isFinite(v))
        const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(Math.max(y0, Math.min(y1, y))).toFixed(1)}`).join('')
        return (
          <g key={k}>
            {!s.noLine && <path d={d} fill="none" stroke={fill(s.color ?? 'a')} strokeWidth={s.width ?? 2} strokeDasharray={s.dashed ? '6 4' : undefined} />}
            {s.dots && pts.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r={2.6} fill={fill(s.color ?? 'a')} />)}
          </g>
        )
      })}
      {children?.(sx, sy)}
      {xLabel && (
        <text x={(pad.l + width - pad.r) / 2} y={height - 4} fontSize={11} textAnchor="middle" fill="var(--viz-text)">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={10} y={pad.t + 2} fontSize={11} fill="var(--viz-text)" dominantBaseline="hanging" transform={`rotate(-90 10 ${pad.t + 2}) translate(-${height / 2} 0)`}>
          {yLabel}
        </text>
      )}
    </svg>
  )
}

/** Leyenda horizontal para LineChart. */
export function Legend({ items }: { items: { label: string; color: VizColor; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <svg width={18} height={8}>
            <line x1={0} x2={18} y1={4} y2={4} stroke={fill(it.color)} strokeWidth={2.5} strokeDasharray={it.dashed ? '4 3' : undefined} />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}

/** Barras horizontales etiquetadas (p. ej. una distribución de atención). */
export function Bars({
  values,
  labels,
  color = 'a',
  max,
  digits = 2,
  highlight,
  signed = false,
}: {
  values: number[]
  labels: string[]
  color?: VizColor
  max?: number
  digits?: number
  highlight?: number
  /** Barras con signo: positivas a la derecha (color a) y negativas a la izquierda (color b). */
  signed?: boolean
}) {
  const vmax = max ?? Math.max(1e-9, ...values.map(Math.abs))
  return (
    <div className="space-y-1 text-xs">
      {values.map((v, i) => {
        const w = (Math.min(1, Math.abs(v) / vmax) * 100).toFixed(1)
        const c = signed && v < 0 ? 'b' : color
        return (
          <div key={i} className={`grid grid-cols-[5.5rem_1fr_3.2rem] items-center gap-2 ${highlight === i ? 'font-semibold' : ''}`}>
            <span className="truncate text-right font-mono">{labels[i]}</span>
            <div className={`relative h-3.5 rounded bg-slate-100 dark:bg-slate-800 ${signed ? 'overflow-hidden' : ''}`}>
              {signed ? (
                <div
                  className="absolute top-0 h-full rounded"
                  style={{ background: fill(c), width: `${Number(w) / 2}%`, left: v >= 0 ? '50%' : `${50 - Number(w) / 2}%` }}
                />
              ) : (
                <div className="h-full rounded" style={{ background: fill(c), width: `${w}%` }} />
              )}
              {signed && <div className="absolute left-1/2 top-0 h-full w-px bg-slate-400" />}
            </div>
            <span className="text-right font-mono tabular-nums">{v.toFixed(digits)}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Etiquetas tipo «chip» para mostrar una secuencia de tokens. */
export function TokenChips({
  tokens,
  tone,
  onClick,
  selected,
}: {
  tokens: string[]
  tone?: (i: number) => VizColor | undefined
  onClick?: (i: number) => void
  selected?: number
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((t, i) => {
        const c = tone?.(i)
        const Tag = onClick ? 'button' : 'span'
        return (
          <Tag
            key={i}
            type={onClick ? 'button' : undefined}
            onClick={onClick ? () => onClick(i) : undefined}
            className={`rounded border px-1.5 py-0.5 font-mono text-xs ${selected === i ? 'ring-2 ring-amber-500' : ''} ${
              onClick ? 'cursor-pointer hover:ring-2 hover:ring-brand-500' : ''
            } border-slate-300 dark:border-slate-600`}
            style={c ? { background: `color-mix(in srgb, ${fill(c)} 22%, transparent)`, borderColor: fill(c) } : undefined}
          >
            {t.replace(/ /g, '·')}
          </Tag>
        )
      })}
    </div>
  )
}
