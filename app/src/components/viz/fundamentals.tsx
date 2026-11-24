import { useMemo, useState } from 'react'
import type { Vec2 } from '../../lib/linalg'
import { rng } from '../../lib/random'
import {
  attention,
  causalMask,
  cosine,
  dotv,
  entropy,
  layerNorm,
  learnBPE,
  rmsNorm,
  ropeRotate,
  sinusoidalPE,
  softmax,
} from '../../lib/tfmath'
import { Bars, Heatmap, Legend, LineChart, TokenChips } from './charts'
import { Readout, Segmented, Slider, VizLayout } from './controls'
import { Arrow, Dot, Handle, Label, Plane } from './plane'

// ── Tokenización ───────────────────────────────────────────────────────────

const BPE_CORPUS: Record<string, number> = {
  bajo: 6,
  bajar: 3,
  bajamos: 2,
  cantar: 5,
  cantamos: 4,
  saltar: 3,
  saltamos: 2,
  alto: 4,
}

/** Paso a paso del algoritmo BPE sobre un mini-corpus de palabras con su frecuencia. */
export function BPEMerges() {
  const steps = useMemo(() => learnBPE(BPE_CORPUS, 14), [])
  const [k, setK] = useState(0)
  const words = k === 0 ? Object.keys(BPE_CORPUS).map((w) => [...w, '_']) : steps[k - 1].words
  const vocab = new Set<string>()
  Object.keys(BPE_CORPUS).forEach((w) => [...w, '_'].forEach((c) => vocab.add(c)))
  steps.slice(0, k).forEach((s) => vocab.add(s.pair.join('')))
  const totalTokens = words.reduce((a, w, i) => a + w.length * Object.values(BPE_CORPUS)[i], 0)
  return (
    <VizLayout
      plot={
        <div className="space-y-2">
          {words.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-8 text-right font-mono text-xs text-slate-400">×{Object.values(BPE_CORPUS)[i]}</span>
              <TokenChips tokens={w} tone={(j) => (k > 0 && w[j] === steps[k - 1].pair.join('') ? 'c' : w[j].length > 1 ? 'a' : undefined)} />
            </div>
          ))}
        </div>
      }
      side={
        <>
          <Slider label="Fusiones" value={k} min={0} max={steps.length} step={1} onChange={setK} />
          <Readout
            items={[
              k > 0 ? `\\text{fusión } ${k}: \\texttt{${steps[k - 1].pair[0]}} + \\texttt{${steps[k - 1].pair[1]}} \\;(${steps[k - 1].count}\\text{ veces})` : '\\text{caracteres sueltos}',
              `|V| = ${vocab.size}\\text{ símbolos}`,
              `\\text{tokens en el corpus} = ${totalTokens}`,
            ]}
          />
          <p className="text-xs text-slate-500">
            «_» marca el final de palabra. Cada fusión añade un símbolo al vocabulario y acorta las secuencias: el par más frecuente se
            convierte en un token nuevo.
          </p>
        </>
      }
    />
  )
}

// ── Embeddings y posiciones ────────────────────────────────────────────────

/** Mapa de calor de la codificación posicional sinusoidal y similitud entre posiciones. */
export function PositionalEncodingViz() {
  const [d, setD] = useState(32)
  const [ref, setRef] = useState(10)
  const N = 48
  const PE = useMemo(() => sinusoidalPE(N, d), [d])
  const sims = PE.map((p) => cosine(p, PE[ref]))
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Heatmap values={transposeN(PE)} cell={9} diverging ariaLabel="Codificación posicional: filas = dimensiones, columnas = posiciones" highlight={(_, j) => j === ref} />
      </div>
      <p className="text-xs text-slate-500">Filas: dimensiones (de arriba, alta frecuencia, a abajo, baja frecuencia). Columnas: posiciones 0–{N - 1}. Azul = positivo, rojo = negativo.</p>
      <VizLayout
        plot={<LineChart series={[{ y: sims, color: 'a', dots: true }]} yRange={[-0.2, 1]} xLabel="posición" vlines={[[ref, 'd']]} height={180} />}
        side={
          <>
            <Slider label="d_model" value={d} min={8} max={64} step={8} onChange={setD} />
            <Slider label="Posición ref." value={ref} min={0} max={N - 1} step={1} onChange={setRef} />
            <p className="text-xs text-slate-500">Coseno entre la codificación de la posición elegida y las demás: es máximo en ella misma y decae con la distancia. Así el modelo puede «sentir» lo cerca que están dos tokens.</p>
          </>
        }
      />
    </div>
  )
}

