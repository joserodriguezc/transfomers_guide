import { useMemo, useState } from 'react'
import type { Vec2 } from '../../lib/linalg'
import { rng } from '../../lib/random'
import { acf, chronosTokenize, cosineAlphaBar, hzToMel, iou, linearSchedule, melToHz, numPatches, stft } from '../../lib/tfmath'
import { Heatmap, Legend, LineChart } from './charts'
import { Readout, Segmented, Slider, VizLayout } from './controls'
import { Dot, Plane, Polyline } from './plane'

// ── Series temporales ──────────────────────────────────────────────────────

function makeSeries(n: number, trend: number, amp: number, period: number, noise: number, seed = 5): number[] {
  const r = rng(seed)
  return Array.from({ length: n }, (_, t) => trend * t + amp * Math.sin((2 * Math.PI * t) / period) + noise * r.normal())
}

/** Serie con tendencia, estacionalidad y ruido; su ACF y el efecto de diferenciar. */
export function SeriesExplorer() {
  const [trend, setTrend] = useState(0.05)
  const [amp, setAmp] = useState(2)
  const [period, setPeriod] = useState(12)
  const [noise, setNoise] = useState(0.6)
  const [diff, setDiff] = useState<'0' | '1' | 's'>('0')
  const raw = useMemo(() => makeSeries(144, trend, amp, period, noise), [trend, amp, period, noise])
  const x = diff === '0' ? raw : diff === '1' ? raw.slice(1).map((v, i) => v - raw[i]) : raw.slice(period).map((v, i) => v - raw[i])
  const r = acf(x, 36)
  const band = 1.96 / Math.sqrt(x.length)
  return (
    <div className="space-y-3">
      <LineChart series={[{ y: x, color: 'a', width: 1.5 }]} height={170} xLabel="t" ariaLabel="Serie temporal" />
      <VizLayout
        plot={
          <LineChart
            series={[{ y: r, color: 'c', dots: true, noLine: false, width: 1 }]}
            yRange={[-1, 1]}
            hlines={[[band, 'muted'], [-band, 'muted']]}
            vlines={[[period, 'd']]}
            xLabel="retardo k (ACF)"
            height={170}
          />
        }
        side={
          <>
            <Slider label="Tendencia" value={trend} min={0} max={0.2} step={0.01} onChange={setTrend} />
            <Slider label="Amplitud" value={amp} min={0} max={4} step={0.25} onChange={setAmp} />
            <Slider label="Periodo" value={period} min={4} max={24} step={1} onChange={setPeriod} />
            <Slider label="Ruido" value={noise} min={0} max={2} step={0.1} onChange={setNoise} />
            <Segmented
              value={diff}
              onChange={setDiff}
              options={[
                { value: '0', label: 'Original' },
                { value: '1', label: 'Δ (1ª dif.)' },
                { value: 's', label: `Δ estacional` },
              ]}
            />
            <p className="text-xs text-slate-500">
              Una tendencia hace que la ACF decaiga muy despacio (no estacionaria). La estacionalidad crea picos en múltiplos del periodo
              (línea naranja). Las líneas grises son la banda ±1.96/√n: dentro de ella, la correlación no es significativa.
            </p>
          </>
        }
      />
    </div>
  )
}

