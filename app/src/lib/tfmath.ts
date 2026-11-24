/**
 * Matemática de transformers en TypeScript para las visualizaciones (sin dependencias).
 * Las mismas operaciones se implementan con NumPy en los laboratorios del curso.
 */
import type { Mat, Vec } from './linalg'
import { matMul, transpose } from './linalg'

// ── Softmax y atención ──────────────────────────────────────────────────────

/** Softmax numéricamente estable (resta el máximo). `temperature` divide los logits. */
export function softmax(x: Vec, temperature = 1): Vec {
  const z = x.map((v) => v / temperature)
  const m = Math.max(...z.filter((v) => Number.isFinite(v)))
  const e = z.map((v) => (Number.isFinite(v) ? Math.exp(v - m) : 0))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

export const rowSoftmax = (S: Mat, temperature = 1): Mat => S.map((r) => softmax(r, temperature))

/** Máscara causal aditiva: 0 donde j ≤ i y −∞ donde j > i. */
export function causalMask(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j <= i ? 0 : -Infinity)))
}

/** Puntuaciones QKᵀ/√d_k (más una máscara aditiva opcional). */
export function attentionScores(Q: Mat, K: Mat, mask?: Mat): Mat {
  const dk = Q[0].length
  const S = matMul(Q, transpose(K)).map((r) => r.map((v) => v / Math.sqrt(dk)))
  return mask ? S.map((r, i) => r.map((v, j) => v + mask[i][j])) : S
}

/** Atención por producto escalado: devuelve los pesos y la salida. */
export function attention(Q: Mat, K: Mat, V: Mat, mask?: Mat): { weights: Mat; out: Mat } {
  const weights = rowSoftmax(attentionScores(Q, K, mask))
  return { weights, out: matMul(weights, V) }
}

/** Entropía (en nats) de una distribución: mide lo «plana» que es una fila de atención. */
export function entropy(p: Vec): number {
  return -p.reduce((a, v) => a + (v > 0 ? v * Math.log(v) : 0), 0)
}

/**
 * Softmax «en línea» por bloques (la idea de FlashAttention): recorre los logits por trozos manteniendo
 * el máximo m y la suma l reescalada. Devuelve el mismo resultado que softmax(x) y los estados intermedios.
 */
export function onlineSoftmax(x: Vec, block: number): { p: Vec; states: { m: number; l: number }[] } {
  let m = -Infinity
  let l = 0
  const states: { m: number; l: number }[] = []
  for (let i = 0; i < x.length; i += block) {
    const chunk = x.slice(i, i + block)
    const mNew = Math.max(m, ...chunk)
    l = l * Math.exp(m - mNew) + chunk.reduce((a, v) => a + Math.exp(v - mNew), 0)
    m = mNew
    states.push({ m, l })
  }
  return { p: x.map((v) => Math.exp(v - m) / l), states }
}

// ── Posiciones ─────────────────────────────────────────────────────────────

/** Codificación posicional sinusoidal: PE[pos, 2i] = sin(pos/10000^(2i/d)), PE[pos, 2i+1] = cos(…). */
export function sinusoidalPE(nPos: number, d: number, base = 10000): Mat {
  return Array.from({ length: nPos }, (_, pos) =>
    Array.from({ length: d }, (_, k) => {
      const i = Math.floor(k / 2)
      const angle = pos / Math.pow(base, (2 * i) / d)
      return k % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
    }),
  )
}

/** Frecuencias de RoPE: θ_i = base^(−2i/d), i = 0 … d/2 − 1. */
export function ropeThetas(d: number, base = 10000): Vec {
  return Array.from({ length: d / 2 }, (_, i) => Math.pow(base, (-2 * i) / d))
}

/** Aplica RoPE a un vector x (dimensión par) en la posición `pos` (puede ser fraccionaria, como en PI). */
export function ropeRotate(x: Vec, pos: number, base = 10000): Vec {
  const th = ropeThetas(x.length, base)
  const out = x.slice()
  for (let i = 0; i < th.length; i++) {
    const a = pos * th[i]
    const c = Math.cos(a)
    const s = Math.sin(a)
    out[2 * i] = x[2 * i] * c - x[2 * i + 1] * s
    out[2 * i + 1] = x[2 * i] * s + x[2 * i + 1] * c
  }
  return out
}

export const dotv = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0)

export function cosine(a: Vec, b: Vec): number {
  const na = Math.sqrt(dotv(a, a))
  const nb = Math.sqrt(dotv(b, b))
  return na && nb ? dotv(a, b) / (na * nb) : 0
}

// ── Normalización ──────────────────────────────────────────────────────────