function transposeN(M: number[][]): number[][] {
  return M[0].map((_, j) => M.map((r) => r[j]))
}

/** Embeddings 2D de un vocabulario pequeño: la similitud coseno agrupa palabras parecidas. */
export function EmbeddingSpace() {
  const words: [string, Vec2][] = [
    ['rey', [3, 3.2]],
    ['reina', [2.4, 3.8]],
    ['príncipe', [3.4, 2.4]],
    ['perro', [-3, -1]],
    ['gato', [-3.4, -0.2]],
    ['manzana', [1.5, -3.2]],
    ['pera', [2.2, -3.6]],
  ]
  const [q, setQ] = useState<Vec2>([2.5, 2.5])
  const sims = words.map(([, v]) => cosine(q, v))
  const order = sims.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0])
  return (
    <VizLayout
      plot={
        <Plane xRange={[-5, 5]} yRange={[-5, 5]}>
          {words.map(([w, v], i) => (
            <g key={w}>
              <Dot at={v} color={i === order[0][1] ? 'c' : 'muted'} r={5} />
              <Label at={[v[0] + 0.2, v[1] + 0.25]}>{w}</Label>
            </g>
          ))}
          <Arrow to={q} color="a" label="consulta" />
          <Handle at={q} onChange={setQ} color="a" label="Vector de consulta" />
        </Plane>
      }
      side={
        <>
          <p className="text-sm">Arrastra la consulta. Similitud coseno con cada palabra:</p>
          <Bars values={order.map(([s]) => s)} labels={order.map(([, i]) => words[i][0])} signed max={1} />
        </>
      }
    />
  )
}

// ── Atención ───────────────────────────────────────────────────────────────

const ATT_KEYS: [string, Vec2][] = [
  ['el', [-2, 0.5]],
  ['gato', [3, 1]],
  ['se', [-1, -2]],
  ['subió', [1, 3]],
  ['al', [-3, -1]],
  ['tejado', [2.5, -2]],
]

/** Una query arrastrable frente a seis keys: el producto punto, el escalado y la softmax en vivo. */
export function AttentionExplorer() {
  const [q, setQ] = useState<Vec2>([2, 1.5])
  const [scale, setScale] = useState(1)
  const scores = ATT_KEYS.map(([, k]) => dotv(q, k) / scale)
  const w = softmax(scores)
  const best = w.indexOf(Math.max(...w))
  const out: Vec2 = [0, 1].map((d) => ATT_KEYS.reduce((a, [, k], i) => a + w[i] * k[d], 0)) as Vec2
  return (
    <VizLayout
      plot={
        <Plane xRange={[-5, 5]} yRange={[-5, 5]}>
          {ATT_KEYS.map(([t, k], i) => (
            <g key={t}>
              <Arrow to={k} color="muted" width={1 + 4 * w[i]} />
              <Label at={[k[0] + 0.15, k[1] + 0.3]} color={i === best ? 'c' : 'muted'}>
                {t}
              </Label>
            </g>
          ))}
          <Arrow to={out} color="c" dashed label="salida" />
          <Arrow to={q} color="a" label="q" />
          <Handle at={q} onChange={setQ} color="a" label="Query" />
        </Plane>
      }
      side={
        <>
          <Slider label="Divisor √dₖ" value={scale} min={0.25} max={4} step={0.25} onChange={setScale} />
          <Bars values={w} labels={ATT_KEYS.map(([t]) => t)} max={1} highlight={best} />
          <Readout items={[`H = ${entropy(w).toFixed(2)}\\text{ nats (máx. } ${Math.log(w.length).toFixed(2)})`]} />
          <p className="text-xs text-slate-500">
            Las flechas grises son las keys (su grosor, el peso). La salida (verde) es la media de los values ponderada por la atención;
            aquí values = keys para verlo en el plano. Un divisor pequeño hace la softmax más «picuda»; uno grande, más plana.
          </p>
        </>
      }
    />
  )
}

