import { describe, expect, it } from 'vitest'
import {
  angle,
  cov,
  det2,
  dot,
  eig2,
  fitLine,
  fmt,
  inv2,
  luSteps,
  matMul,
  matVec,
  normL1,
  normL2,
  normMax,
  project,
  qr2,
  svd2,
  transpose,
} from './linalg'

describe('vectores', () => {
  it('producto punto y normas', () => {
    expect(dot([1, 2, 3], [1, 2, 3])).toBe(14)
    expect(normL1([1, 2, 3])).toBe(6)
    expect(normL2([1, 2, 3])).toBeCloseTo(3.7416573867739413)
    expect(normMax([1, 2, 3])).toBe(3)
  })
  it('ángulo y proyección', () => {
    expect(angle([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2)
    expect(project([2, 3], [1, 0])).toEqual([2, 0])
  })
})

describe('matrices', () => {
  it('producto matricial 3x2 · 2x2', () => {
    const A = [
      [1, 2],
      [3, 4],
      [5, 6],
    ]
    const B = [
      [1, 2],
      [3, 4],
    ]
    expect(matMul(A, B)).toEqual([
      [7, 10],
      [15, 22],
      [23, 34],
    ])
    expect(() => matMul(B, A)).toThrow()
  })
  it('matriz-vector y transpuesta', () => {
    expect(matVec([[1, 2], [3, 4], [5, 6]], [0.5, 0.5])).toEqual([1.5, 3.5, 5.5])
    expect(transpose([[1, 2], [3, 4], [5, 6]])).toEqual([[1, 3, 5], [2, 4, 6]])
  })
  it('determinante e inversa 2x2', () => {
    const A = [
      [1, 2],
      [3, 4],
    ]
    expect(det2(A)).toBe(-2)
    const Ai = inv2(A)!
    expect(Ai[0][0]).toBeCloseTo(-2)
    expect(Ai[1][1]).toBeCloseTo(-0.5)
    expect(inv2([[1, 2], [2, 4]])).toBeNull()
  })
  it('eigen 2x2', () => {
    const e = eig2([[2, 0], [0, 3]])!
    expect(e.values).toEqual([3, 2])
    const s = eig2([[2, 1], [1, 2]])!
    expect(s.values[0]).toBeCloseTo(3)
    expect(s.values[1]).toBeCloseTo(1)
    const [v] = s.vectors
    const Av = matVec([[2, 1], [1, 2]], v)
    expect(Av[0]).toBeCloseTo(3 * v[0])
    expect(Av[1]).toBeCloseTo(3 * v[1])
    expect(eig2([[0, -1], [1, 0]])).toBeNull()
  })
})

describe('estadística', () => {
  it('covarianza muestral', () => {
    const C = cov([
      [1, 2],
      [2, 4],
      [3, 6],
    ])
    expect(C[0][0]).toBeCloseTo(1)
    expect(C[0][1]).toBeCloseTo(2)
    expect(C[1][1]).toBeCloseTo(4)
  })
  it('recta de mínimos cuadrados', () => {
    const f = fitLine([
      [0, 1],
      [1, 3],
      [2, 5],
    ])!
    expect(f.b0).toBeCloseTo(1)
    expect(f.b1).toBeCloseTo(2)
  })
  it('fmt evita -0', () => {
    expect(fmt(-0.0001)).toBe('0')
    expect(fmt(1.236, 2)).toBe('1.24')
  })
})


describe('factorizaciones', () => {
  it('LU paso a paso reconstruye A', () => {
    const A = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]]
    const steps = luSteps(A)
    const { L, U } = steps[steps.length - 1]
    expect(steps.length).toBe(4) // inicial + 3 eliminaciones
    expect(U[1][0]).toBe(0)
    expect(U[2][1]).toBe(0)
    const LU = matMul(L, U)
    LU.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(A[i][j])))
  })
  it('LU detecta pivote nulo', () => {
    const steps = luSteps([[0, 1], [1, 1]])
    expect(steps[steps.length - 1].error).toMatch(/pivoteo/)
  })
  it('QR 2D: Q ortonormal y A = QR', () => {
    const r = qr2([3, 4], [1, 2])!
    expect(dot(r.q1, r.q2)).toBeCloseTo(0)
    expect(normL2(r.q2)).toBeCloseTo(1)
    expect(r.R[0][0]).toBeCloseTo(5)
    expect(r.R[0][1] * r.q1[0] + r.R[1][1] * r.q2[0]).toBeCloseTo(1)
  })
  it('SVD 2x2 reconstruye A', () => {
    for (const A of [[[3, 0], [4, 5]], [[1, 2], [3, 4]], [[2, 0], [0, -1]], [[1, 2], [2, 4]]]) {
      const { U, s, Vt } = svd2(A)
      const R = matMul(matMul(U, [[s[0], 0], [0, s[1]]]), Vt)
      R.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(A[i][j])))
      expect(s[0]).toBeGreaterThanOrEqual(s[1])
    }
  })
})
