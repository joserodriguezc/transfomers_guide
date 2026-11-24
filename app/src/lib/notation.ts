/**
 * Glosario de notación matemática. `detectNotation(tex)` encuentra los símbolos presentes en una
 * fórmula LaTeX y devuelve su explicación, para que cada fórmula aclare qué significa, por ejemplo,
 * ℝⁿ ("vectores de n números reales") sin depender de que el autor lo recuerde.
 */

export interface NotationItem {
  /** Símbolo en LaTeX, tal como aparece en la fórmula. */
  tex: string
  meaning: string
  /** Índice de la regla que lo generó (para el glosario: una entrada por regla). */
  rule?: number
}

interface Rule {
  re: RegExp
  /** Devuelve null para descartar esta coincidencia y probar la siguiente. */
  explain: (m: RegExpExecArray) => NotationItem | null
}

const GREEK: Record<string, string> = {
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\mu': 'μ',
  '\\ell': 'ℓ',
  '\\alpha': 'α',
  '\\theta': 'θ',
}

/** Nombre legible de una base LaTeX: `\sigma` → σ, `X_c` → Xc, `x` → x. */
const sym = (base: string) => GREEK[base] ?? base.replace(/^\\/, '').replace(/[_{}]/g, '')

/** ¿Empieza por mayúscula? (sirve para letras latinas y griegas: Σ sí, μ no) */
const isUpper = (s: string) => s.charAt(0) !== s.charAt(0).toLowerCase()

/** Bases con subíndice que no son "elementos" (límites de operadores o símbolos con su propia regla). */
const NOT_ELEMENT = new Set(['\\sum', '\\prod', '\\max', '\\min', '\\arg', '\\ell', '\\mathbb', '\\operatorname'])

/** Base de un exponente: una letra o comando, con su subíndice opcional (X_c, v_i, \Sigma), o un paréntesis. */
const BASE = String.raw`((?:\\[a-zA-Z]+|[A-Za-z])(?:_\{[^}]*\}|_\w)?|\))`

/** Convierte un exponente LaTeX como `m\times n` en texto legible ("m × n"). */
const plainDims = (s: string) =>
  s
    .replace(/\\times/g, '×')
    .replace(/_\{?(\w)\}?/g, '$1')
    .replace(/[{}\s]/g, '')
    .replace(/×/g, ' × ')

