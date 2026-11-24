/** Generador pseudoaleatorio con semilla (mulberry32): los datos de ejemplo son siempre los mismos. */
export function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  /** Normal estándar (Box-Muller). */
  const normal = () => {
    const u = Math.max(next(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next())
  }
  return { next, normal }
}

/** n puntos 2D con medias, desviaciones y correlación dadas, redondeados a 1 decimal. */
export function correlatedCloud(
  n: number,
  { mx = 0, my = 0, sx = 1, sy = 1, rho = 0, seed = 1 }: { mx?: number; my?: number; sx?: number; sy?: number; rho?: number; seed?: number },
): [number, number][] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const z1 = r.normal()
    const z2 = r.normal()
    const x = mx + sx * z1
    const y = my + sy * (rho * z1 + Math.sqrt(1 - rho * rho) * z2)
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
  })
}
