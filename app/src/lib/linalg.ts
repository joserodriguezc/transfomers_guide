/**
 * Utilidades pequeñas de álgebra lineal para las visualizaciones (sin Pyodide).
 * Pensadas para vectores/matrices de 2x2 o 3x3; para cálculos serios se usa NumPy.
 */

export type Vec = number[]
export type Mat = number[][]
export type Vec2 = [number, number]
export type Mat2 = [[number, number], [number, number]]

export const add = (a: Vec, b: Vec): Vec => a.map((x, i) => x + b[i])
export const sub = (a: Vec, b: Vec): Vec => a.map((x, i) => x - b[i])
export const scale = (a: Vec, s: number): Vec => a.map((x) => x * s)
export const hadamard = (a: Vec, b: Vec): Vec => a.map((x, i) => x * b[i])
export const dot = (a: Vec, b: Vec): number => a.reduce((acc, x, i) => acc + x * b[i], 0)

export const normL1 = (a: Vec) => a.reduce((acc, x) => acc + Math.abs(x), 0)
export const normL2 = (a: Vec) => Math.sqrt(dot(a, a))
export const normMax = (a: Vec) => Math.max(...a.map(Math.abs))

/** Ángulo entre dos vectores en radianes (0 si alguno es nulo). */
export function angle(a: Vec, b: Vec): number {
  const d = normL2(a) * normL2(b)
  if (d === 0) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / d)))
}

/** Proyección de a sobre b. */
export function project(a: Vec, b: Vec): Vec {
  const bb = dot(b, b)
  return bb === 0 ? b.map(() => 0) : scale(b, dot(a, b) / bb)
}

export const shape = (A: Mat): [number, number] => [A.length, A[0]?.length ?? 0]

export function transpose(A: Mat): Mat {
  const [m, n] = shape(A)
  return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => A[i][j]))
}

export function matVec(A: Mat, v: Vec): Vec {
  return A.map((row) => dot(row, v))
}

export function matMul(A: Mat, B: Mat): Mat {
  const [m, n] = shape(A)
  const [n2, p] = shape(B)
  if (n !== n2) throw new Error(`Formas incompatibles: (${m}, ${n}) · (${n2}, ${p})`)
  const Bt = transpose(B)
  return A.map((row) => Bt.map((col) => dot(row, col)))
}

export const det2 = (A: Mat): number => A[0][0] * A[1][1] - A[0][1] * A[1][0]

export function inv2(A: Mat): Mat | null {
  const d = det2(A)
  if (Math.abs(d) < 1e-12) return null
  return [
    [A[1][1] / d, -A[0][1] / d],
    [-A[1][0] / d, A[0][0] / d],
  ]
}

export const trace = (A: Mat): number => A.reduce((acc, row, i) => acc + row[i], 0)

export interface Eigen2 {
  values: [number, number]
  /** Vectores propios unitarios (columnas), en el mismo orden que values. */
  vectors: [Vec2, Vec2]
}

/** Eigendescomposición real de una matriz 2x2; null si los valores propios son complejos. */
export function eig2(A: Mat): Eigen2 | null {
  const t = trace(A)
  const d = det2(A)
  const disc = (t * t) / 4 - d
  if (disc < -1e-12) return null
  const r = Math.sqrt(Math.max(0, disc))
  const l1 = t / 2 + r
  const l2 = t / 2 - r
  const vecFor = (l: number, fallback: Vec2): Vec2 => {
    const [[a, b], [c, dd]] = A
    let v: Vec2
    if (Math.abs(b) > 1e-12) v = [b, l - a]
    else if (Math.abs(c) > 1e-12) v = [l - dd, c]
    else v = fallback
    const n = Math.hypot(v[0], v[1])
    return [v[0] / n, v[1] / n]
  }
  const v1 = vecFor(l1, [1, 0])
  let v2 = vecFor(l2, [0, 1])
  // Para matrices diagonales con valores repetidos o ya ordenadas, evita duplicar vectores
  if (Math.abs(l1 - l2) < 1e-12) v2 = [-v1[1], v1[0]]
  return { values: [l1, l2], vectors: [v1, v2] }
}