export function layerNorm(x: Vec, eps = 1e-5): Vec {
  const mu = x.reduce((a, b) => a + b, 0) / x.length
  const v = x.reduce((a, b) => a + (b - mu) ** 2, 0) / x.length
  return x.map((t) => (t - mu) / Math.sqrt(v + eps))
}

export function rmsNorm(x: Vec, eps = 1e-6): Vec {
  const r = Math.sqrt(x.reduce((a, b) => a + b * b, 0) / x.length + eps)
  return x.map((t) => t / r)
}

// ── Tokenización (BPE) ─────────────────────────────────────────────────────

export interface BpeStep {
  pair: [string, string]
  count: number
  /** Palabras (como listas de símbolos) después de aplicar esta fusión. */
  words: string[][]
}

/** Aprende `merges` fusiones BPE sobre un corpus de palabras (con frecuencia). Desempata por orden alfabético. */
export function learnBPE(corpus: Record<string, number>, merges: number): BpeStep[] {
  let words = Object.keys(corpus).map((w) => [...w, '_'])
  const freqs = Object.values(corpus)
  const steps: BpeStep[] = []
  for (let k = 0; k < merges; k++) {
    const counts = new Map<string, number>()
    words.forEach((w, wi) => {
      for (let i = 0; i < w.length - 1; i++) {
        const key = `${w[i]}\u0000${w[i + 1]}`
        counts.set(key, (counts.get(key) ?? 0) + freqs[wi])
      }
    })
    if (counts.size === 0) break
    const [best, count] = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]
    const [a, b] = best.split('\u0000') as [string, string]
    words = words.map((w) => {
      const out: string[] = []
      for (let i = 0; i < w.length; i++) {
        if (i < w.length - 1 && w[i] === a && w[i + 1] === b) {
          out.push(a + b)
          i++
        } else out.push(w[i])
      }
      return out
    })
    steps.push({ pair: [a, b], count, words })
  }
  return steps
}

// ── Series temporales ──────────────────────────────────────────────────────

/** Autocorrelación muestral para los retardos 0 … maxLag. */
export function acf(x: Vec, maxLag: number): Vec {
  const n = x.length
  const mu = x.reduce((a, b) => a + b, 0) / n
  const c0 = x.reduce((a, b) => a + (b - mu) ** 2, 0)
  return Array.from({ length: maxLag + 1 }, (_, k) => {
    let s = 0
    for (let t = k; t < n; t++) s += (x[t] - mu) * (x[t - k] - mu)
    return s / c0
  })
}

/** Tokenización estilo Chronos: escala por la media absoluta y asigna cada valor a una de `bins` cubetas en [lo, hi]. */
export function chronosTokenize(x: Vec, bins: number, lo = -5, hi = 5): { scale: number; ids: number[]; centers: Vec } {
  const scale = x.reduce((a, b) => a + Math.abs(b), 0) / x.length || 1
  const width = (hi - lo) / bins
  const centers = Array.from({ length: bins }, (_, i) => lo + (i + 0.5) * width)
  const ids = x.map((v) => Math.min(bins - 1, Math.max(0, Math.floor((v / scale - lo) / width))))
  return { scale, ids, centers }
}

/** Número de parches de longitud P con paso S en una serie de longitud L (PatchTST, sin relleno). */
export const numPatches = (L: number, P: number, S: number) => Math.floor((L - P) / S) + 1

// ── Difusión ───────────────────────────────────────────────────────────────

/** Programa lineal de β y el producto acumulado ᾱ_t = ∏(1 − β_s). */
export function linearSchedule(T: number, b0 = 1e-4, b1 = 0.02): { beta: Vec; alphaBar: Vec } {
  const beta = Array.from({ length: T }, (_, t) => b0 + ((b1 - b0) * t) / Math.max(1, T - 1))
  const alphaBar: Vec = []
  beta.reduce((acc, b, t) => (alphaBar[t] = acc * (1 - b)), 1)
  return { beta, alphaBar }
}

/** Programa coseno de ᾱ_t (Nichol y Dhariwal), t = 0 … T. */
export function cosineAlphaBar(T: number, s = 0.008): Vec {
  const f = (t: number) => Math.cos(((t / T + s) / (1 + s)) * (Math.PI / 2)) ** 2
  return Array.from({ length: T + 1 }, (_, t) => f(t) / f(0))
}

// ── Audio ──────────────────────────────────────────────────────────────────

export const hzToMel = (f: number) => 2595 * Math.log10(1 + f / 700)
export const melToHz = (m: number) => 700 * (10 ** (m / 2595) - 1)