/** Tokenizar una serie: parches de PatchTST o cubetas de Chronos. */
export function SeriesTokenizer() {
  const [mode, setMode] = useState<'patch' | 'chronos'>('patch')
  const [P, setP] = useState(16)
  const [S, setS] = useState(8)
  const [bins, setBins] = useState(16)
  const x = useMemo(() => makeSeries(128, 0.02, 1.5, 24, 0.3, 9).map((v) => v + 4), [])
  const n = numPatches(x.length, P, S)
  const tok = chronosTokenize(x, bins)
  const recon = tok.ids.map((id) => tok.centers[id] * tok.scale)
  return (
    <VizLayout
      plot={
        mode === 'patch' ? (
          <LineChart
            series={[{ y: x, color: 'a', width: 1.5 }]}
            bands={Array.from({ length: n }, (_, i) => [i * S, i * S + P - 1, i % 2 ? 'c' : 'd'] as [number, number, 'c' | 'd'])}
            height={200}
            xLabel="t"
          />
        ) : (
          <>
            <LineChart
              series={[
                { y: x, color: 'a', width: 1.5 },
                { y: recon, color: 'b', width: 1.5, dashed: true },
              ]}
              height={200}
              xLabel="t"
            />
            <Legend items={[{ label: 'serie', color: 'a' }, { label: 'reconstruida desde los tokens', color: 'b', dashed: true }]} />
          </>
        )
      }
      side={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'patch', label: 'PatchTST' }, { value: 'chronos', label: 'Chronos' }]} />
          {mode === 'patch' ? (
            <>
              <Slider label="Longitud P" value={P} min={4} max={32} step={2} onChange={setP} />
              <Slider label="Paso S" value={S} min={2} max={32} step={2} onChange={setS} />
              <Readout items={[`N = \\lfloor (L - P)/S \\rfloor + 1 = ${n}\\text{ tokens}`, `\\text{atención: } ${n}^2 = ${n * n}\\text{ vs } ${x.length}^2 = ${x.length ** 2}`]} />
            </>
          ) : (
            <>
              <Slider label="Cubetas" value={bins} min={4} max={64} step={4} onChange={setBins} />
              <Readout
                items={[
                  `s = \\tfrac{1}{L}\\textstyle\\sum|x_t| = ${tok.scale.toFixed(2)}`,
                  `\\text{primeros IDs: } ${tok.ids.slice(0, 6).join(',\\,')}\\dots`,
                  `\\text{MAE de cuantizar} = ${(x.reduce((a, v, i) => a + Math.abs(v - recon[i]), 0) / x.length).toFixed(3)}`,
                ]}
              />
            </>
          )}
          <p className="text-xs text-slate-500">
            PatchTST agrupa P valores consecutivos en un token (menos tokens, más contexto). Chronos escala la serie y convierte cada valor en
            el ID de una cubeta: la serie se vuelve un «texto» con vocabulario fijo.
          </p>
        </>
      }
    />
  )
}

// ── Visión ─────────────────────────────────────────────────────────────────

/** Imagen sintética de 32×32 (un sol, una casa y el cielo) en valores [0, 1]. */
function sceneImage(): number[][] {
  return Array.from({ length: 32 }, (_, i) =>
    Array.from({ length: 32 }, (_, j) => {
      if ((i - 8) ** 2 + (j - 24) ** 2 < 20) return 0.95
      if (i > 16 && i < 30 && j > 4 && j < 18) return i > 23 && j > 9 && j < 13 ? 0.15 : 0.6
      if (i > 9 && i <= 16 && Math.abs(j - 11) < i - 8) return 0.35
      if (i >= 30) return 0.45
      return 0.08 + i * 0.005
    }),
  )
}

/** Imagen → parches → tokens (ViT), y las ventanas desplazadas de Swin. */
export function ImagePatches() {
  const img = useMemo(() => sceneImage(), [])
  const [p, setP] = useState(8)
  const [mode, setMode] = useState<'vit' | 'swin' | 'shift'>('vit')
  const n = (32 / p) ** 2
  const cell = 9
  const win = 2 * p
  const off = mode === 'shift' ? p : 0
  return (
    <VizLayout
      plot={
        <svg viewBox={`0 0 ${32 * cell} ${32 * cell}`} className="h-auto w-full max-w-xs" role="img" aria-label="Imagen dividida en parches">
          {img.map((r, i) => r.map((v, j) => <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} fill="var(--viz-a)" opacity={v} />))}
          {Array.from({ length: 32 / p + 1 }, (_, k) => (
            <g key={k}>
              <line x1={k * p * cell} x2={k * p * cell} y1={0} y2={32 * cell} stroke="var(--viz-text)" strokeWidth={0.8} opacity={0.6} />
              <line y1={k * p * cell} y2={k * p * cell} x1={0} x2={32 * cell} stroke="var(--viz-text)" strokeWidth={0.8} opacity={0.6} />
            </g>
          ))}
          {mode !== 'vit' &&
            Array.from({ length: 32 / win + 1 }, (_, a) =>
              Array.from({ length: 32 / win + 1 }, (_, b) => (
                <rect
                  key={`${a}-${b}`}
                  x={(b * win - off) * cell}
                  y={(a * win - off) * cell}
                  width={win * cell}
                  height={win * cell}
                  fill="none"
                  stroke="var(--viz-d)"
                  strokeWidth={3}
                />
              )),
            )}
        </svg>
      }
      side={
        <>
          <Segmented value={String(p)} onChange={(v) => setP(Number(v))} options={[{ value: '4', label: 'P = 4' }, { value: '8', label: 'P = 8' }, { value: '16', label: 'P = 16' }]} />
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'vit', label: 'ViT' },
              { value: 'swin', label: 'Swin: ventanas' },
              { value: 'shift', label: 'Swin: desplazadas' },
            ]}
          />
          <Readout
            items={[
              `N = (32/${p})^2 = ${n}\\text{ parches}`,
              `\\text{cada parche: } ${p}\\times${p}\\times 3 = ${p * p * 3}\\text{ valores}`,
              mode === 'vit' ? `\\text{atención global: } N^2 = ${n * n}` : `\\text{atención local: } ${Math.max(1, (32 / win) ** 2)}\\times ${Math.min(n, 4)}^2 = ${Math.max(1, (32 / win) ** 2) * Math.min(n, 4) ** 2}`,
            ]}
          />
          <p className="text-xs text-slate-500">
            ViT trata cada parche como un token y aplica atención global. Swin calcula la atención dentro de ventanas (naranja) de 2×2
            parches; en la capa siguiente desplaza las ventanas medio tamaño para que la información cruce sus bordes.
          </p>
        </>
      }
    />
  )
}

