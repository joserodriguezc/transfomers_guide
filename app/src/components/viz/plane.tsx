import { createContext, useContext, useId, useRef, type ReactNode } from 'react'
import type { Vec2 } from '../../lib/linalg'

/**
 * Plano cartesiano en SVG. Las coordenadas de los hijos son "matemáticas" (y hacia arriba);
 * el plano se encarga de convertirlas a píxeles y de arrastrar puntos.
 */

interface PlaneCtx {
  x: (v: number) => number
  y: (v: number) => number
  unit: number
  toMath: (clientX: number, clientY: number) => Vec2
  markerId: string
}

const Ctx = createContext<PlaneCtx | null>(null)
const usePlane = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('Usa este componente dentro de <Plane>')
  return c
}

const W = 480

export function Plane({
  xRange = [-5, 5],
  yRange = [-5, 5],
  grid = 1,
  children,
  className,
  ariaLabel = 'Plano cartesiano interactivo',
}: {
  xRange?: [number, number]
  yRange?: [number, number]
  grid?: number
  children?: ReactNode
  className?: string
  ariaLabel?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markerId = useId().replace(/:/g, '')
  const unit = W / (xRange[1] - xRange[0])
  const H = unit * (yRange[1] - yRange[0])
  const x = (v: number) => (v - xRange[0]) * unit
  const y = (v: number) => H - (v - yRange[0]) * unit
  const toMath = (cx: number, cy: number): Vec2 => {
    const svg = svgRef.current
    if (!svg) return [0, 0]
    const pt = svg.createSVGPoint()
    pt.x = cx
    pt.y = cy
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return [p.x / unit + xRange[0], (H - p.y) / unit + yRange[0]]
  }

  const lines: ReactNode[] = []
  for (let gx = Math.ceil(xRange[0] / grid) * grid; gx <= xRange[1]; gx += grid) {
    lines.push(
      <line key={`x${gx}`} x1={x(gx)} x2={x(gx)} y1={0} y2={H} stroke={gx === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} strokeWidth={gx === 0 ? 1.5 : 1} />,
    )
    if (gx !== 0 && Number.isInteger(gx) && gx > xRange[0] && gx < xRange[1])
      lines.push(
        <text key={`tx${gx}`} x={x(gx)} y={y(0) + 13} fontSize={10} textAnchor="middle" fill="var(--viz-muted)">
          {gx}
        </text>,
      )
  }
  for (let gy = Math.ceil(yRange[0] / grid) * grid; gy <= yRange[1]; gy += grid) {
    lines.push(
      <line key={`y${gy}`} y1={y(gy)} y2={y(gy)} x1={0} x2={W} stroke={gy === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} strokeWidth={gy === 0 ? 1.5 : 1} />,
    )
    if (gy !== 0 && Number.isInteger(gy) && gy > yRange[0] && gy < yRange[1])
      lines.push(
        <text key={`ty${gy}`} x={x(0) - 6} y={y(gy) + 3} fontSize={10} textAnchor="end" fill="var(--viz-muted)">
          {gy}
        </text>,
      )
  }

  return (
    <Ctx.Provider value={{ x, y, unit, toMath, markerId }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full touch-none select-none ${className ?? ''}`}
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          {['a', 'b', 'c', 'd', 'muted'].map((c) => (
            <marker
              key={c}
              id={`${markerId}-${c}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={`var(--viz-${c})`} />
            </marker>
          ))}
        </defs>
        {lines}
        {children}
      </svg>
    </Ctx.Provider>
  )
}

export type VizColor = 'a' | 'b' | 'c' | 'd' | 'muted'