/** Magnitud de la DFT (ingenua, O(n²): solo para señales cortas de las visualizaciones). */
export function dftMagnitude(x: Vec): Vec {
  const n = x.length
  return Array.from({ length: Math.floor(n / 2) + 1 }, (_, k) => {
    let re = 0
    let im = 0
    for (let t = 0; t < n; t++) {
      const a = (-2 * Math.PI * k * t) / n
      re += x[t] * Math.cos(a)
      im += x[t] * Math.sin(a)
    }
    return Math.hypot(re, im)
  })
}

/** Ventana de Hann de longitud n. */
export const hann = (n: number): Vec => Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)))

/** Espectrograma de magnitud: tramas de `win` muestras con salto `hop`, ventana de Hann. Filas = tramas. */
export function stft(x: Vec, win: number, hop: number): Mat {
  const w = hann(win)
  const frames: Mat = []
  for (let s = 0; s + win <= x.length; s += hop) frames.push(dftMagnitude(x.slice(s, s + win).map((v, i) => v * w[i])))
  return frames
}

// ── Producción ─────────────────────────────────────────────────────────────

/** Bytes de KV cache: 2 (K y V) · capas · cabezas KV · d_head · tokens · bytes por valor. */
export function kvCacheBytes(o: { layers: number; kvHeads: number; headDim: number; tokens: number; batch?: number; bytes?: number }): number {
  return 2 * o.layers * o.kvHeads * o.headDim * o.tokens * (o.batch ?? 1) * (o.bytes ?? 2)
}

/** Cuantización simétrica por tensor a `bits` bits: devuelve los valores reconstruidos y la escala. */
export function quantizeSymmetric(x: Vec, bits: number): { q: number[]; deq: Vec; scale: number } {
  const qmax = 2 ** (bits - 1) - 1
  const amax = Math.max(...x.map(Math.abs)) || 1
  const scale = amax / qmax
  const q = x.map((v) => Math.max(-qmax - 1, Math.min(qmax, Math.round(v / scale))))
  return { q, deq: q.map((v) => v * scale), scale }
}

/** Parámetros entrenables de LoRA de rango r sobre una matriz d_out × d_in. */
export const loraParams = (dOut: number, dIn: number, r: number) => r * (dOut + dIn)

/**
 * Iteración de Newton–Schulz de Muon (coeficientes quínticos de la implementación de referencia):
 * aproxima la matriz ortogonal más cercana a G (U Vᵀ de su SVD) sin calcular la SVD.
 */
export function newtonSchulz(G: Mat, steps = 5): Mat {
  const [a, b, c] = [3.4445, -4.775, 2.0315]
  const fro = Math.sqrt(G.flat().reduce((s, v) => s + v * v, 0)) + 1e-7
  let X = G.map((r) => r.map((v) => v / fro))
  for (let k = 0; k < steps; k++) {
    const A = matMul(X, transpose(X))
    const AA = matMul(A, A)
    const B = A.map((r, i) => r.map((v, j) => b * v + c * AA[i][j]))
    const BX = matMul(B, X)
    X = X.map((r, i) => r.map((v, j) => a * v + BX[i][j]))
  }
  return X
}

/** Puntuación UCT de un nodo de MCTS: Q/N + c·√(ln N_padre / N). */
export function uct(value: number, visits: number, parentVisits: number, c = Math.SQRT2): number {
  if (visits === 0) return Infinity
  return value / visits + c * Math.sqrt(Math.log(parentVisits) / visits)
}

/** Ventajas de GRPO: (r − media) / desviación dentro del grupo de respuestas a la misma pregunta. */
export function groupAdvantages(rewards: Vec): Vec {
  const n = rewards.length
  const mu = rewards.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(rewards.reduce((a, b) => a + (b - mu) ** 2, 0) / n)
  return rewards.map((r) => (sd > 0 ? (r - mu) / sd : 0))
}

/** Retornos descontados G_t = r_t + γ G_{t+1}. */
export function discountedReturns(rewards: Vec, gamma: number): Vec {
  const out = new Array<number>(rewards.length)
  let g = 0
  for (let t = rewards.length - 1; t >= 0; t--) out[t] = g = rewards[t] + gamma * g
  return out
}

/** IoU entre dos máscaras binarias del mismo tamaño. */
export function iou(a: number[][], b: number[][]): number {
  let inter = 0
  let uni = 0
  a.forEach((r, i) =>
    r.forEach((v, j) => {
      const w = b[i][j]
      if (v && w) inter++
      if (v || w) uni++
    }),
  )
  return uni ? inter / uni : 1
}