/** Matriz de atención completa de una frase con embeddings y proyecciones aleatorias reproducibles. */
const AM_TOKENS = ['el', 'banco', 'del', 'río', 'estaba', 'lleno']

export function AttentionMatrix() {
  const tokens = AM_TOKENS
  const [dk, setDk] = useState(4)
  const [seed, setSeed] = useState(3)
  const [causal, setCausal] = useState<'no' | 'si'>('no')
  const { weights } = useMemo(() => {
    const r = rng(seed)
    const X = tokens.map(() => Array.from({ length: 8 }, () => r.normal()))
    const W = () => Array.from({ length: 8 }, () => Array.from({ length: dk }, () => r.normal() / Math.sqrt(2)))
    const [Wq, Wk, Wv] = [W(), W(), W()]
    const proj = (A: number[][], B: number[][]) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, i) => s + v * B[i][j], 0)))
    return attention(proj(X, Wq), proj(X, Wk), proj(X, Wv), causal === 'si' ? causalMask(tokens.length) : undefined)
  }, [dk, seed, causal, tokens])
  return (
    <VizLayout
      plot={<Heatmap values={weights} rowLabels={tokens} colLabels={tokens} cell={40} showValues max={1} ariaLabel="Pesos de atención" />}
      side={
        <>
          <Slider label="dₖ" value={dk} min={1} max={8} step={1} onChange={setDk} />
          <Slider label="Semilla" value={seed} min={1} max={20} step={1} onChange={setSeed} />
          <Segmented value={causal} onChange={setCausal} options={[{ value: 'no', label: 'Bidireccional' }, { value: 'si', label: 'Causal' }]} />
          <p className="text-xs text-slate-500">
            Fila = token que pregunta (query); columna = token consultado (key). Cada fila suma 1. Con la máscara causal, cada token solo ve los
            anteriores. Los pesos son aleatorios (sin entrenar): cambia la semilla para ver otras matrices.
          </p>
        </>
      }
    />
  )
}

/** Varianza del producto punto de vectores aleatorios en función de d_k, con y sin escalado. */
export function ScalingWhy() {
  const [dk, setDk] = useState(64)
  const r = useMemo(() => rng(11), [])
  const sample = useMemo(() => {
    const logits = Array.from({ length: 8 }, () => {
      const q = Array.from({ length: dk }, r.normal)
      const k = Array.from({ length: dk }, r.normal)
      return dotv(q, k)
    })
    return logits
  }, [dk, r])
  const raw = softmax(sample)
  const scaled = softmax(sample.map((v) => v / Math.sqrt(dk)))
  const labels = sample.map((_, i) => `k${i + 1}`)
  return (
    <VizLayout
      plot={
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold">Sin escalar: softmax(q·k)</p>
            <Bars values={raw} labels={labels} max={1} color="b" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold">Escalado: softmax(q·k/√dₖ)</p>
            <Bars values={scaled} labels={labels} max={1} color="c" />
          </div>
        </div>
      }
      side={
        <>
          <Slider label="dₖ" value={dk} min={1} max={512} step={1} onChange={setDk} />
          <Readout items={[`\\operatorname{Var}(q\\cdot k) = d_k = ${dk}`, `\\text{desv. típica} \\approx ${Math.sqrt(dk).toFixed(1)}`]} />
          <p className="text-xs text-slate-500">
            Con componentes de varianza 1, el producto punto tiene varianza dₖ. Sin dividir por √dₖ, la softmax se satura (casi todo el peso
            en un token) y sus gradientes se anulan.
          </p>
        </>
      }
    />
  )
}