/** Mapa de regiones de la escena para la segmentación (0 cielo, 1 sol, 2 tejado, 3 pared, 4 puerta, 5 suelo). */
function sceneLabels(): number[][] {
  return Array.from({ length: 32 }, (_, i) =>
    Array.from({ length: 32 }, (_, j) => {
      if ((i - 8) ** 2 + (j - 24) ** 2 < 20) return 1
      if (i > 16 && i < 30 && j > 4 && j < 18) return i > 23 && j > 9 && j < 13 ? 4 : 3
      if (i > 9 && i <= 16 && Math.abs(j - 11) < i - 8) return 2
      if (i >= 30) return 5
      return 0
    }),
  )
}
const REGION_NAMES = ['cielo', 'sol', 'tejado', 'pared', 'puerta', 'suelo']

/** Un clic como prompt: el «decodificador» devuelve la región que contiene el punto; con la caja, tres hipótesis. */
export function SAMPrompt() {
  const labels = useMemo(() => sceneLabels(), [])
  const [pt, setPt] = useState<[number, number]>([20, 8])
  const [mode, setMode] = useState<'punto' | 'multi'>('punto')
  const reg = labels[pt[0]][pt[1]]
  const house = (l: number) => l === 2 || l === 3 || l === 4
  const masks = [labels.map((r) => r.map((l) => (l === reg ? 1 : 0))), labels.map((r) => r.map((l) => (house(reg) && house(l)) || (!house(reg) && l === reg) ? 1 : 0)), labels.map((r) => r.map((l) => (l !== 0 ? 1 : 0)))]
  const [hyp, setHyp] = useState(0)
  const mask = mode === 'punto' ? masks[0] : masks[hyp]
  const gt = masks[1]
  const cell = 9
  return (
    <VizLayout
      plot={
        <svg viewBox={`0 0 ${32 * cell} ${32 * cell}`} className="h-auto w-full max-w-xs cursor-crosshair" role="img" aria-label="Haz clic para segmentar">
          {labels.map((r, i) =>
            r.map((l, j) => (
              <rect
                key={`${i}-${j}`}
                x={j * cell}
                y={i * cell}
                width={cell}
                height={cell}
                fill={mask[i][j] ? 'var(--viz-c)' : 'var(--viz-a)'}
                opacity={mask[i][j] ? 0.85 : 0.12 + l * 0.13}
                onClick={() => setPt([i, j])}
              />
            )),
          )}
          <circle cx={pt[1] * cell + cell / 2} cy={pt[0] * cell + cell / 2} r={6} fill="var(--viz-d)" stroke="#fff" strokeWidth={2} />
        </svg>
      }
      side={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'punto', label: 'Una máscara' }, { value: 'multi', label: 'Tres hipótesis' }]} />
          {mode === 'multi' && (
            <Segmented value={String(hyp)} onChange={(v) => setHyp(Number(v))} options={[{ value: '0', label: 'Parte' }, { value: '1', label: 'Objeto' }, { value: '2', label: 'Todo' }]} />
          )}
          <Readout items={[`\\text{región: ${REGION_NAMES[reg]}}`, `\\text{IoU con «objeto»} = ${iou(mask, gt).toFixed(2)}`]} />
          <p className="text-xs text-slate-500">
            Haz clic en la imagen. Un punto es ambiguo (¿la puerta o la casa?): por eso SAM devuelve varias máscaras (parte, objeto, todo) con
            una puntuación de calidad, y el usuario o el sistema elige.
          </p>
        </>
      }
    />
  )
}

