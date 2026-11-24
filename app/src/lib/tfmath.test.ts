import { describe, expect, it } from 'vitest'
import {
  acf,
  attention,
  causalMask,
  chronosTokenize,
  cosineAlphaBar,
  discountedReturns,
  dotv,
  groupAdvantages,
  hzToMel,
  iou,
  kvCacheBytes,
  layerNorm,
  learnBPE,
  linearSchedule,
  loraParams,
  melToHz,
  newtonSchulz,
  numPatches,
  onlineSoftmax,
  quantizeSymmetric,
  rmsNorm,
  ropeRotate,
  sinusoidalPE,
  softmax,
  stft,
  uct,
} from './tfmath'
import { matMul, transpose } from './linalg'

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol)

describe('softmax y atención', () => {
  it('softmax suma 1 y es estable con logits grandes', () => {
    const p = softmax([1000, 1001, 1002])
    close(p.reduce((a, b) => a + b, 0), 1)
    expect(p[2]).toBeGreaterThan(p[1])
  })

  it('la temperatura alta aplana la distribución', () => {
    const cold = softmax([1, 2, 3], 0.5)
    const hot = softmax([1, 2, 3], 5)
    expect(cold[2]).toBeGreaterThan(hot[2])
  })

  it('la máscara causal anula el futuro', () => {
    const X = [[1, 0], [0, 1], [1, 1]]
    const { weights } = attention(X, X, X, causalMask(3))
    expect(weights[0]).toEqual([1, 0, 0])
    close(weights[1][2], 0)
    weights.forEach((r) => close(r.reduce((a, b) => a + b, 0), 1))
  })

  it('el softmax en línea coincide con el softmax normal', () => {
    const x = [0.3, 2.1, -1, 4, 0.5, 3.3, -2]
    const { p } = onlineSoftmax(x, 3)
    softmax(x).forEach((v, i) => close(p[i], v))
  })
})

describe('posiciones', () => {
  it('PE sinusoidal: posición 0 alterna 0 y 1', () => {
    expect(sinusoidalPE(1, 4)[0]).toEqual([0, 1, 0, 1])
  })

  it('RoPE conserva la norma y el producto q·k solo depende de la distancia', () => {
    const q = [0.3, -1, 0.7, 0.2]
    const k = [1, 0.5, -0.4, 0.9]
    close(dotv(ropeRotate(q, 7), ropeRotate(q, 7)), dotv(q, q))
    close(dotv(ropeRotate(q, 3), ropeRotate(k, 5)), dotv(ropeRotate(q, 10), ropeRotate(k, 12)))
  })
})

describe('normalización', () => {
  it('LayerNorm da media 0 y varianza 1', () => {
    const y = layerNorm([1, 2, 3, 4])
    close(y.reduce((a, b) => a + b, 0), 0)
    close(y.reduce((a, b) => a + b * b, 0) / 4, 1, 1e-4)
  })
  it('RMSNorm da media cuadrática 1', () => {
    const y = rmsNorm([3, 4])
    close((y[0] ** 2 + y[1] ** 2) / 2, 1, 1e-5)
  })
})

describe('BPE', () => {
  it('fusiona primero el par más frecuente', () => {
    const steps = learnBPE({ low: 5, lower: 2, newest: 6, widest: 3 }, 3)
    expect(steps[0].pair).toEqual(['e', 's'])
    expect(steps[0].count).toBe(9)
    expect(steps[1].pair).toEqual(['es', 't'])
  })
})

describe('series temporales', () => {
  it('ACF en el retardo 0 vale 1 y detecta la periodicidad', () => {
    const x = Array.from({ length: 120 }, (_, t) => Math.sin((2 * Math.PI * t) / 12))
    const r = acf(x, 12)
    close(r[0], 1)
    expect(r[12]).toBeGreaterThan(0.8)
    expect(r[6]).toBeLessThan(-0.8)
  })
  it('Chronos escala por la media absoluta', () => {
    const { scale, ids } = chronosTokenize([2, -2, 2, -2], 10)
    expect(scale).toBe(2)
    expect(ids).toEqual([6, 4, 6, 4])
  })
  it('número de parches de PatchTST', () => {
    expect(numPatches(512, 16, 8)).toBe(63)
  })
})

describe('difusión', () => {
  it('ᾱ decrece de ~1 a ~0', () => {
    const { alphaBar } = linearSchedule(1000)
    expect(alphaBar[0]).toBeGreaterThan(0.999)
    expect(alphaBar[999]).toBeLessThan(1e-3)
    const c = cosineAlphaBar(1000)
    close(c[0], 1)
    expect(c[1000]).toBeLessThan(1e-6)
  })
})

describe('audio', () => {
  it('mel ↔ Hz son inversas y 1000 Hz ≈ 1000 mel', () => {
    close(melToHz(hzToMel(440)), 440, 1e-6)
    close(hzToMel(1000), 1000, 1)
  })
  it('STFT encuentra la frecuencia de un seno', () => {
    const sr = 64
    const x = Array.from({ length: 256 }, (_, t) => Math.sin((2 * Math.PI * 8 * t) / sr))
    const S = stft(x, 32, 16)
    const frame = S[2]
    expect(frame.indexOf(Math.max(...frame))).toBe(4) // 8 Hz · 32 / 64
  })
})

describe('producción', () => {
  it('KV cache de un modelo tipo Llama 3 8B a 8k tokens ≈ 1 GiB', () => {
    const b = kvCacheBytes({ layers: 32, kvHeads: 8, headDim: 128, tokens: 8192 })
    expect(b / 2 ** 30).toBeCloseTo(1, 5)
  })
  it('cuantización INT8 reconstruye con error menor que la mitad de la escala', () => {
    const x = [0.1, -0.5, 0.33, 0.9, -0.77]
    const { deq, scale } = quantizeSymmetric(x, 8)
    deq.forEach((v, i) => expect(Math.abs(v - x[i])).toBeLessThanOrEqual(scale / 2 + 1e-12))
  })
  it('LoRA', () => expect(loraParams(4096, 4096, 8)).toBe(65536))
  it('Newton–Schulz casi ortogonaliza', () => {
    const X = newtonSchulz([[3, 1], [1, 2], [0, 1]].map((r) => r.slice()).slice(0, 2))
    const XXt = matMul(X, transpose(X))
    XXt.forEach((r, i) => r.forEach((v, j) => expect(Math.abs(v - (i === j ? 1 : 0))).toBeLessThan(0.35)))
  })
  it('UCT explora los nodos no visitados', () => {
    expect(uct(0, 0, 10)).toBe(Infinity)
    expect(uct(5, 10, 100)).toBeGreaterThan(0.5)
  })
  it('ventajas de GRPO tienen media 0', () => {
    const a = groupAdvantages([1, 0, 0, 1])
    close(a.reduce((s, v) => s + v, 0), 0)
    expect(a).toEqual([1, -1, -1, 1])
  })
  it('retornos descontados', () => {
    expect(discountedReturns([1, 1, 1], 0.5)).toEqual([1.75, 1.5, 1])
  })
  it('IoU', () => {
    close(iou([[1, 1, 0]], [[0, 1, 1]]), 1 / 3)
  })
})