// ── Multi-cabeza ───────────────────────────────────────────────────────────

const MH_TOKENS = ['la', 'niña', 'que', 'vimos', 'ayer', 'canta']
const HEAD_PATTERNS: Record<string, { name: string; desc: string; M: number[][] }> = {
  prev: {
    name: 'Token anterior',
    desc: 'Cada token mira al inmediatamente anterior: útil para copiar patrones locales (bigramas).',
    M: MH_TOKENS.map((_, i) => MH_TOKENS.map((_, j) => (i === 0 ? (j === 0 ? 1 : 0) : j === i - 1 ? 0.85 : j === i ? 0.15 : 0))),
  },
  sintaxis: {
    name: 'Sujeto ↔ verbo',
    desc: '«canta» atiende a «niña» (su sujeto) aunque estén lejos; «vimos» atiende a «que».',
    M: MH_TOKENS.map((t) =>
      MH_TOKENS.map((u) => {
        if (t === 'canta') return u === 'niña' ? 0.8 : u === 'la' ? 0.1 : u === 'canta' ? 0.1 : 0
        if (t === 'vimos') return u === 'que' ? 0.6 : u === 'niña' ? 0.3 : u === 'vimos' ? 0.1 : 0
        return t === u ? 1 : 0
      }),
    ),
  },
  global: {
    name: 'Promedio global',
    desc: 'Reparte la atención casi por igual: resume el contexto completo.',
    M: MH_TOKENS.map(() => MH_TOKENS.map(() => 1 / MH_TOKENS.length)),
  },
}

/** Tres cabezas con patrones distintos sobre la misma frase. */
export function MultiHeadPatterns() {
  const [h, setH] = useState<keyof typeof HEAD_PATTERNS>('prev')
  const head = HEAD_PATTERNS[h]
  return (
    <VizLayout
      plot={<Heatmap values={head.M} rowLabels={MH_TOKENS} colLabels={MH_TOKENS} cell={40} showValues max={1} />}
      side={
        <>
          <Segmented
            value={h}
            onChange={setH}
            options={Object.entries(HEAD_PATTERNS).map(([k, v]) => ({ value: k as keyof typeof HEAD_PATTERNS, label: v.name }))}
          />
          <p className="text-sm">{head.desc}</p>
          <p className="text-xs text-slate-500">
            Patrones ilustrativos inspirados en los que se observan en modelos entrenados. Ninguna cabeza sola basta: la proyección W_O combina
            lo que aporta cada una.
          </p>
        </>
      }
    />
  )
}

