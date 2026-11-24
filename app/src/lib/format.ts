/** Formatea bytes con la unidad binaria adecuada. */
export function fmtBytes(b: number): string {
  const u = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  let i = 0
  while (b >= 1024 && i < u.length - 1) {
    b /= 1024
    i++
  }
  return `${b.toFixed(b < 10 ? 2 : 1)} ${u[i]}`
}