/** Media por columnas de una matriz de datos (filas = observaciones). */
export function mean(X: Mat): Vec {
  const [m, n] = shape(X)
  return Array.from({ length: n }, (_, j) => X.reduce((acc, r) => acc + r[j], 0) / m)
}

/** Matriz de covarianza muestral (divide por m − 1), como numpy.cov(X.T). */
export function cov(X: Mat): Mat {
  const [m, n] = shape(X)
  const mu = mean(X)
  const C = Array.from({ length: n }, () => Array(n).fill(0) as number[])
  for (const r of X) {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) C[i][j] += (r[i] - mu[i]) * (r[j] - mu[j])
  }
  return C.map((row) => row.map((x) => x / (m - 1)))
}

/** Recta de mínimos cuadrados y = b0 + b1·x para puntos 2D. */
export function fitLine(points: Vec2[]): { b0: number; b1: number } | null {
  const n = points.length
  if (n < 2) return null
  const mx = points.reduce((a, p) => a + p[0], 0) / n
  const my = points.reduce((a, p) => a + p[1], 0) / n
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2
    sxy += (x - mx) * (y - my)
  }
  if (sxx < 1e-12) return null
  const b1 = sxy / sxx
  return { b0: my - b1 * mx, b1 }
}

/** Redondea para mostrar, evitando "-0". */
export function fmt(x: number, digits = 2): string {
  const r = Number(x.toFixed(digits))
  return (Object.is(r, -0) ? 0 : r).toString()
}

export interface LUStep {
  /** Estado de U (la matriz que se va triangulando) tras este paso. */
  U: Mat
  /** Estado de L (multiplicadores acumulados) tras este paso. */
  L: Mat
  /** Fila que se modifica (null en el estado inicial/final). */
  row: number | null
  pivotRow: number | null
  col: number | null
  multiplier: number | null
  /** Error si aparece un pivote nulo y haría falta pivoteo. */
  error?: string
}

/**
 * Eliminación gaussiana sin pivoteo (Doolittle), paso a paso: cada paso anula un elemento
 * bajo la diagonal y guarda el multiplicador en L. Devuelve los estados intermedios.
 */
export function luSteps(A: Mat): LUStep[] {
  const n = A.length
  const U = A.map((r) => [...r])
  const L: Mat = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  const snap = (s: Partial<LUStep>): LUStep => ({
    U: U.map((r) => [...r]),
    L: L.map((r) => [...r]),
    row: null,
    pivotRow: null,
    col: null,
    multiplier: null,
    ...s,
  })
  const steps: LUStep[] = [snap({})]
  for (let k = 0; k < n - 1; k++) {
    if (Math.abs(U[k][k]) < 1e-12) {
      steps.push(snap({ col: k, pivotRow: k, error: `El pivote u${k + 1}${k + 1} es 0: hace falta intercambiar filas (pivoteo, matriz P).` }))
      return steps
    }
    for (let i = k + 1; i < n; i++) {
      const m = U[i][k] / U[k][k]
      L[i][k] = m
      for (let j = 0; j < n; j++) U[i][j] -= m * U[k][j]
      U[i][k] = 0 // evita residuos de redondeo
      steps.push(snap({ row: i, pivotRow: k, col: k, multiplier: m }))
    }
  }
  return steps
}

