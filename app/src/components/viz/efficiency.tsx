import { useState } from 'react'
import { kvCacheBytes, onlineSoftmax, softmax } from '../../lib/tfmath'
import { fmtBytes } from '../../lib/format'
import { Bars, Heatmap } from './charts'
import { Readout, Segmented, Slider, VizLayout } from './controls'

/** Cómo comparten keys y values las cabezas en MHA, GQA y MQA. */
export function KVSharing() {
  const [kv, setKv] = useState(2)
  const H = 8
  const groups = Array.from({ length: H }, (_, i) => Math.floor(i / (H / kv)))
  const colors = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd'] as const
  const name = kv === H ? 'MHA' : kv === 1 ? 'MQA' : `GQA (${kv} grupos)`
  return (
    <VizLayout
      plot={
        <svg viewBox="0 0 420 170" className="h-auto w-full" role="img" aria-label="Cabezas de query y cabezas de key/value">
          {groups.map((g, i) => (
            <g key={i}>
              <rect x={10 + i * 51} y={10} width={42} height={30} rx={5} fill={`var(--viz-${colors[g]})`} opacity={0.85} />
              <text x={31 + i * 51} y={30} fontSize={12} textAnchor="middle" fill="#fff" fontWeight={600}>
                Q{i + 1}
              </text>
              <line x1={31 + i * 51} y1={40} x2={10 + ((g + 0.5) * 408) / kv} y2={110} stroke={`var(--viz-${colors[g]})`} opacity={0.6} />
            </g>
          ))}
          {Array.from({ length: kv }, (_, g) => (
            <g key={g}>
              <rect x={10 + (g * 408) / kv + 408 / kv / 2 - 24} y={110} width={48} height={34} rx={5} fill="none" stroke={`var(--viz-${colors[g]})`} strokeWidth={2.5} />
              <text x={10 + ((g + 0.5) * 408) / kv} y={132} fontSize={12} textAnchor="middle" fill="var(--viz-text)" fontWeight={600}>
                KV{g + 1}
              </text>
            </g>
          ))}
          <text x={10} y={165} fontSize={11} fill="var(--viz-muted)">
            8 cabezas de query; {kv} cabeza{kv > 1 ? 's' : ''} de key/value
          </text>
        </svg>
      }
      side={
        <>
          <Segmented
            value={String(kv)}
            onChange={(v) => setKv(Number(v))}
            options={[
              { value: '8', label: 'MHA' },
              { value: '4', label: 'GQA-4' },
              { value: '2', label: 'GQA-2' },
              { value: '1', label: 'MQA' },
            ]}
          />
          <Readout items={[`\\text{${name}}`, `\\text{KV cache} = ${kv}/${H} = ${((kv / H) * 100).toFixed(1)}\\%\\text{ de la de MHA}`]} />
          <p className="text-xs text-slate-500">GQA interpola entre MHA (máxima calidad) y MQA (mínima memoria). Cada grupo de queries comparte un par K, V.</p>
        </>
      }
    />
  )
}

/** Calculadora de memoria de la KV cache. */
export function KVCacheCalculator() {
  const [layers, setLayers] = useState(32)
  const [qHeads, setQHeads] = useState(32)
  const [kvHeads, setKvHeads] = useState(8)
  const [headDim, setHeadDim] = useState(128)
  const [ctx, setCtx] = useState(15)
  const [batch, setBatch] = useState(1)
  const [bytes, setBytes] = useState<'2' | '1'>('2')
  const tokens = 2 ** ctx
  const opts = { layers, headDim, tokens, batch, bytes: Number(bytes) }
  const mha = kvCacheBytes({ ...opts, kvHeads: qHeads })
  const gqa = kvCacheBytes({ ...opts, kvHeads: Math.min(kvHeads, qHeads) })
  const mqa = kvCacheBytes({ ...opts, kvHeads: 1 })
  return (
    <VizLayout
      plot={
        <div className="space-y-3">
          <Bars values={[mha / 2 ** 30, gqa / 2 ** 30, mqa / 2 ** 30]} labels={['MHA', `GQA (${kvHeads})`, 'MQA']} digits={2} />
          <p className="text-xs text-slate-500">GiB de KV cache. Una GPU de 80 GB también tiene que guardar los pesos (≈ 16 GB para 8 B parámetros en FP16).</p>
        </div>
      }
      side={
        <>
          <Slider label="Capas" value={layers} min={8} max={128} step={4} onChange={setLayers} />
          <Slider label="Cabezas Q" value={qHeads} min={8} max={128} step={8} onChange={setQHeads} />
          <Slider label="Cabezas KV" value={kvHeads} min={1} max={qHeads} step={1} onChange={setKvHeads} />
          <Slider label="d_head" value={headDim} min={64} max={256} step={64} onChange={setHeadDim} />
          <Slider label="log₂ tokens" value={ctx} min={10} max={20} step={1} onChange={setCtx} />
          <Slider label="Lote" value={batch} min={1} max={64} step={1} onChange={setBatch} />
          <Segmented value={bytes} onChange={setBytes} options={[{ value: '2', label: 'FP16' }, { value: '1', label: 'FP8' }]} />
          <Readout items={[`${tokens.toLocaleString('es')}\\text{ tokens}`, `\\text{GQA: } ${fmtBytes(gqa).replace(' ', '\\,\\text{')}}`]} />
        </>
      }
    />
  )
}