/** Calculadora de dimensiones y parámetros de la atención multi-cabeza. */
export function MultiHeadShapes() {
  const [dModel, setDModel] = useState(512)
  const [h, setH] = useState(8)
  const valid = dModel % h === 0
  const dk = dModel / h
  const params = 4 * dModel * dModel + 4 * dModel
  return (
    <VizLayout
      plot={
        <div className="space-y-2">
          <div className="flex h-8 overflow-hidden rounded border border-slate-300 dark:border-slate-700">
            {Array.from({ length: h }, (_, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center border-r border-white text-[10px] font-semibold text-white last:border-0 dark:border-slate-950"
                style={{ background: `var(--viz-${(['a', 'b', 'c', 'd'] as const)[i % 4]})` }}
              >
                {h <= 16 ? `h${i + 1}` : ''}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">El vector de {dModel} dimensiones se reparte en {h} trozos de {valid ? dk : '—'} dimensiones: uno por cabeza.</p>
        </div>
      }
      side={
        <>
          <Slider label="d_model" value={dModel} min={64} max={1024} step={64} onChange={setDModel} />
          <Slider label="Cabezas h" value={h} min={1} max={32} step={1} onChange={setH} />
          <Readout
            items={[
              valid ? `d_k = d_{model}/h = ${dk}` : `\\text{${dModel} no es divisible entre ${h}}`,
              `\\text{parámetros} = 4d_{model}^2 + 4d_{model} = ${params.toLocaleString('es')}`,
            ]}
          />
          <p className="text-xs text-slate-500">El número de parámetros no depende de h: más cabezas no cuestan más, solo reparten el mismo espacio.</p>
        </>
      }
    />
  )
}

// ── Bloque transformer ─────────────────────────────────────────────────────

/** Compara LayerNorm y RMSNorm sobre un vector editable. */
export function NormCompare() {
  const [x, setX] = useState([2, -1, 4, 0.5, 3])
  const ln = layerNorm(x)
  const rms = rmsNorm(x)
  const labels = x.map((_, i) => `x${i + 1}`)
  return (
    <VizLayout
      plot={
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-semibold">Entrada x</p>
            <Bars values={x} labels={labels} signed max={5} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold">LayerNorm</p>
            <Bars values={ln} labels={labels} signed max={2.5} color="c" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold">RMSNorm</p>
            <Bars values={rms} labels={labels} signed max={2.5} color="d" />
          </div>
        </div>
      }
      side={
        <>
          {x.map((v, i) => (
            <Slider key={i} label={`x${i + 1}`} value={v} min={-5} max={5} step={0.5} onChange={(n) => setX(x.map((u, j) => (j === i ? n : u)))} />
          ))}
          <p className="text-xs text-slate-500">
            LayerNorm resta la media y divide por la desviación típica; RMSNorm solo divide por la raíz de la media de los cuadrados. Prueba a
            sumar la misma cantidad a todas las componentes: LayerNorm no cambia, RMSNorm sí.
          </p>
        </>
      }
    />
  )
}

/** Recorrido de un token por el flujo residual de un bloque pre-norm. */
export function ResidualStream() {
  const steps = [
    { name: 'Entrada x', detail: 'El embedding del token (más su posición) entra en el flujo residual.' },
    { name: 'Norm₁(x)', detail: 'Se normaliza una copia; el original sigue por la «autopista» residual.' },
    { name: 'Atención', detail: 'La copia normalizada mezcla información de los demás tokens.' },
    { name: 'x + Atención', detail: 'Primera suma residual: el bloque solo añade una corrección a x.' },
    { name: 'Norm₂', detail: 'Se normaliza de nuevo una copia.' },
    { name: 'FFN', detail: 'Red feed-forward por posición: expande a ~4·d, aplica la no linealidad y vuelve a d.' },
    { name: 'Salida', detail: 'Segunda suma residual. La salida tiene la misma forma que la entrada: los bloques se apilan.' },
  ]
  const [k, setK] = useState(0)
  const boxes = [
    { label: 'x', x: 20, y: 120 },
    { label: 'Norm', x: 110, y: 60 },
    { label: 'Atención', x: 200, y: 60 },
    { label: '⊕', x: 300, y: 120 },
    { label: 'Norm', x: 370, y: 60 },
    { label: 'FFN', x: 450, y: 60 },
    { label: '⊕', x: 540, y: 120 },
  ]
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 600 170" className="h-auto w-full" role="img" aria-label="Bloque transformer pre-norm">
        <line x1={20} y1={135} x2={590} y2={135} stroke="var(--viz-muted)" strokeWidth={3} />
        <text x={430} y={160} fontSize={11} fill="var(--viz-muted)">
          flujo residual
        </text>
        {boxes.map((b, i) => (
          <g key={i}>
            {i > 0 && b.y === 60 && boxes[i - 1].y === 120 && <path d={`M${boxes[i - 1].x + 20},135 V75 H${b.x}`} fill="none" stroke="var(--viz-axis)" />}
            {b.label === '⊕' && <path d={`M${boxes[i - 1].x + 60},75 H${b.x + 15} V120`} fill="none" stroke="var(--viz-axis)" />}
            <rect
              x={b.x}
              y={b.y}
              width={b.label === '⊕' ? 30 : 70}
              height={30}
              rx={6}
              fill={i <= k ? 'var(--viz-a)' : 'var(--viz-grid)'}
              opacity={i === k ? 1 : i < k ? 0.45 : 0.6}
            />
            <text x={b.x + (b.label === '⊕' ? 15 : 35)} y={b.y + 20} fontSize={12} textAnchor="middle" fill={i <= k ? '#fff' : 'var(--viz-text)'} fontWeight={600}>
              {b.label}
            </text>
          </g>
        ))}
      </svg>
      <Slider label="Paso" value={k} min={0} max={steps.length - 1} step={1} onChange={setK} />
      <p className="text-sm">
        <strong>{steps[k].name}.</strong> {steps[k].detail}
      </p>
    </div>
  )
}

// ── Máscaras ───────────────────────────────────────────────────────────────

/** Tipos de máscara: qué pares (query, key) están permitidos. */
export function MaskViz() {
  const [mode, setMode] = useState<'bi' | 'causal' | 'pad' | 'cross'>('causal')
  const src = ['I', 'love', 'cats', '<pad>', '<pad>']
  const tgt = ['<s>', 'amo', 'los', 'gatos']
  const rows = mode === 'cross' ? tgt : src
  const cols = src
  const M = rows.map((_, i) =>
    cols.map((c, j) => {
      if (mode === 'bi') return 1
      if (mode === 'causal') return j <= i ? 1 : -Infinity
      if (mode === 'pad') return c === '<pad>' ? -Infinity : 1
      return c === '<pad>' ? -Infinity : 1
    }),
  )
  const desc = {
    bi: 'Encoder (BERT): todos ven a todos, incluido el padding si no se enmascara.',
    causal: 'Decoder (GPT): el token i solo ve las posiciones ≤ i. Así se entrena prediciendo el siguiente token en paralelo.',
    pad: 'Máscara de padding: las posiciones de relleno no deben recibir atención (para cualquier query).',
    cross: 'Cross-attention: las queries vienen del decoder (español) y las keys/values del encoder (inglés), sin el padding.',
  }[mode]
  return (
    <VizLayout
      plot={<Heatmap values={M} rowLabels={rows} colLabels={cols} cell={42} max={1} ariaLabel="Máscara de atención" />}
      side={
        <>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'bi', label: 'Bidireccional' },
              { value: 'causal', label: 'Causal' },
              { value: 'pad', label: 'Padding' },
              { value: 'cross', label: 'Cross' },
            ]}
          />
          <p className="text-sm">{desc}</p>
          <p className="text-xs text-slate-500">Celdas tachadas = −∞ antes de la softmax (peso 0).</p>
        </>
      }
    />
  )
}