/** Gram-Schmidt en 2D: devuelve Q (columnas ortonormales) y R (triangular superior) con A = QR. */
export function qr2(a1: Vec2, a2: Vec2): { q1: Vec2; q2: Vec2; R: Mat; proj: Vec2; perp: Vec2 } | null {
  const r11 = Math.hypot(a1[0], a1[1])
  if (r11 < 1e-12) return null
  const q1: Vec2 = [a1[0] / r11, a1[1] / r11]
  const r12 = dot(q1, a2)
  const proj: Vec2 = [r12 * q1[0], r12 * q1[1]]
  const perp: Vec2 = [a2[0] - proj[0], a2[1] - proj[1]]
  const r22 = Math.hypot(perp[0], perp[1])
  if (r22 < 1e-12) return null
  const q2: Vec2 = [perp[0] / r22, perp[1] / r22]
  return { q1, q2, R: [[r11, r12], [0, r22]], proj, perp }
}

/** SVD de una matriz 2x2: A = U Σ Vᵀ, con σ1 ≥ σ2 ≥ 0. */
export function svd2(A: Mat): { U: Mat; s: [number, number]; Vt: Mat } {
  const AtA = matMul(transpose(A), A)
  const e = eig2(AtA)!
  // eig2 ordena λ1 ≥ λ2; AᵀA es simétrica semidefinida positiva
  const s: [number, number] = [Math.sqrt(Math.max(0, e.values[0])), Math.sqrt(Math.max(0, e.values[1]))]
  const v1 = e.vectors[0]
  const v2: Vec2 = [-v1[1], v1[0]] // ortonormal a v1 (AᵀA es simétrica)
  const col = (v: Vec2, sigma: number, fallback: Vec2): Vec2 => {
    if (sigma < 1e-12) return fallback
    const u = matVec(A, v)
    return [u[0] / sigma, u[1] / sigma]
  }
  const u1 = col(v1, s[0], [1, 0])
  const u2 = col(v2, s[1], [-u1[1], u1[0]])
  return {
    U: [
      [u1[0], u2[0]],
      [u1[1], u2[1]],
    ],
    s,
    Vt: [v1, v2],
  }
}

const EPS = 1e-9

/** Rango de una matriz 2x2 (0, 1 o 2). */
export function rank2(A: Mat): 0 | 1 | 2 {
  if (A.every((r) => r.every((v) => Math.abs(v) < EPS))) return 0
  return Math.abs(det2(A)) < EPS ? 1 : 2
}

const unit = (v: Vec2): Vec2 => {
  const n = Math.hypot(v[0], v[1])
  return [v[0] / n, v[1] / n]
}

/** Dirección (unitaria) del espacio columna de una 2x2 de rango 1; null si el rango no es 1. */
export function columnDirection2(A: Mat): Vec2 | null {
  if (rank2(A) !== 1) return null
  const c1: Vec2 = [A[0][0], A[1][0]]
  const c2: Vec2 = [A[0][1], A[1][1]]
  return unit(Math.hypot(...c1) > EPS ? c1 : c2)
}

/** Dirección (unitaria) del núcleo de una 2x2 de rango 1: perpendicular a las filas no nulas. */
export function nullDirection2(A: Mat): Vec2 | null {
  if (rank2(A) !== 1) return null
  const r = Math.hypot(A[0][0], A[0][1]) > EPS ? A[0] : A[1]
  return unit([-r[1], r[0]])
}

/** Coordenadas c de x en la base {b1, b2}: x = c1·b1 + c2·b2. null si b1 y b2 no forman base. */
export function coordsInBasis2(b1: Vec2, b2: Vec2, x: Vec2): Vec2 | null {
  const Binv = inv2([
    [b1[0], b2[0]],
    [b1[1], b2[1]],
  ])
  return Binv ? (matVec(Binv, x) as Vec2) : null
}

/** Inversa de una matriz cuadrada pequeña por Gauss-Jordan con pivoteo parcial; null si es singular. */
export function invSmall(M: Mat): Mat | null {
  const n = M.length
  const A = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    if (Math.abs(A[p][c]) < EPS) return null
    ;[A[c], A[p]] = [A[p], A[c]]
    const piv = A[c][c]
    A[c] = A[c].map((v) => v / piv)
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = A[r][c]
      A[r] = A[r].map((v, j) => v - f * A[c][j])
    }
  }
  return A.map((r) => r.slice(n))
}