/** El softmax en línea por bloques de FlashAttention, paso a paso. */
export function OnlineSoftmaxStepper() {
  const x = [1.2, 0.3, 2.5, -0.4, 3.1, 0.8, 1.9, 4.0, 0.1]
  const [block, setBlock] = useState(3)
  const [k, setK] = useState(1)
  const { states } = onlineSoftmax(x, block)
  const nb = states.length
  const step = Math.min(k, nb)
  const st = states[step - 1]
  const seen = Math.min(x.length, step * block)
  const exact = softmax(x)
  return (
    <VizLayout
      plot={
        <div className="space-y-3">
          <Heatmap
            values={[x]}
            colLabels={x.map((_, i) => `x${i + 1}`)}
            cell={40}
            showValues
            digits={1}
            highlight={(_, j) => j >= (step - 1) * block && j < seen}
            ariaLabel="Logits procesados por bloques"
          />
          {step === nb && (
            <>
              <p className="text-xs font-semibold">Resultado final = softmax exacta:</p>
              <Bars values={exact} labels={x.map((_, i) => `x${i + 1}`)} max={1} color="c" />
            </>
          )}
        </div>
      }
      side={
        <>
          <Slider label="Tamaño de bloque" value={block} min={1} max={9} step={1} onChange={(b) => { setBlock(b); setK(1) }} />
          <Slider label="Bloque procesado" value={step} min={1} max={nb} step={1} onChange={setK} />
          <Readout
            items={[
              `m = \\max(x_1,\\dots,x_{${seen}}) = ${st.m.toFixed(2)}`,
              `\\ell = \\textstyle\\sum_{j\\le ${seen}} e^{x_j - m} = ${st.l.toFixed(3)}`,
            ]}
          />
          <p className="text-xs text-slate-500">
            Cada bloque nuevo puede subir el máximo m; la suma acumulada ℓ se corrige multiplicándola por e^(m_viejo − m_nuevo). Nunca hace
            falta tener toda la fila a la vez: por eso FlashAttention no materializa la matriz N×N.
          </p>
        </>
      }
    />
  )
}

/** Patrones de atención dispersa: completa, ventana deslizante, dilatada y global + local. */
export function SparsePatterns() {
  const [mode, setMode] = useState<'full' | 'window' | 'dilated' | 'global'>('window')
  const [w, setW] = useState(3)
  const N = 16
  const M = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      if (j > i) return -Infinity
      if (mode === 'full') return 1
      if (mode === 'window') return i - j < w ? 1 : -Infinity
      if (mode === 'dilated') return (i - j) % 2 === 0 && i - j < 2 * w ? 1 : -Infinity
      return i - j < w || j === 0 ? 1 : -Infinity
    }),
  )
  const count = M.flat().filter(Number.isFinite).length
  return (
    <VizLayout
      plot={<Heatmap values={M} cell={18} max={1} ariaLabel="Patrón de atención causal" />}
      side={
        <>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'full', label: 'Completa' },
              { value: 'window', label: 'Ventana' },
              { value: 'dilated', label: 'Dilatada' },
              { value: 'global', label: 'Global + local' },
            ]}
          />
          <Slider label="Ventana w" value={w} min={1} max={8} step={1} onChange={setW} />
          <Readout items={[`\\text{pares calculados} = ${count}\\text{ de } ${(N * (N + 1)) / 2}`]} />
          <p className="text-xs text-slate-500">Con ventana deslizante el coste crece como N·w en lugar de N². El token 0 «global» actúa como sumidero de atención (attention sink).</p>
        </>
      }
    />
  )
}