// ── RoPE y contexto largo ──────────────────────────────────────────────────

/** RoPE en 2D: q en la posición m y k en la posición n giran; su producto solo depende de n − m. */
export function RoPEViz() {
  const [m, setM] = useState(2)
  const [n, setN] = useState(5)
  const [theta, setTheta] = useState(0.4)
  const q: Vec2 = [3, 1]
  const k: Vec2 = [2, 2.5]
  const rot = (v: Vec2, pos: number): Vec2 => {
    const a = pos * theta
    return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]
  }
  const qm = rot(q, m)
  const kn = rot(k, n)
  return (
    <VizLayout
      plot={
        <Plane xRange={[-4.5, 4.5]} yRange={[-4.5, 4.5]}>
          <Arrow to={q} color="muted" dashed />
          <Arrow to={k} color="muted" dashed />
          <Arrow to={qm} color="a" label={`q·R(${m})`} />
          <Arrow to={kn} color="b" label={`k·R(${n})`} />
        </Plane>
      }
      side={
        <>
          <Slider label="Posición m (q)" value={m} min={0} max={20} step={1} onChange={setM} />
          <Slider label="Posición n (k)" value={n} min={0} max={20} step={1} onChange={setN} />
          <Slider label="θ" value={theta} min={0.05} max={1.5} step={0.05} onChange={setTheta} />
          <Readout
            items={[
              `n - m = ${n - m}`,
              `\\langle R_m q,\\, R_n k\\rangle = ${dotv(qm, kn).toFixed(3)}`,
              `\\langle q,\\, R_{n-m} k\\rangle = ${dotv(q, rot(k, n - m)).toFixed(3)}`,
            ]}
          />
          <p className="text-xs text-slate-500">Mueve m y n a la vez (misma diferencia): ambos vectores giran, pero el ángulo entre ellos y el producto punto no cambian.</p>
        </>
      }
    />
  )
}