// ── Difusión ───────────────────────────────────────────────────────────────

function spiral(n: number, seed = 2): Vec2[] {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 3 * Math.PI + 0.5
    return [0.28 * t * Math.cos(t) + 0.05 * r.normal(), 0.28 * t * Math.sin(t) + 0.05 * r.normal()]
  })
}

/** Proceso hacia delante: x_t = √ᾱ_t x_0 + √(1 − ᾱ_t) ε sobre una espiral 2D. */
export function DiffusionForward() {
  const T = 1000
  const [t, setT] = useState(0)
  const [sched, setSched] = useState<'lin' | 'cos'>('lin')
  const x0 = useMemo(() => spiral(300), [])
  const eps = useMemo(() => {
    const r = rng(7)
    return x0.map(() => [r.normal(), r.normal()] as Vec2)
  }, [x0])
  const lin = useMemo(() => linearSchedule(T).alphaBar, [])
  const cos = useMemo(() => cosineAlphaBar(T).slice(1), [])
  const ab = (sched === 'lin' ? lin : cos)[Math.max(0, t - 1)]
  const a = t === 0 ? 1 : ab
  const xt = x0.map((p, i) => [Math.sqrt(a) * p[0] + Math.sqrt(1 - a) * eps[i][0], Math.sqrt(a) * p[1] + Math.sqrt(1 - a) * eps[i][1]] as Vec2)
  return (
    <VizLayout
      plot={
        <Plane xRange={[-3.5, 3.5]} yRange={[-3.5, 3.5]}>
          {xt.map((p, i) => (
            <Dot key={i} at={p} r={2.2} color="a" opacity={0.7} />
          ))}
        </Plane>
      }
      side={
        <>
          <Slider label="Paso t" value={t} min={0} max={T} step={10} onChange={setT} />
          <Segmented value={sched} onChange={setSched} options={[{ value: 'lin', label: 'β lineal' }, { value: 'cos', label: 'Coseno' }]} />
          <Readout items={[`\\bar\\alpha_t = ${a.toFixed(4)}`, `\\sqrt{\\bar\\alpha_t} = ${Math.sqrt(a).toFixed(3)}\\;(\\text{señal})`, `\\sqrt{1-\\bar\\alpha_t} = ${Math.sqrt(1 - a).toFixed(3)}\\;(\\text{ruido})`]} />
          <LineChart
            series={[
              { y: lin.filter((_, i) => i % 10 === 0), color: 'b' },
              { y: cos.filter((_, i) => i % 10 === 0), color: 'c' },
            ]}
            yRange={[0, 1]}
            height={130}
            vlines={[[t / 10, 'd']]}
            xLabel="t / 10"
          />
          <Legend items={[{ label: 'ᾱ lineal', color: 'b' }, { label: 'ᾱ coseno', color: 'c' }]} />
        </>
      }
    />
  )
}

