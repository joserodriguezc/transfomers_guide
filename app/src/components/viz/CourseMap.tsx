import { useState } from 'react'
import { Link } from 'react-router-dom'
import { stageBySlug } from '../../course/curriculum'

const DOMAINS: { key: string; title: string; token: string; example: string; stages: string[] }[] = [
  {
    key: 'texto',
    title: 'Texto',
    token: 'Subpalabra (BPE)',
    example: '«transformers» → [trans, form, ers]',
    stages: ['tokenizacion', 'embeddings-posicion', 'atencion', 'encoder-decoder'],
  },
  {
    key: 'series',
    title: 'Series temporales',
    token: 'Parche de valores o cubeta cuantizada',
    example: '512 valores → 63 parches de 16 (paso 8)',
    stages: ['series-temporales', 'transformers-series'],
  },
  {
    key: 'imagen',
    title: 'Imagen',
    token: 'Parche de píxeles (o de latentes)',
    example: '224×224 → 14×14 = 196 parches de 16×16',
    stages: ['vision-transformers', 'segmentacion-sam', 'difusion'],
  },
  {
    key: 'video',
    title: 'Vídeo',
    token: 'Tubo espacio-temporal en el espacio latente',
    example: '121 fotogramas → 31 latentes × 32×32 / 2² parches',
    stages: ['dit-video'],
  },
  {
    key: 'audio',
    title: 'Audio',
    token: 'Trama de espectrograma log-mel o código de un códec',
    example: '30 s → 3000 tramas mel → 1500 posiciones (Whisper)',
    stages: ['audio-senales', 'audio-transformers'],
  },
  {
    key: 'rl',
    title: 'Decisiones',
    token: 'Retorno, estado y acción',
    example: '(R̂₀, s₀, a₀, R̂₁, s₁, a₁, …)',
    stages: ['rl-decision-transformer', 'world-models'],
  },
]

/** Mapa del curso: qué es un «token» en cada dominio y qué módulos lo tratan. La arquitectura no cambia. */
export function CourseMap() {
  const [active, setActive] = useState('texto')
  const d = DOMAINS.find((x) => x.key === active)!
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {DOMAINS.map((x) => (
          <button
            key={x.key}
            type="button"
            onClick={() => setActive(x.key)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              x.key === active ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100' : 'border-slate-200 hover:border-brand-500 dark:border-slate-700'
            }`}
          >
            {x.title}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
        <p>
          <span className="font-semibold">Token:</span> {d.token}
        </p>
        <p className="font-mono text-xs text-slate-500">{d.example}</p>
        <p className="mt-1 text-xs text-slate-500">Después: embedding + posición → bloques de atención y FFN → una cabeza de salida para la tarea.</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {d.stages.map((slug) => {
          const s = stageBySlug(slug)
          return (
            <li key={slug}>
              <Link to={`/modulo/${s.slug}`} className="block rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-500 dark:border-slate-700">
                <span className="font-mono text-xs text-slate-400">Módulo {s.n}</span>
                <span className="block font-medium">{s.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