/** Producto q·k con RoPE en función de la distancia, con y sin interpolación de posiciones (PI). */
export function RoPEDistance() {
  const [d, setD] = useState(32)
  const [factor, setFactor] = useState(1)
  const N = 128
  const q = useMemo(() => Array.from({ length: d }, () => 1), [d])
  const ys = Array.from({ length: N }, (_, dist) => dotv(ropeRotate(q, 0), ropeRotate(q, dist / factor)) / d)
  return (
    <VizLayout
      plot={<LineChart series={[{ y: ys, color: 'a' }]} yRange={[-0.4, 1]} xLabel="distancia n − m (tokens)" height={200} />}
      side={
        <>
          <Slider label="d" value={d} min={8} max={128} step={8} onChange={setD} />
          <Slider label="Factor PI (L′/L)" value={factor} min={1} max={8} step={1} onChange={setFactor} />
          <p className="text-xs text-slate-500">
            Con q = k = (1,…,1), el producto decae (con oscilaciones) al alejarse: RoPE da a los tokens cercanos más peso. Con interpolación
            (PI), las posiciones se dividen por el factor, de modo que una distancia nueva «se parece» a una que el modelo ya vio.
          </p>
        </>
      }
    />
  )
}

/** El problema del pajar: la probabilidad de la aguja cae al crecer el contexto. */
export function HaystackSoftmax() {
  const [gap, setGap] = useState(3)
  const [temp, setTemp] = useState(1)
  const Ns = [16, 64, 256, 1024, 4096, 16384, 65536, 262144, 1048576]
  const pNeedle = (N: number, t: number) => Math.exp(gap / t) / (Math.exp(gap / t) + (N - 1))
  // Escalado logarítmico de la temperatura (Scalable-Softmax): multiplica los logits por s·log N
  const pSSMax = (N: number) => Math.exp((gap * 0.43 * Math.log(N)) / temp) / (Math.exp((gap * 0.43 * Math.log(N)) / temp) + (N - 1))
  return (
    <VizLayout
      plot={
        <>
          <LineChart
            series={[
              { x: Ns.map((n) => Math.log2(n)), y: Ns.map((n) => pNeedle(n, temp)), color: 'b', dots: true },
              { x: Ns.map((n) => Math.log2(n)), y: Ns.map(pSSMax), color: 'c', dots: true },
            ]}
            yRange={[0, 1]}
            xLabel="log₂ N (tokens de contexto)"
            height={200}
          />
          <Legend items={[{ label: 'softmax normal', color: 'b' }, { label: 'logits escalados con log N', color: 'c' }]} />
        </>
      }
      side={
        <>
          <Slider label="Ventaja de la aguja" value={gap} min={0} max={10} step={0.5} onChange={setGap} />
          <Slider label="Temperatura" value={temp} min={0.25} max={2} step={0.25} onChange={setTemp} />
          <p className="text-xs text-slate-500">
            Una key relevante tiene un logit {gap} unidades mayor que N − 1 keys irrelevantes. Su peso es e^{gap}/(e^{gap} + N − 1): con
            millones de tokens se diluye. Escalar los logits con log N mantiene el foco.
          </p>
        </>
      }
    />
  )
}