const RULES: Rule[] = [
  {
    // ℝ^{m×n}, ℝ^{n_1×n_2×n_3}
    re: /\\mathbb\{R\}\^\{([^}]*\\times[^}]*(?:\}[^}]*)*?)\}(?=[^}]|$)/,
    explain: (m) => {
      const dims = plainDims(m[1])
      const k = dims.split('×').length
      return {
        tex: m[0],
        meaning: `el conjunto de ${k === 2 ? 'todas las matrices' : 'todos los tensores'} de tamaño ${dims} cuyos elementos son números reales (ℝ = los números reales)`,
      }
    },
  },
  {
    // ℝⁿ, ℝ^{n}
    re: /\\mathbb\{R\}\^\{?(\w)\}?/,
    explain: (m) => ({
      tex: m[0],
      meaning: `el conjunto de todos los vectores con ${m[1]} componentes, cada una un número real (ℝ = los números reales)`,
    }),
  },
  {
    re: /\\mathbb\{R\}(?!\^)/,
    explain: (m) => ({ tex: m[0], meaning: 'el conjunto de los números reales (enteros, decimales, negativos, √2, π…)' }),
  },
  { re: /\\in(?![a-z])/, explain: () => ({ tex: '\\in', meaning: '«pertenece a»: el objeto de la izquierda es un elemento del conjunto de la derecha' }) },
  { re: /\\\{/, explain: () => ({ tex: '\\{\\ \\}', meaning: 'llaves: definen un conjunto enumerando sus elementos' }) },
  { re: /\\cap/, explain: () => ({ tex: '\\cap', meaning: 'intersección: los elementos que están en ambos conjuntos' }) },
  {
    re: /\[\s*\w+\s*,\s*\w+\s*\)/,
    explain: (m) => ({ tex: m[0], meaning: 'intervalo semiabierto: incluye el extremo izquierdo y excluye el derecho' }),
  },
  { re: /\\sum/, explain: () => ({ tex: '\\sum', meaning: 'sumatoria: sumar los términos para cada valor del índice, desde el valor inferior hasta el superior' }) },
  { re: /\\prod/, explain: () => ({ tex: '\\prod', meaning: 'productorio: multiplicar los términos para cada valor del índice' }) },
  {
    // Subíndices de elementos: x_1, v_i, a_{ij}, t_{ijk}… (se muestra el que aparece en la fórmula)
    re: /(\\[a-zA-Z]+|[A-Za-z])_(?:\{([ijkdp\d]{1,3})\}|([ijkdp\d]))/g,
    explain: (m) => {
      const base = m[1]
      if (NOT_ELEMENT.has(base)) return null
      const sub = m[2] ?? m[3]
      const name = sym(base)
      const tex = `${base}_{${sub}}`
      if (base === 'I' && /^\d+$/.test(sub)) {
        return { tex, meaning: `subíndice de tamaño: la matriz identidad de ${sub} × ${sub}` }
      }
      if (sub.length === 2) {
        // a_{11}, c_{ij}: dos índices = fila y columna (también con dígitos)
        const [a, b] = sub
        const matrix = /^[a-z]$/.test(base) ? ` ${base.toUpperCase()}` : isUpper(name) ? ` ${name}` : ''
        return { tex, meaning: `subíndices: el elemento de la fila ${a} y la columna ${b} de la matriz${matrix}` }
      }
      if (/^\d+$/.test(sub)) {
        return { tex, meaning: `subíndice numérico: distingue valores numerados; ${name}${sub} es el número ${sub} de la lista (${name}₁ el primero, ${name}₂ el segundo…)` }
      }
      if (sub.length === 3) {
        const [a, b, c] = sub
        return { tex, meaning: `subíndices: el elemento en la posición (${a}, ${b}, ${c}) del tensor; ${a} indica la capa, ${b} la fila y ${c} la columna` }
      }
      if (/^[A-Z]$/.test(base)) {
        return { tex, meaning: `subíndice: indica a qué ${name} concreto se refiere la fórmula: el número ${sub} o el asociado a ${sub}` }
      }
      return {
        tex,
        meaning: `subíndice: el elemento ${sub} de ${name}; si ${sub} es el índice de una sumatoria, toma cada valor del rango indicado`,
      }
    },
  },
  { re: /\\(?:c|v|d|l)?dots/, explain: () => ({ tex: '\\dots', meaning: 'puntos suspensivos: los términos continúan siguiendo el mismo patrón' }) },
  {
    re: /\\\|(.+?)\\\|(?:_(\{[^}]*\}|\\[a-zA-Z]+|\*|\w))?/,
    explain: (m) => {
      const sub = m[2]?.replace(/[{}]/g, '')
      // Norma de matriz: contenido que empieza por mayúscula (A, A − A_k, AB) o subíndice F / *
      const isMatrix = sub === 'F' || sub === '*' || /^\s*[A-Z]/.test(m[1])
      if (isMatrix) {
        const kind =
          sub === 'F'
            ? ' (F = Frobenius: raíz de la suma de los cuadrados de todos los elementos)'
            : sub === '*'
              ? ' (* = nuclear: suma de los valores singulares)'
              : sub === '2'
                ? ' (2 = espectral: cuánto puede estirar la matriz un vector, σ₁)'
                : ''
        return { tex: m[0], meaning: `norma matricial: el «tamaño» de la matriz${kind}` }
      }
      return {
        tex: m[0],
        meaning: `norma: la longitud o magnitud del vector${sub ? ` (el subíndice ${sub.replace('\\infty', '∞')} indica qué norma)` : ''}`,
      }
    },
  },
  {
    re: /(?<![\\|])\|([^|]+?)(?<!\\)\|/,
    explain: (m) =>
      // \left| … \right| (o un \right| suelto) no se pueden mostrar recortados: KaTeX daría error
      m.input.slice(0, m.index).endsWith('\\left') || m[0].endsWith('\\right|') || m[0].includes('\\left')
        ? null
        : { tex: m[0], meaning: 'valor absoluto: el número sin signo (|−3| = 3)' },
  },
  { re: /\\infty/, explain: () => ({ tex: '\\infty', meaning: 'infinito' }) },
  { re: /\\max/, explain: () => ({ tex: '\\max', meaning: 'máximo: el mayor de los valores indicados' }) },
  { re: /\\le(?![a-z])/, explain: () => ({ tex: '\\le', meaning: 'menor o igual que' }) },
  { re: /\\lor/, explain: () => ({ tex: '\\lor', meaning: '«o» lógico: basta con que se cumpla una de las condiciones' }) },
  { re: /\\(?:Long)?[Rr]ightarrow/, explain: () => ({ tex: '\\Rightarrow', meaning: '«implica»: si se cumple lo de la izquierda, se cumple lo de la derecha' }) },
  { re: /\\to(?![a-z])/, explain: () => ({ tex: '\\to', meaning: '«se convierte en» (o «tiende a», cuando se habla de un límite)' }) },
  { re: /\\times/, explain: () => ({ tex: '\\times', meaning: '«por»: multiplicación; en un tamaño se lee filas × columnas' }) },
  { re: /\\pm/, explain: () => ({ tex: '\\pm', meaning: '«más o menos»: la fórmula vale tanto con + como con −' }) },
  { re: /(?<!\^)\\circ(?![a-z])/, explain: () => ({ tex: '\\circ', meaning: 'producto de Hadamard: multiplicación elemento a elemento' }) },
  { re: /\\oslash/, explain: () => ({ tex: '\\oslash', meaning: 'división elemento a elemento' }) },
  { re: /\\otimes/, explain: () => ({ tex: '\\otimes', meaning: 'producto tensorial (exterior): cada elemento del primero multiplica a todo el segundo' }) },
  { re: /\\cdot(?!s)/, explain: () => ({ tex: '\\cdot', meaning: 'punto: producto escalar entre vectores, o simple multiplicación entre números' }) },
  {
    re: new RegExp(`${BASE}\\^(?:T|\\{T\\})`),
    explain: (m) => {
      if (m[1] === ')') return { tex: '(\\ldots)^T', meaning: 'transpuesta de todo el paréntesis: las filas pasan a ser columnas' }
      const n = sym(m[1])
      // Minúscula (latina o griega: v, μ) = vector; mayúscula = matriz
      const isVector = !isUpper(n)
      return {
        tex: `${m[1]}^T`,
        meaning: isVector ? `transpuesta de ${n}: convierte el vector columna en un vector fila` : `transpuesta de ${n}: sus filas pasan a ser columnas`,
      }
    },
  },
  {
    re: new RegExp(`${BASE}\\^\\{-1\\}`),
    explain: (m) =>
      m[1] === ')'
        ? { tex: '(\\ldots)^{-1}', meaning: 'inversa de todo el paréntesis: la matriz que deshace esa operación' }
        : { tex: `${m[1]}^{-1}`, meaning: `inversa de ${sym(m[1])}: la matriz que deshace ${sym(m[1])} (${sym(m[1])}·${sym(m[1])}⁻¹ = I)` },
  },
  { re: /(?<![a-zA-Z\\])I(?:_\w)?(?![a-zA-Z])/, explain: () => ({ tex: 'I', meaning: 'matriz identidad: unos en la diagonal y ceros fuera' }) },
  { re: /\\det/, explain: () => ({ tex: '\\det', meaning: 'determinante de la matriz' }) },
  { re: /\\operatorname\{tr\}/, explain: () => ({ tex: '\\operatorname{tr}', meaning: 'traza: suma de los elementos de la diagonal' }) },
  { re: /\\operatorname\{rank\}/, explain: () => ({ tex: '\\operatorname{rank}', meaning: 'rango: número de filas o columnas linealmente independientes' }) },
  { re: /\\operatorname\{nnz\}/, explain: () => ({ tex: '\\operatorname{nnz}', meaning: 'number of non-zeros: cantidad de elementos distintos de cero' }) },
  { re: /\\mathbb\{E\}/, explain: () => ({ tex: '\\mathbb{E}', meaning: 'esperanza o valor esperado: el promedio teórico (en una muestra, la media)' }) },
  { re: /\\operatorname\{Var\}/, explain: () => ({ tex: '\\operatorname{Var}', meaning: 'varianza: el promedio de las desviaciones al cuadrado respecto a la media' }) },
  {
    re: /\\operatorname\{[Cc]ov\}/,
    explain: () => ({ tex: '\\operatorname{cov}', meaning: 'covarianza: cuánto varían juntas dos variables (positiva si suben juntas, negativa si una sube cuando la otra baja)' }),
  },
  { re: /\\bar\{?(\w)\}?/, explain: (m) => ({ tex: `\\bar{${m[1]}}`, meaning: `«${m[1]} barra»: una media o un valor acumulado de ${m[1]} (la explicación de la fórmula dice cuál)` }) },
  { re: /\\mu/, explain: () => ({ tex: '\\mu', meaning: 'mu: la media (de una población o de cada columna de los datos)' }) },
  { re: /\\rho/, explain: () => ({ tex: '\\rho', meaning: 'rho: el coeficiente de correlación de Pearson, entre −1 y 1' }) },
  { re: /\\hat\{?(\w)\}?/, explain: (m) => ({ tex: `\\hat{${m[1]}}`, meaning: `«${m[1]} sombrero»: el valor de ${m[1]} estimado o predicho por el modelo` }) },
  { re: /\\operatorname\{arg\\?\s*min\}|\\arg\\?min|\\operatorname\*?\{argmin\}/, explain: () => ({ tex: '\\arg\\min', meaning: 'argumento mínimo: el valor de la variable que hace mínima la expresión' }) },
  { re: /\\arg\\?\s*max|\\operatorname\*?\{argmax\}/, explain: () => ({ tex: '\\arg\\max', meaning: 'argumento máximo: el valor de la variable que hace máxima la expresión' }) },
  { re: /\\min(?![a-z])/, explain: () => ({ tex: '\\min', meaning: 'mínimo: el menor de los valores indicados' }) },
  {
    re: /\\kappa/,
    explain: () => ({ tex: '\\kappa', meaning: 'kappa: el número de condición, cuánto puede amplificar la matriz los errores relativos (σ_max / σ_min)' }),
  },
  { re: /\\ast(?![a-z])/, explain: () => ({ tex: '\\ast', meaning: 'convolución: deslizar el filtro sobre la señal y sumar productos en cada posición' }) },
  { re: /\\operatorname\{span\}/, explain: () => ({ tex: '\\operatorname{span}', meaning: 'span (espacio generado): el conjunto de todas las combinaciones lineales de esos vectores' }) },
  { re: /\\dim(?![a-z])/, explain: () => ({ tex: '\\dim', meaning: 'dimensión: el número de vectores de cualquier base del espacio' }) },
  { re: /\\ker(?![a-z])/, explain: () => ({ tex: '\\ker', meaning: 'núcleo (kernel): todos los vectores x que la matriz envía al vector cero, Ax = 0' }) },
  {
    re: /\\operatorname\{Im\}/,
    explain: () => ({ tex: '\\operatorname{Im}', meaning: 'imagen o espacio columna: todos los vectores Ax posibles; lo generan las columnas de A' }),
  },
  {
    re: /\^\{?\\perp\}?|\\perp(?![a-z])/,
    explain: (m) =>
      m[0].startsWith('^')
        ? { tex: 'U^\\perp', meaning: 'complemento ortogonal: todos los vectores perpendiculares a cada vector del subespacio' }
        : { tex: '\\perp', meaning: '«es perpendicular (ortogonal) a»: su producto punto es 0' },
  },
  { re: /\\subseteq/, explain: () => ({ tex: '\\subseteq', meaning: '«está contenido en»: es un subconjunto (aquí, un subespacio) del de la derecha' }) },
  { re: /\\mathbf\{0\}/, explain: () => ({ tex: '\\mathbf{0}', meaning: 'el vector cero: todas sus componentes valen 0' }) },
  {
    re: /\\tilde\{?(\w)\}?/,
    explain: (m) => ({
      tex: `\\tilde{${m[1]}}`,
      meaning: `«${m[1]} tilde»: una versión transformada de ${m[1]} (centrada, aproximada o proyectada; la explicación de la fórmula dice cuál)`,
    }),
  },
  { re: /\\mid/, explain: () => ({ tex: '[A \\mid I]', meaning: 'barra vertical: separa las dos partes de una matriz aumentada, que se operan juntas fila a fila' }) },
  {
    re: /\\xrightarrow/,
    explain: () => ({ tex: '\\xrightarrow{\\text{paso}}', meaning: 'flecha con texto: se pasa de lo de la izquierda a lo de la derecha aplicando lo que indica la flecha' }),
  },
  { re: /\\mathbf\{1\}/, explain: () => ({ tex: '\\mathbf{1}', meaning: 'vector de unos: (1, 1, …, 1)' }) },
  { re: /\\alpha/, explain: () => ({ tex: '\\alpha', meaning: 'alfa: un coeficiente que define la propia fórmula (en difusión, 1 − β; en LoRA, el factor de escala)' }) },
  { re: /\\leftarrow/, explain: () => ({ tex: '\\leftarrow', meaning: '«se reemplaza por»: lo de la izquierda pasa a valer lo de la derecha' }) },
  { re: /\\iff/, explain: () => ({ tex: '\\iff', meaning: '«si y solo si»: ambas afirmaciones son equivalentes' }) },
  {
    re: /\\nabla/,
    explain: () => ({ tex: '\\nabla', meaning: 'nabla: el gradiente, el vector de derivadas parciales; apunta hacia donde la función crece más rápido' }),
  },
  {
    re: /\\partial/,
    explain: () => ({ tex: '\\partial', meaning: 'derivada parcial: cuánto cambia la función al mover solo esa variable (∂L/∂W es una matriz de la forma de W)' }),
  },
  { re: /\\gamma/, explain: () => ({ tex: '\\gamma', meaning: 'gamma: en aprendizaje por refuerzo, el factor de descuento (entre 0 y 1); en una normalización, la ganancia aprendida' }) },
  {
    re: /\\pi(?![a-z])/,
    explain: () => ({ tex: '\\pi', meaning: 'pi: en aprendizaje por refuerzo, la política (cómo elige el agente cada acción); π_θ es el propio modelo. Junto a números (2π) es 3.14…' }),
  },
  { re: /\\eta(?![a-z])/, explain: () => ({ tex: '\\eta', meaning: 'eta: la tasa de aprendizaje, el tamaño de cada paso del descenso de gradiente' }) },
  { re: /\^\{?\*\}?/, explain: () => ({ tex: 'b^*', meaning: '«b estrella»: el valor óptimo, el que hace mínima la función' }) },
  {
    re: /\\ell(?:_(?:\{(\w+)\}|(\w)))?/,
    explain: (m) => ({ tex: m[0], meaning: 'ele cursiva: una suma acumulada o una longitud que define la propia fórmula' }),
  },
  { re: /\\lambda/, explain: () => ({ tex: '\\lambda', meaning: 'lambda: un peso que equilibra dos términos (por ejemplo, de una pérdida); con matrices, un valor propio' }) },
  { re: /\\Lambda/, explain: () => ({ tex: '\\Lambda', meaning: 'lambda mayúscula: matriz diagonal con los valores propios en la diagonal' }) },
  {
    re: /\\Sigma/,
    explain: () => ({ tex: '\\Sigma', meaning: 'sigma mayúscula: una matriz de covarianza (o de valores singulares)' }),
  },
  {
    re: /\\sigma/,
    explain: () => ({ tex: '\\sigma', meaning: 'sigma minúscula: la desviación estándar; aplicada a algo, σ(x), la función sigmoide 1/(1 + e^(−x))' }),
  },
  { re: /\\operatorname\{softmax\}/, explain: () => ({ tex: '\\operatorname{softmax}', meaning: 'softmax: convierte un vector de puntuaciones en probabilidades positivas que suman 1 (exponencial y normalización)' }) },
  {
    re: /\\operatorname\{(LayerNorm|RMSNorm)\}/,
    explain: (m) => ({
      tex: `\\operatorname{${m[1]}}`,
      meaning: m[1] === 'LayerNorm' ? 'LayerNorm: resta la media y divide por la desviación típica de las componentes de cada vector' : 'RMSNorm: divide cada vector por la raíz de la media de sus cuadrados',
    }),
  },
  { re: /\\operatorname\{[Cc]oncat\}/, explain: () => ({ tex: '\\operatorname{Concat}', meaning: 'concatenar: poner los vectores o matrices uno a continuación del otro' }) },
  { re: /\\mathcal\{N\}/, explain: () => ({ tex: '\\mathcal{N}', meaning: 'distribución normal (gaussiana) con la media y la covarianza indicadas' }) },
  { re: /\\mathcal\{L\}/, explain: () => ({ tex: '\\mathcal{L}', meaning: 'la función de pérdida que se minimiza al entrenar' }) },
  { re: /\\odot/, explain: () => ({ tex: '\\odot', meaning: 'producto elemento a elemento (de Hadamard)' }) },
  { re: /\\sim(?![a-z])/, explain: () => ({ tex: '\\sim', meaning: '«se distribuye como» o «se muestrea de»' }) },
  { re: /\\log(?![a-z])/, explain: () => ({ tex: '\\log', meaning: 'logaritmo natural (salvo que se indique otra base)' }) },
  { re: /\\exp(?![a-z])/, explain: () => ({ tex: '\\exp', meaning: 'función exponencial: exp(x) = eˣ' }) },
  { re: /\\tau(?![a-z])/, explain: () => ({ tex: '\\tau', meaning: 'tau: una temperatura (divide las puntuaciones antes de la softmax: mayor τ, distribución más plana)' }) },
  { re: /\\varepsilon|\\epsilon/, explain: () => ({ tex: '\\varepsilon', meaning: 'épsilon: ruido gaussiano (en difusión) o una constante muy pequeña que evita dividir por cero' }) },
  { re: /\\theta(?![a-z])/, explain: () => ({ tex: '\\theta', meaning: 'theta: los parámetros (pesos) de un modelo; en RoPE, las frecuencias de giro θᵢ' }) },
  {
    re: new RegExp(`${BASE}\\^(?:\\+|\\{\\+\\})`),
    explain: (m) => ({
      tex: `${m[1]}^+`,
      meaning: `pseudoinversa de ${sym(m[1])}: generaliza la inversa a matrices no cuadradas o singulares`,
    }),
  },
  { re: /\\approx/, explain: () => ({ tex: '\\approx', meaning: 'aproximadamente igual a' }) },
  { re: /\\neq?(?![a-z])/, explain: () => ({ tex: '\\neq', meaning: 'distinto de' }) },
  { re: /\\operatorname\{diag\}/, explain: () => ({ tex: '\\operatorname{diag}', meaning: 'matriz diagonal con esos valores en la diagonal' }) },
  { re: /\\sqrt/, explain: () => ({ tex: '\\sqrt{\\ }', meaning: 'raíz cuadrada' }) },
  {
    re: /(?<![a-zA-Z\\])O\([^)]*\)/,
    explain: (m) => ({ tex: m[0], meaning: 'notación O grande: cómo crece el número de operaciones con el tamaño del problema' }),
  },
]