export function Arrow({
  from = [0, 0],
  to,
  color = 'a',
  label,
  dashed,
  width = 2.5,
}: {
  from?: Vec2
  to: Vec2
  color?: VizColor
  label?: ReactNode
  dashed?: boolean
  width?: number
}) {
  const { x, y, markerId } = usePlane()
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  return (
    <g>
      {len > 1e-6 && (
        <line
          x1={x(from[0])}
          y1={y(from[1])}
          x2={x(to[0])}
          y2={y(to[1])}
          stroke={`var(--viz-${color})`}
          strokeWidth={width}
          strokeDasharray={dashed ? '6 4' : undefined}
          markerEnd={`url(#${markerId}-${color})`}
        />
      )}
      {label && (
        <text
          x={x(to[0]) + 8}
          y={y(to[1]) - 8}
          fontSize={14}
          fontWeight={600}
          fill={`var(--viz-${color})`}
          style={{ paintOrder: 'stroke', stroke: 'var(--viz-bg, transparent)' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export function Segment({ from, to, color = 'muted', dashed = true, width = 1.5 }: { from: Vec2; to: Vec2; color?: VizColor; dashed?: boolean; width?: number }) {
  const { x, y } = usePlane()
  return (
    <line
      x1={x(from[0])}
      y1={y(from[1])}
      x2={x(to[0])}
      y2={y(to[1])}
      stroke={`var(--viz-${color})`}
      strokeWidth={width}
      strokeDasharray={dashed ? '4 4' : undefined}
    />
  )
}

export function Polygon({ points, color = 'a', opacity = 0.15, stroke = true }: { points: Vec2[]; color?: VizColor; opacity?: number; stroke?: boolean }) {
  const { x, y } = usePlane()
  return (
    <polygon
      points={points.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')}
      fill={`var(--viz-${color})`}
      fillOpacity={opacity}
      stroke={stroke ? `var(--viz-${color})` : 'none'}
      strokeWidth={1.5}
    />
  )
}

export function Polyline({ points, color = 'a', width = 2, dashed }: { points: Vec2[]; color?: VizColor; width?: number; dashed?: boolean }) {
  const { x, y } = usePlane()
  return (
    <polyline
      points={points.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')}
      fill="none"
      stroke={`var(--viz-${color})`}
      strokeWidth={width}
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  )
}

export function Dot({ at, color = 'a', r = 4, opacity = 1 }: { at: Vec2; color?: VizColor; r?: number; opacity?: number }) {
  const { x, y } = usePlane()
  return <circle cx={x(at[0])} cy={y(at[1])} r={r} fill={`var(--viz-${color})`} fillOpacity={opacity} />
}

export function Label({ at, children, color = 'muted', size = 12, anchor = 'start' }: { at: Vec2; children: ReactNode; color?: VizColor; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const { x, y } = usePlane()
  return (
    <text x={x(at[0])} y={y(at[1])} fontSize={size} fill={`var(--viz-${color})`} textAnchor={anchor}>
      {children}
    </text>
  )
}

/** Punto arrastrable (ratón, táctil y teclado con flechas). */
export function Handle({
  at,
  onChange,
  color = 'a',
  snap = 0.5,
  bounds = 10,
  label,
  r = 9,
}: {
  at: Vec2
  onChange: (p: Vec2) => void
  color?: VizColor
  snap?: number
  bounds?: number
  label?: string
  /** Radio del círculo en píxeles del SVG. */
  r?: number
}) {
  const { x, y, toMath } = usePlane()
  const round = (v: number) => {
    const s = snap > 0 ? Math.round(v / snap) * snap : v
    return Math.max(-bounds, Math.min(bounds, Number(s.toFixed(4))))
  }
  return (
    <circle
      cx={x(at[0])}
      cy={y(at[1])}
      r={r}
      fill={`var(--viz-${color})`}
      fillOpacity={0.25}
      stroke={`var(--viz-${color})`}
      strokeWidth={2}
      className="cursor-grab outline-none focus:stroke-[3px] active:cursor-grabbing"
      tabIndex={0}
      role="slider"
      aria-label={label ?? 'Punto arrastrable'}
      aria-valuetext={`(${at[0]}, ${at[1]})`}
      onPointerDown={(e) => {
        ;(e.target as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!(e.target as Element).hasPointerCapture(e.pointerId)) return
        const [mx, my] = toMath(e.clientX, e.clientY)
        onChange([round(mx), round(my)])
      }}
      onKeyDown={(e) => {
        const step = snap || 0.1
        const d: Record<string, Vec2> = { ArrowUp: [0, step], ArrowDown: [0, -step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }
        const m = d[e.key]
        if (m) {
          e.preventDefault()
          onChange([round(at[0] + m[0]), round(at[1] + m[1])])
        }
      }}
    />
  )
}
