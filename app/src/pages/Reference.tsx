import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tex } from '../components/lesson/Tex'
import { stageBySlug } from '../course/curriculum'
import { glossary } from '../lib/notation'

/** Letras griegas frecuentes en el curso y su uso habitual. */
const GREEK: [string, string, string][] = [
  ['\\alpha,\\ \\bar\\alpha_t', 'alfa', 'en difusión, 1 − β_t y su producto acumulado (cuánta señal queda en el paso t)'],
  ['\\beta_t', 'beta', 'varianza del ruido añadido en el paso t de difusión; coeficiente KL en RLHF/GRPO'],
  ['\\gamma', 'gamma', 'factor de descuento en aprendizaje por refuerzo; ganancia de LayerNorm/RMSNorm'],
  ['\\varepsilon', 'épsilon', 'ruido gaussiano (difusión); constante pequeña de las normalizaciones; recorte de PPO'],
  ['\\eta', 'eta', 'tasa de aprendizaje'],
  ['\\theta', 'theta', 'parámetros de un modelo; frecuencias de RoPE (θ_i)'],
  ['\\pi_\\theta', 'pi', 'política: el propio modelo de lenguaje visto como agente que elige tokens'],
  ['\\mu,\\ \\sigma', 'mu, sigma', 'media y desviación típica; σ también es la función sigmoide'],
  ['\\tau', 'tau', 'temperatura de la softmax o de la pérdida contrastiva'],
  ['\\lambda', 'lambda', 'peso de un término de regularización o de una pérdida auxiliar'],
  ['\\phi,\\ \\psi', 'phi, psi', 'parámetros de un segundo modelo (encoder, crítico, modelo del mundo)'],
  ['\\omega', 'omega', 'frecuencia angular (audio, codificación posicional)'],
]

/** Hoja de referencia: NumPy para transformers, agrupada por tema. */
const CHEATSHEET: { title: string; stage: string[]; rows: [string, string][] }[] = [
  {
    title: 'Tokens y embeddings',
    stage: ['tokenizacion', 'embeddings-posicion'],
    rows: [
      ['E[ids]', 'búsqueda de embeddings (equivale a one_hot @ E)'],
      ['x @ y / (norm(x) * norm(y))', 'similitud coseno'],
      ['sin(pos / 10000 ** (2 * i / d))', 'codificación posicional sinusoidal'],
    ],
  },
  {
    title: 'Atención',
    stage: ['atencion', 'multi-cabeza', 'encoder-decoder'],
    rows: [
      ['e = exp(S - S.max(-1, keepdims=True)); e / e.sum(-1, keepdims=True)', 'softmax estable por filas'],
      ['softmax(Q @ K.T / sqrt(d_k)) @ V', 'atención por producto escalado'],
      ['X.reshape(n, h, d_k).transpose(1, 0, 2)', 'separar las cabezas'],
      ['triu(full((n, n), -inf), k=1)', 'máscara causal aditiva'],
      ["einsum('hqd,hkd->hqk', Q, K)", 'puntuaciones de todas las cabezas a la vez'],
    ],
  },
  {
    title: 'Bloque y contexto',
    stage: ['bloque-transformer', 'contexto-largo', 'variantes-atencion'],
    rows: [
      ['(x - x.mean(-1, keepdims=True)) / x.std(-1, keepdims=True)', 'LayerNorm (sin γ, β)'],
      ['x / sqrt((x ** 2).mean(-1, keepdims=True) + eps)', 'RMSNorm'],
      ['x + attn(norm(x)); x + ffn(norm(x))', 'bloque pre-norm'],
      ['exp(mean(nll))', 'perplejidad'],
      ['2 * L * n_kv * d_head * T * bytes', 'memoria de la KV cache'],
    ],
  },
  {
    title: 'Señales',
    stage: ['series-temporales', 'audio-senales'],
    rows: [
      ['diff(x), x[s:] - x[:-s]', 'diferencia y diferencia estacional'],
      ['correlate(x - m, x - m, "full")', 'autocorrelación (normaliza por la de retardo 0)'],
      ['abs(rfft(x * hanning(n)))', 'espectro de magnitud de una trama'],
      ['2595 * log10(1 + f / 700)', 'hercios a mels'],
    ],
  },
  {
    title: 'Generación',
    stage: ['difusion', 'dit-video'],
    rows: [
      ['cumprod(1 - beta)', 'ᾱ_t a partir del programa de ruido'],
      ['sqrt(ab) * x0 + sqrt(1 - ab) * eps', 'muestrear x_t directamente'],
      ['eps_u + w * (eps_c - eps_u)', 'classifier-free guidance'],
      ['(1 + scale) * norm(x) + shift', 'modulación adaLN'],
    ],
  },
  {
    title: 'RL, razonamiento y producción',
    stage: ['rl-decision-transformer', 'razonamiento', 'despliegue'],
    rows: [
      ['G[t] = r[t] + gamma * G[t + 1]', 'retorno descontado (recorrido hacia atrás)'],
      ['(r - r.mean()) / r.std()', 'ventajas relativas al grupo (GRPO)'],
      ['Q / N + c * sqrt(log(N_p) / N)', 'puntuación UCT de MCTS'],
      ['round(w / s).clip(-qmax - 1, qmax)', 'cuantización simétrica con escala s'],
      ['W + (alpha / r) * B @ A', 'pesos efectivos con LoRA'],
    ],
  },
]