/** Devuelve las explicaciones de los símbolos presentes en `tex`, en orden de aparición y sin repetir. */
export function detectNotation(tex: string): NotationItem[] {
  const found: { pos: number; item: NotationItem }[] = []
  const seen = new Set<string>()
  let realHandled = false
  for (const [index, rule] of RULES.entries()) {
    // Se prueba cada coincidencia hasta que la regla acepte una (explain puede descartarla con null)
    const re = new RegExp(rule.re.source, rule.re.flags.includes('g') ? rule.re.flags : rule.re.flags + 'g')
    let m: RegExpExecArray | null
    let item: NotationItem | null = null
    while ((m = re.exec(tex)) && !(item = rule.explain(m))) {
      if (m[0] === '') re.lastIndex++
    }
    if (!m || !item) continue
    item = { ...item, rule: index }
    // Si ya se explicó ℝⁿ o ℝ^{m×n}, no repetir "ℝ" a secas
    const isReal = item.tex.includes('\\mathbb{R}')
    if (isReal && realHandled) continue
    if (seen.has(item.tex)) continue
    if (isReal) realHandled = true
    seen.add(item.tex)
    found.push({ pos: m.index, item })
  }
  // Si aparece arg max / arg min, no explicar además max / min por separado
  const has = (t: string) => found.some((f) => f.item.tex === t)
  const redundant = new Set<string>([...(has('\\arg\\max') ? ['\\max'] : []), ...(has('\\arg\\min') ? ['\\min'] : [])])
  return found
    .filter((f) => !redundant.has(f.item.tex))
    .sort((a, b) => a.pos - b.pos)
    .map((f) => f.item)
}