/** Guía sin clasificador en 1D: la distribución guiada ∝ p(x)·(p(x|c)/p(x))^w. */
export function CFGViz() {
  const [w, setW] = useState(1)
  const xs = Array.from({ length: 241 }, (_, i) => -6 + i * 0.05)
  const g = (x: number, m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / s
  const pu = xs.map((x) => 0.5 * g(x, -2, 1) + 0.5 * g(x, 2, 1))
  const pc = xs.map((x) => g(x, 2, 1))
  const guided = xs.map((_, i) => pu[i] * Math.pow(pc[i] / pu[i], w))
  const norm = (v: number[]) => {
    const s = v.reduce((a, b) => a + b, 0) * 0.05
    return v.map((y) => y / s)
  }
  return (
    <VizLayout
      plot={
        <>
          <LineChart
            series={[
              { x: xs, y: norm(pu), color: 'muted', dashed: true },
              { x: xs, y: norm(pc), color: 'a', dashed: true },
              { x: xs, y: norm(guided), color: 'c', width: 3 },
            ]}
            yRange={[0, 1.2]}
            height={220}
            xLabel="x"
          />
          <Legend
            items={[
              { label: 'p(x) incondicional', color: 'muted', dashed: true },
              { label: 'p(x | c)', color: 'a', dashed: true },
              { label: 'guiada', color: 'c' },
            ]}
          />
        </>
      }
      side={
        <>
          <Slider label="Escala w" value={w} min={0} max={8} step={0.5} onChange={setW} />
          <p className="text-xs text-slate-500">
            Con w = 0 se ignora la condición; con w = 1 se muestrea p(x|c); con w &gt; 1 la distribución se estrecha hacia la zona «más típica»
            de la clase: imágenes más fieles al prompt pero menos diversas.
          </p>
        </>
      }
    />
  )
}

/** Cuántos tokens procesa un transformer de difusión según resolución, VAE, parche y fotogramas. */
export function LatentTokens() {
  const [res, setRes] = useState(512)
  const [down, setDown] = useState(8)
  const [p, setP] = useState(2)
  const [frames, setFrames] = useState(1)
  const [tDown, setTDown] = useState(4)
  const lat = res / down
  const perFrame = (lat / p) ** 2
  const latFrames = frames === 1 ? 1 : Math.ceil(frames / tDown)
  const tokens = perFrame * latFrames
  const pixelTokens = (res / p) ** 2 * frames
  return (
    <VizLayout
      plot={
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-[8rem_1fr] gap-1">
            <span className="text-slate-500">Imagen</span>
            <span className="font-mono">{res}×{res}×3 × {frames} fotograma{frames > 1 ? 's' : ''}</span>
            <span className="text-slate-500">Latente</span>
            <span className="font-mono">{lat}×{lat}×4 × {latFrames}</span>
            <span className="text-slate-500">Tokens</span>
            <span className="font-mono font-semibold">{tokens.toLocaleString('es')}</span>
            <span className="text-slate-500">Sin VAE</span>
            <span className="font-mono">{pixelTokens.toLocaleString('es')}</span>
          </div>
          <p className="text-xs text-slate-500">El coste de la atención completa crece con tokens²: el espacio latente lo reduce en un factor {((pixelTokens / tokens) ** 2).toExponential(1)}.</p>
        </div>
      }
      side={
        <>
          <Slider label="Resolución" value={res} min={256} max={1024} step={128} onChange={setRes} />
          <Slider label="Reducción VAE" value={down} min={4} max={32} step={4} onChange={setDown} />
          <Slider label="Parche p" value={p} min={1} max={4} step={1} onChange={setP} />
          <Slider label="Fotogramas" value={frames} min={1} max={121} step={8} onChange={setFrames} />
          <Slider label="Reducción temporal" value={tDown} min={1} max={8} step={1} onChange={setTDown} />
        </>
      }
    />
  )
}

// ── Audio ──────────────────────────────────────────────────────────────────

/** Onda → espectrograma (STFT) con escala lineal o mel. */
export function SpectrogramViz() {
  const sr = 2000
  const [sig, setSig] = useState<'chirp' | 'tonos' | 'pulsos'>('chirp')
  const [win, setWin] = useState(64)
  const [scale, setScale] = useState<'lin' | 'mel'>('lin')
  const x = useMemo(() => {
    const n = 2000
    return Array.from({ length: n }, (_, t) => {
      const s = t / sr
      if (sig === 'chirp') return Math.sin(2 * Math.PI * (50 * s + 200 * s * s))
      if (sig === 'tonos') return t < n / 2 ? Math.sin(2 * Math.PI * 150 * s) : Math.sin(2 * Math.PI * 400 * s) + 0.5 * Math.sin(2 * Math.PI * 600 * s)
      return t % 400 < 20 ? 1 : 0
    })
  }, [sig])
  const S = useMemo(() => stft(x, win, win / 2), [x, win])
  const bins = S[0].length
  const hzPerBin = sr / win
  const melRows = 24
  const view: number[][] =
    scale === 'lin'
      ? S[0].map((_, k) => S.map((f) => Math.log1p(f[bins - 1 - k])))
      : Array.from({ length: melRows }, (_, r) => {
          const m = hzToMel(sr / 2) * (1 - (r + 0.5) / melRows)
          const k = Math.min(bins - 1, Math.round(melToHz(m) / hzPerBin))
          return S.map((f) => Math.log1p(f[k]))
        })
  return (
    <div className="space-y-3">
      <LineChart series={[{ y: x.slice(0, 400), color: 'a', width: 1 }]} height={110} xLabel="primeras 400 muestras (0.2 s)" />
      <VizLayout
        plot={<div className="overflow-x-auto"><Heatmap values={view} cell={Math.max(3, Math.min(10, 360 / S.length))} ariaLabel="Espectrograma: tiempo en horizontal, frecuencia en vertical" /></div>}
        side={
          <>
            <Segmented value={sig} onChange={setSig} options={[{ value: 'chirp', label: 'Chirp' }, { value: 'tonos', label: 'Tonos' }, { value: 'pulsos', label: 'Pulsos' }]} />
            <Slider label="Ventana" value={win} min={16} max={256} step={16} onChange={setWin} />
            <Segmented value={scale} onChange={setScale} options={[{ value: 'lin', label: 'Hz lineal' }, { value: 'mel', label: 'Mel' }]} />
            <Readout items={[`\\Delta f = f_s/N = ${hzPerBin.toFixed(1)}\\text{ Hz}`, `\\Delta t = ${((win / 2 / sr) * 1000).toFixed(0)}\\text{ ms (salto)}`]} />
            <p className="text-xs text-slate-500">Ventana larga: buena resolución en frecuencia y mala en tiempo; ventana corta, al revés. La escala mel dedica más filas a las frecuencias bajas, como el oído.</p>
          </>
        }
      />
    </div>
  )
}

/** Cuantización vectorial residual: cada nivel cuantiza el error del anterior. */
export function RVQViz() {
  const [levels, setLevels] = useState(1)
  const [K, setK] = useState(4)
  const data = useMemo(() => {
    const r = rng(4)
    return Array.from({ length: 60 }, () => [r.normal() * 1.6, r.normal() * 1.2] as Vec2)
  }, [])
  // Libros de códigos fijos: rejillas cada vez más finas (escala 1/2 por nivel)
  const book = (lvl: number): Vec2[] => {
    const g = Math.round(Math.sqrt(K))
    const s = 2.4 / 2 ** lvl
    return Array.from({ length: g * g }, (_, i) => [((i % g) - (g - 1) / 2) * s * (4 / g), (Math.floor(i / g) - (g - 1) / 2) * s * (4 / g)] as Vec2)
  }
  const quant = data.map((p) => {
    let res: Vec2 = [p[0], p[1]]
    let rec: Vec2 = [0, 0]
    for (let l = 0; l < levels; l++) {
      const c = book(l).reduce((best, q) => (Math.hypot(q[0] - res[0], q[1] - res[1]) < Math.hypot(best[0] - res[0], best[1] - res[1]) ? q : best))
      rec = [rec[0] + c[0], rec[1] + c[1]]
      res = [res[0] - c[0], res[1] - c[1]]
    }
    return rec
  })
  const mse = data.reduce((a, p, i) => a + (p[0] - quant[i][0]) ** 2 + (p[1] - quant[i][1]) ** 2, 0) / data.length
  const bits = levels * Math.log2(Math.round(Math.sqrt(K)) ** 2)
  return (
    <VizLayout
      plot={
        <Plane xRange={[-5, 5]} yRange={[-5, 5]}>
          {data.map((p, i) => (
            <g key={i}>
              <Polyline points={[p, quant[i]]} color="muted" width={1} />
              <Dot at={p} r={2.5} color="a" />
              <Dot at={quant[i]} r={3} color="b" />
            </g>
          ))}
        </Plane>
      }
      side={
        <>
          <Slider label="Niveles (códigos)" value={levels} min={1} max={4} step={1} onChange={setLevels} />
          <Segmented value={String(K)} onChange={(v) => setK(Number(v))} options={[{ value: '4', label: 'K = 4' }, { value: '9', label: 'K = 9' }, { value: '16', label: 'K = 16' }]} />
          <Readout items={[`\\text{error cuadrático medio} = ${mse.toFixed(3)}`, `\\text{bits por vector} = ${bits.toFixed(1)}`]} />
          <p className="text-xs text-slate-500">
            Azul: vectores originales; rojo: reconstrucción. Cada nivel añade un código que corrige el residuo del anterior. Un códec neuronal
            de audio emite un código por nivel y por trama: esos códigos son los «tokens de audio».
          </p>
        </>
      }
    />
  )
}