export function Reference() {
  const [q, setQ] = useState('')
  const all = useMemo(() => glossary(), [])
  const norm = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const items = q ? all.filter((g) => norm(g.meaning + ' ' + g.tex).includes(norm(q))) : all

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Notación y referencia</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
        Material de consulta rápida: el significado de cada símbolo, las letras griegas habituales en el curso y las operaciones de NumPy que implementan cada pieza del transformer.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Símbolos matemáticos</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Los mismos significados que aparecen bajo cada fórmula del curso, en el bloque «Notación».
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar (p. ej. softmax, norma, reales…)"
          aria-label="Buscar en el glosario"
          className="mb-4 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {items.map((g) => (
            <div key={g.tex} className="flex items-baseline gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
              <dt className="w-20 shrink-0 text-center">
                <Tex>{g.tex}</Tex>
              </dt>
              <dd className="text-sm text-slate-600 dark:text-slate-300">{g.meaning}</dd>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500">Sin resultados.</p>}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Alfabeto griego en el curso</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          El significado depende del contexto: estos son los usos más habituales.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {GREEK.map(([tex, name, use]) => (
                <tr key={name} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="w-24 py-1.5 text-center">
                    <Tex>{tex}</Tex>
                  </td>
                  <td className="w-20 py-1.5 font-medium">{name}</td>
                  <td className="py-1.5 text-slate-600 dark:text-slate-300">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Hoja de referencia: transformers en NumPy</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Supone <code className="font-mono">from numpy import *</code> y <code className="font-mono">from numpy.linalg import *</code>{' '}
          salvo que se indique otra librería.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CHEATSHEET.map((g) => (
            <div key={g.title} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{g.title}</h3>
                <span className="flex gap-1 text-xs">
                  {g.stage.map((slug) => (
                    <Link key={slug} to={`/modulo/${slug}`} className="rounded bg-slate-100 px-1.5 py-0.5 hover:bg-brand-50 dark:bg-slate-800" title={stageBySlug(slug).title}>
                      módulo {stageBySlug(slug).n}
                    </Link>
                  ))}
                </span>
              </div>
              <ul className="space-y-1.5">
                {g.rows.map(([code, what]) => (
                  <li key={code} className="text-sm">
                    <code className="block font-mono text-[12.5px] text-brand-700 dark:text-brand-100">{code}</code>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{what}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