/** Número de reglas del glosario (para comprobar que la página de referencia las cubre todas). */
export const NOTATION_RULE_COUNT = RULES.length

/** Fórmulas de muestra que, juntas, activan todas las reglas: alimentan el glosario de la página de referencia. */
const SAMPLES = [
  's \\in \\mathbb{R}',
  'v \\in \\mathbb{R}^n',
  'A \\in \\mathbb{R}^{m\\times n}',
  '\\{a, b\\} \\cap [a, b)',
  '\\sum_{i=1}^{n} a_{ij}',
  '\\prod_k n_k',
  'a_1, \\dots, a_n',
  '\\|v\\|_2 \\le |x|',
  '\\infty',
  '\\max_i x_i',
  '\\min(m, n)',
  'p \\lor q \\Rightarrow r',
  '(m, n) \\to (n, m)',
  'm \\times n',
  'a \\pm b',
  'a \\circ b,\\ a \\oslash b,\\ a \\otimes b,\\ a \\cdot b',
  'A^T,\\ A^{-1},\\ I',
  '\\det A,\\ \\operatorname{tr}(A),\\ \\operatorname{rank}(A),\\ \\operatorname{nnz}(A)',
  'O(n)',
  '\\mathbb{E}[X],\\ \\operatorname{Var}(x),\\ \\operatorname{cov}(x, y),\\ \\bar{x},\\ \\mu,\\ \\rho,\\ \\hat{y}',
  '\\arg\\max_q f',
  '\\arg\\min_b f',
  '\\mathbf{1},\\ \\alpha',
  'F_i \\leftarrow F_i - \\ell_{ik} F_k \\iff x',
  'Av = \\lambda v,\\ \\Lambda,\\ \\Sigma,\\ \\sigma_1,\\ A^+',
  'a \\approx b,\\ a \\neq b,\\ \\operatorname{diag}(d),\\ \\sqrt{x}',
  '\\operatorname{span}(v),\\ \\dim V,\\ \\ker(A),\\ \\operatorname{Im}(A),\\ U \\subseteq V,\\ \\mathbf{0},\\ \\tilde{x}',
  'U^\\perp',
  '\\operatorname{softmax}(x),\\ \\operatorname{LayerNorm}(x),\\ \\operatorname{Concat}(a, b),\\ \\mathcal{N}(0, I),\\ \\mathcal{L},\\ a \\odot b,\\ x \\sim p,\\ \\log p,\\ \\exp(x),\\ \\tau,\\ \\varepsilon,\\ \\theta',
  '\\kappa(A) = \\sigma_1 / \\sigma_n,\\ y = k \\ast x',
  'u \\perp v',
  '[A \\mid I] \\xrightarrow{\\text{filas}} [I \\mid A^{-1}]',
  'b_{k+1} = b_k - \\eta\\,\\nabla_b L,\\ \\frac{\\partial L}{\\partial W},\\ b^*,\\ P\\pi = \\pi,\\ \\gamma = p/n',
]

/** Glosario completo y sin duplicados, en orden alfabético por significado. */
export function glossary(): NotationItem[] {
  // Una entrada por regla (la primera muestra que la activa), aunque el símbolo concreto varíe
  const map = new Map<number, NotationItem>()
  for (const s of SAMPLES) for (const item of detectNotation(s)) if (!map.has(item.rule!)) map.set(item.rule!, item)
  return [...map.values()].sort((a, b) => a.meaning.localeCompare(b.meaning, 'es'))
}