/** Matriz de proyección ortogonal sobre el espacio columna de B: P = B (BᵀB)⁻¹ Bᵀ. */
export function projectionMatrix(B: Mat): Mat | null {
  const Bt = transpose(B)
  const G = invSmall(matMul(Bt, B))
  return G ? matMul(matMul(B, G), Bt) : null
}

// ---------------------------------------------------------------------------
// Convolución (etapa «La convolución como matriz»)
// Convención: filtro k de longitud impar m con centro c = (m − 1)/2 y
//   y_i = Σ_j k_j · x_{i − j + c}
// (igual que np.convolve(x, k, 'same') para filtros de longitud impar).

/** Convolución 1D con bordes de ceros ('same') o circular. */
export function convolve1d(x: number[], k: number[], circular = false): number[] {
  const n = x.length
  const c = (k.length - 1) / 2
  return x.map((_, i) => {
    let s = 0
    for (let j = 0; j < k.length; j++) {
      let idx = i - j + c
      if (circular) idx = ((idx % n) + n) % n
      else if (idx < 0 || idx >= n) continue
      s += k[j] * x[idx]
    }
    return s
  })
}

/** Matriz n×n de la convolución con bordes de ceros: diagonales constantes (Toeplitz). */
export function toeplitzMatrix(k: number[], n: number): Mat {
  const c = (k.length - 1) / 2
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, l) => {
      const j = i - l + c
      return j >= 0 && j < k.length ? k[j] : 0
    }),
  )
}

/** Matriz n×n de la convolución circular: cada fila es la anterior desplazada (circulante). */
export function circulantMatrix(k: number[], n: number): Mat {
  const c = (k.length - 1) / 2
  const M: Mat = Array.from({ length: n }, () => Array(n).fill(0) as number[])
  for (let i = 0; i < n; i++)
    for (let j = 0; j < k.length; j++) {
      const l = (((i - j + c) % n) + n) % n
      M[i][l] += k[j]
    }
  return M
}

/**
 * Convolución 2D «válida» tal como la usan las CNN (correlación cruzada: el núcleo no se voltea),
 * equivalente a scipy.signal.correlate2d(img, K, mode='valid').
 */
export function conv2dValid(img: Mat, K: Mat): Mat {
  const [h, w] = [img.length, img[0].length]
  const [kh, kw] = [K.length, K[0].length]
  return Array.from({ length: h - kh + 1 }, (_, i) =>
    Array.from({ length: w - kw + 1 }, (_, j) => {
      let s = 0
      for (let a = 0; a < kh; a++) for (let b = 0; b < kw; b++) s += K[a][b] * img[i + a][j + b]
      return s
    }),
  )
}

// ---------------------------------------------------------------------------
// Valores y vectores propios de matrices simétricas pequeñas (método de Jacobi)

/** Eigendescomposición de una matriz simétrica: valores en orden creciente y vectores (columnas de Q). */
export function eigSym(S: Mat, maxSweeps = 100): { values: number[]; vectors: Mat } {
  const n = S.length
  const A = S.map((r) => [...r])
  const V: Mat = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2
    if (off < 1e-22) break
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-15) continue
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let k = 0; k < n; k++) {
          const akp = A[k][p]
          const akq = A[k][q]
          A[k][p] = c * akp - s * akq
          A[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k]
          const aqk = A[q][k]
          A[p][k] = c * apk - s * aqk
          A[q][k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p]
          const vkq = V[k][q]
          V[k][p] = c * vkp - s * vkq
          V[k][q] = s * vkp + c * vkq
        }
      }
  }
  const order = A.map((r, i) => [r[i], i] as const).sort((a, b) => a[0] - b[0])
  return {
    values: order.map(([v]) => v),
    vectors: V.map((row) => order.map(([, i]) => row[i])),
  }
}
