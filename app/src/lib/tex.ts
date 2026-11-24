/** Formatea un vector o matriz como LaTeX bmatrix. */
export function texMat(M: number[][] | number[], digits = 2): string {
  const f = (x: number) => {
    const r = Number(x.toFixed(digits))
    return String(Object.is(r, -0) ? 0 : r)
  }
  const rows = Array.isArray(M[0]) ? (M as number[][]) : (M as number[]).map((v) => [v])
  return `\\begin{bmatrix}${rows.map((r) => r.map(f).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`
}
