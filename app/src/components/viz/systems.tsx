import { useMemo, useState } from 'react'
import type { Vec2 } from '../../lib/linalg'
import { matMul, transpose } from '../../lib/linalg'
import { rng } from '../../lib/random'
import { discountedReturns, groupAdvantages, loraParams, newtonSchulz, quantizeSymmetric, uct } from '../../lib/tfmath'
import { Bars, Heatmap, Legend, LineChart, TokenChips } from './charts'
import { Readout, Segmented, Slider, VizLayout } from './controls'
import { Arrow, Plane, Polyline } from './plane'

// ── RL y Decision Transformer ──────────────────────────────────────────────

/** Trayectoria en una cuadrícula y su secuencia (R̂, s, a) para Decision Transformer. */
export function DecisionTransformerViz() {
  const [gamma, setGamma] = useState(1)
  const [target, setTarget] = useState(10)
  // Trayectoria fija en una cuadrícula 5×5: recompensa −1 por paso y +10 al llegar a la meta
  const path: [number, number][] = [[4, 0], [3, 0], [3, 1], [2, 1], [2, 2], [1, 2], [1, 3], [0, 3], [0, 4]]
  const actions = ['↑', '→', '↑', '→', '↑', '→', '↑', '→']
  const rewards = actions.map((_, i) => (i === actions.length - 1 ? 10 : -1))
  const G = discountedReturns(rewards, gamma)
  const rtg = rewards.map((_, t) => target - rewards.slice(0, t).reduce((a, b) => a + b, 0))
  const cell = 34
  return (
    <VizLayout
      plot={
        <div className="space-y-3">
          <svg viewBox={`0 0 ${5 * cell} ${5 * cell}`} className="h-auto w-44" role="img" aria-label="Cuadrícula con la trayectoria">
            {Array.from({ length: 25 }, (_, k) => (
              <rect key={k} x={(k % 5) * cell + 1} y={Math.floor(k / 5) * cell + 1} width={cell - 2} height={cell - 2} rx={4} fill="var(--viz-grid)" />
            ))}
            <rect x={4 * cell + 1} y={1} width={cell - 2} height={cell - 2} rx={4} fill="var(--viz-c)" opacity={0.6} />
            <polyline points={path.map(([r, c]) => `${c * cell + cell / 2},${r * cell + cell / 2}`).join(' ')} fill="none" stroke="var(--viz-a)" strokeWidth={3} />
            <circle cx={cell / 2} cy={4 * cell + cell / 2} r={7} fill="var(--viz-a)" />
          </svg>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <tbody className="font-mono">
                <tr>
                  <td className="pr-2 text-slate-500">t</td>
                  {actions.map((_, t) => <td key={t} className="px-1.5 text-center">{t}</td>)}
                </tr>
                <tr>
                  <td className="pr-2 text-slate-500">a</td>
                  {actions.map((a, t) => <td key={t} className="px-1.5 text-center">{a}</td>)}
                </tr>
                <tr>
                  <td className="pr-2 text-slate-500">r</td>
                  {rewards.map((r, t) => <td key={t} className="px-1.5 text-center">{r}</td>)}
                </tr>
                <tr>
                  <td className="pr-2 text-slate-500">G (γ)</td>
                  {G.map((g, t) => <td key={t} className="px-1.5 text-center">{g.toFixed(1)}</td>)}
                </tr>
                <tr className="text-brand-700 dark:text-brand-100">
                  <td className="pr-2">R̂ (DT)</td>
                  {rtg.map((g, t) => <td key={t} className="px-1.5 text-center">{g}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }
      side={
        <>
          <Slider label="γ" value={gamma} min={0.5} max={1} step={0.05} onChange={setGamma} />
          <Slider label="Retorno objetivo" value={target} min={-5} max={10} step={1} onChange={setTarget} />
          <TokenChips
            tokens={actions.slice(0, 3).flatMap((a, t) => [`R̂=${rtg[t]}`, `s${t}`, a])}
            tone={(i) => (['d', 'a', 'c'] as const)[i % 3]}
          />
          <p className="text-xs text-slate-500">
            Decision Transformer lee la secuencia (R̂, s, a, R̂, s, a, …) con atención causal y predice la acción. Al desplegarlo se le da el
            retorno que se desea (R̂₀) y se le resta cada recompensa recibida. Con γ = 1, el retorno de la trayectoria es 3.
          </p>
        </>
      }
    />
  )
}

/** Error acumulado al imaginar con un modelo del mundo imperfecto. */
export function WorldModelRollout() {
  const [err, setErr] = useState(0.05)
  const [H, setH] = useState(30)
  const truth: Vec2[] = []
  const model: Vec2[] = []
  let s: Vec2 = [2, 0]
  let m: Vec2 = [2, 0]
  const step = (p: Vec2, e: number): Vec2 => {
    const a = 0.2 + e
    return [0.985 * (p[0] * Math.cos(a) - p[1] * Math.sin(a)), 0.985 * (p[0] * Math.sin(a) + p[1] * Math.cos(a))]
  }
  for (let t = 0; t <= H; t++) {
    truth.push(s)
    model.push(m)
    s = step(s, 0)
    m = step(m, err)
  }
  const gap = truth.map((p, i) => Math.hypot(p[0] - model[i][0], p[1] - model[i][1]))
  return (
    <VizLayout
      plot={
        <div className="grid gap-3 sm:grid-cols-2">
          <Plane xRange={[-2.5, 2.5]} yRange={[-2.5, 2.5]}>
            <Polyline points={truth} color="a" />
            <Polyline points={model} color="b" dashed />
          </Plane>
          <div>
            <LineChart series={[{ y: gap, color: 'b' }]} yRange={[0, 4]} height={200} xLabel="pasos imaginados" />
            <Legend items={[{ label: 'dinámica real', color: 'a' }, { label: 'imaginada por el modelo', color: 'b', dashed: true }]} />
          </div>
        </div>
      }
      side={
        <>
          <Slider label="Error del modelo" value={err} min={0} max={0.2} step={0.01} onChange={setErr} />
          <Slider label="Horizonte H" value={H} min={5} max={60} step={5} onChange={setH} />
          <Readout items={[`\\text{desvío final} = ${gap[gap.length - 1].toFixed(2)}`]} />
          <p className="text-xs text-slate-500">Un pequeño error por paso se acumula al encadenar predicciones. Por eso los modelos del mundo imaginan horizontes cortos (≈ 15 pasos) y vuelven a anclarse en observaciones reales.</p>
        </>
      }
    />
  )
}

// ── Razonamiento ───────────────────────────────────────────────────────────

/** Cómputo en test: pass@N, votación por mayoría y las ventajas de GRPO. */
export function TestTimeScaling() {
  const [p, setP] = useState(0.3)
  const [mode, setMode] = useState<'escala' | 'grpo'>('escala')
  const Ns = [1, 2, 4, 8, 16, 32, 64]
  const passAt = (n: number) => 1 - (1 - p) ** n
  // Votación: la respuesta correcta tiene prob. p; las incorrectas se reparten entre 4 opciones
  const majority = (n: number) => {
    const r = rng(1)
    let ok = 0
    const trials = 600
    for (let k = 0; k < trials; k++) {
      const votes = [0, 0, 0, 0, 0]
      for (let i = 0; i < n; i++) votes[r.next() < p ? 0 : 1 + Math.floor(r.next() * 4)]++
      const max = Math.max(...votes)
      if (votes[0] === max && votes.filter((v) => v === max).length === 1) ok++
    }
    return ok / trials
  }
  const [rewards, setRewards] = useState([1, 0, 0, 1, 0, 0, 0, 1])
  const adv = groupAdvantages(rewards)
  return (
    <VizLayout
      plot={
        mode === 'escala' ? (
          <>
            <LineChart
              series={[
                { x: Ns.map(Math.log2), y: Ns.map(passAt), color: 'c', dots: true },
                { x: Ns.map(Math.log2), y: Ns.map(majority), color: 'a', dots: true },
              ]}
              yRange={[0, 1]}
              xLabel="log₂ N (muestras)"
              height={220}
            />
            <Legend items={[{ label: 'pass@N (con verificador perfecto)', color: 'c' }, { label: 'votación por mayoría', color: 'a' }]} />
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {rewards.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRewards(rewards.map((v, j) => (j === i ? 1 - v : v)))}
                  className={`rounded px-2 py-1 font-mono text-xs ${r ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  o{i + 1}: {r ? '✓' : '✗'}
                </button>
              ))}
            </div>
            <Bars values={adv} labels={rewards.map((_, i) => `A(o${i + 1})`)} signed max={2.7} />
          </div>
        )
      }
      side={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'escala', label: 'Escalar en test' }, { value: 'grpo', label: 'Ventajas GRPO' }]} />
          {mode === 'escala' ? (
            <>
              <Slider label="p (acierto)" value={p} min={0.05} max={0.9} step={0.05} onChange={setP} />
              <p className="text-xs text-slate-500">
                Muestrear N respuestas ayuda si se puede verificar cuál es correcta (pass@N). Sin verificador, la votación solo ayuda si la
                respuesta correcta es la más probable: prueba p = 0.15.
              </p>
            </>
          ) : (
            <>
              <Readout items={[`\\bar r = ${(rewards.reduce((a, b) => a + b, 0) / rewards.length).toFixed(3)}`]} />
              <p className="text-xs text-slate-500">
                Pulsa las respuestas para marcarlas como correctas o no. GRPO no necesita un crítico: la ventaja de cada respuesta es su
                recompensa normalizada dentro del grupo. Si todas aciertan (o fallan), las ventajas son 0 y no hay señal.
              </p>
            </>
          )}
        </>
      }
    />
  )
}

/** Selección UCT en la raíz de un MCTS: explotar lo que va bien o explorar lo poco visitado. */
export function UCTViz() {
  const [c, setC] = useState(1.4)
  const children = [
    { name: 'idea A', w: 6, n: 10 },
    { name: 'idea B', w: 3, n: 4 },
    { name: 'idea C', w: 1, n: 1 },
    { name: 'idea D', w: 0, n: 0 },
  ]
  const N = children.reduce((a, b) => a + b.n, 0)
  const scores = children.map((ch) => uct(ch.w, ch.n, N, c))
  const finite = scores.map((s) => (Number.isFinite(s) ? s : 3))
  const best = scores.indexOf(Math.max(...scores))
  return (
    <VizLayout
      plot={
        <div className="space-y-2">
          <Bars values={finite} labels={children.map((ch) => ch.name)} highlight={best} max={3} />
          <table className="text-xs">
            <tbody className="font-mono">
              {children.map((ch, i) => (
                <tr key={ch.name} className={i === best ? 'font-semibold text-emerald-600' : ''}>
                  <td className="pr-3">{ch.name}</td>
                  <td className="pr-3">Q/N = {ch.n ? (ch.w / ch.n).toFixed(2) : '—'}</td>
                  <td>N = {ch.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      side={
        <>
          <Slider label="c (exploración)" value={c} min={0} max={3} step={0.1} onChange={setC} />
          <Readout items={[`\\text{UCT} = \\frac{Q}{N} + c\\sqrt{\\frac{\\ln N_{padre}}{N}}`, `N_{padre} = ${N}`]} />
          <p className="text-xs text-slate-500">Un hijo sin visitar tiene UCT infinito (barra recortada): siempre se explora primero. Con c = 0 se elige siempre la mejor media.</p>
        </>
      }
    />
  )
}

// ── Agentes ────────────────────────────────────────────────────────────────

const TRACE = [
  { kind: 'Usuario', text: '¿Cuánto costaría servir 2 M de tokens diarios con el modelo X a 0,40 $/M de entrada y 1,60 $/M de salida, si la salida es el 25 %?', tokens: 40 },
  { kind: 'Pensamiento', text: 'Necesito separar tokens de entrada y de salida y multiplicar por sus precios. Uso la calculadora.', tokens: 30 },
  { kind: 'Acción', text: 'calculadora("1.5 * 0.40 + 0.5 * 1.60")', tokens: 20 },
  { kind: 'Observación', text: '1.4', tokens: 5 },
  { kind: 'Pensamiento', text: 'Son 1,40 $ al día. Para el mes, multiplico por 30.', tokens: 18 },
  { kind: 'Acción', text: 'calculadora("1.4 * 30")', tokens: 12 },
  { kind: 'Observación', text: '42.0', tokens: 4 },
  { kind: 'Respuesta', text: 'Unos 1,40 $ al día (≈ 42 $ al mes): 1,5 M de entrada a 0,40 $/M y 0,5 M de salida a 1,60 $/M.', tokens: 45 },
]

/** Traza paso a paso de un agente ReAct y el crecimiento del contexto. */
export function AgentTrace() {
  const [k, setK] = useState(1)
  const shown = TRACE.slice(0, k)
  const system = 350
  const ctx = system + shown.reduce((a, s) => a + s.tokens, 0)
  const tone: Record<string, string> = {
    Usuario: 'border-slate-400',
    Pensamiento: 'border-sky-500',
    Acción: 'border-amber-500',
    Observación: 'border-emerald-500',
    Respuesta: 'border-violet-500',
  }
  return (
    <VizLayout
      plot={
        <ol className="space-y-1.5 text-sm">
          {shown.map((s, i) => (
            <li key={i} className={`rounded border-l-4 bg-slate-50 px-3 py-1.5 dark:bg-slate-900 ${tone[s.kind]}`}>
              <span className="mr-2 text-xs font-semibold uppercase text-slate-500">{s.kind}</span>
              <span className={s.kind === 'Acción' ? 'font-mono text-xs' : ''}>{s.text}</span>
            </li>
          ))}
        </ol>
      }
      side={
        <>
          <Slider label="Paso" value={k} min={1} max={TRACE.length} step={1} onChange={setK} />
          <Readout items={[`\\text{contexto} \\approx ${ctx}\\text{ tokens}`, `\\text{llamadas al modelo} = ${shown.filter((s) => s.kind === 'Pensamiento' || s.kind === 'Respuesta').length}`]} />
          <p className="text-xs text-slate-500">
            Cada vuelta del bucle (pensar → actuar → observar) añade texto al contexto, incluidas las descripciones de las herramientas del
            mensaje de sistema (~{system} tokens). Gestionar ese contexto es la mitad del diseño de un agente.
          </p>
        </>
      }
    />
  )
}

// ── Optimización ───────────────────────────────────────────────────────────

/** Muon: la ortogonalización de Newton–Schulz convierte la elipse de una actualización en (casi) un círculo. */
export function MuonViz() {
  const [steps, setSteps] = useState(0)
  const [skew, setSkew] = useState(4)
  const G = [
    [skew, 1],
    [0.5, 0.6],
  ]
  const X = steps === 0 ? G.map((r) => r.map((v) => v / Math.hypot(...G.flat()))) : newtonSchulz(G, steps)
  const circle = Array.from({ length: 65 }, (_, i) => [Math.cos((i / 64) * 2 * Math.PI), Math.sin((i / 64) * 2 * Math.PI)] as Vec2)
  const img = circle.map(([a, b]) => [X[0][0] * a + X[0][1] * b, X[1][0] * a + X[1][1] * b] as Vec2)
  const XXt = matMul(X, transpose(X))
  return (
    <VizLayout
      plot={
        <Plane xRange={[-1.6, 1.6]} yRange={[-1.6, 1.6]} grid={0.5}>
          <Polyline points={circle} color="muted" dashed />
          <Polyline points={img} color="c" width={2.5} />
          <Arrow to={[X[0][0], X[1][0]]} color="a" />
          <Arrow to={[X[0][1], X[1][1]]} color="b" />
        </Plane>
      }
      side={
        <>
          <Slider label="Iteraciones N–S" value={steps} min={0} max={8} step={1} onChange={setSteps} />
          <Slider label="Anisotropía" value={skew} min={1} max={10} step={0.5} onChange={setSkew} />
          <Heatmap values={XXt} cell={46} showValues diverging max={1.2} ariaLabel="X Xᵀ" />
          <p className="text-xs text-slate-500">
            X·Xᵀ se acerca a la identidad: todas las direcciones de la actualización pasan a tener el mismo tamaño. Así una dirección
            dominante del gradiente no ahoga a las demás.
          </p>
        </>
      }
    />
  )
}

// ── Despliegue ─────────────────────────────────────────────────────────────

/** Cuantización simétrica de unos pesos con un valor atípico: por tensor o por bloques. */
export function QuantizationViz() {
  const [bits, setBits] = useState(4)
  const [outlier, setOutlier] = useState(8)
  const [mode, setMode] = useState<'tensor' | 'bloque'>('tensor')
  const w = useMemo(() => {
    const r = rng(12)
    return Array.from({ length: 64 }, () => r.normal() * 0.5)
  }, [])
  const x = w.map((v, i) => (i === 17 ? outlier * 0.5 : v))
  const block = 16
  const deq =
    mode === 'tensor'
      ? quantizeSymmetric(x, bits).deq
      : Array.from({ length: x.length / block }, (_, b) => quantizeSymmetric(x.slice(b * block, (b + 1) * block), bits).deq).flat()
  const mse = x.reduce((a, v, i) => a + (v - deq[i]) ** 2, 0) / x.length
  const levels = 2 ** bits - 1
  return (
    <VizLayout
      plot={
        <>
          <LineChart
            series={[
              { y: x, color: 'a', dots: true, noLine: true },
              { y: deq, color: 'b', dots: true, noLine: true },
            ]}
            height={220}
            xLabel="índice del peso"
            bands={mode === 'bloque' ? [[0, 15, 'c'], [32, 47, 'c']] : undefined}
          />
          <Legend items={[{ label: 'peso original', color: 'a' }, { label: 'cuantizado', color: 'b' }]} />
        </>
      }
      side={
        <>
          <Segmented value={String(bits)} onChange={(v) => setBits(Number(v))} options={[{ value: '8', label: 'INT8' }, { value: '4', label: 'INT4' }, { value: '3', label: 'INT3' }, { value: '2', label: 'INT2' }]} />
          <Slider label="Valor atípico (σ)" value={outlier} min={1} max={20} step={1} onChange={setOutlier} />
          <Segmented value={mode} onChange={setMode} options={[{ value: 'tensor', label: 'Por tensor' }, { value: 'bloque', label: 'Por bloques de 16' }]} />
          <Readout items={[`${levels}\\text{ niveles}`, `\\text{ECM} = ${mse.toExponential(2)}`]} />
          <p className="text-xs text-slate-500">
            La escala se fija con el máximo absoluto: un solo atípico la agranda y casi todos los pesos caen en el nivel 0. Cuantizar por
            bloques (como GPTQ, AWQ o los formatos de llama.cpp) limita el daño al bloque del atípico.
          </p>
        </>
      }
    />
  )
}

/** LoRA: parámetros entrenables frente al ajuste completo. */
export function LoRAViz() {
  const [d, setD] = useState(4096)
  const [r, setR] = useState(8)
  const full = d * d
  const lora = loraParams(d, d, r)
  return (
    <VizLayout
      plot={
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="W más B por A">
          <rect x={10} y={20} width={120} height={120} fill="var(--viz-a)" opacity={0.25} stroke="var(--viz-a)" />
          <text x={70} y={85} textAnchor="middle" fontSize={14} fill="var(--viz-text)">W (congelada)</text>
          <text x={150} y={85} fontSize={20} fill="var(--viz-text)">+</text>
          <rect x={180} y={20} width={Math.max(4, (r / 64) * 120)} height={120} fill="var(--viz-c)" opacity={0.7} />
          <text x={186 + Math.max(4, (r / 64) * 120)} y={150} fontSize={12} fill="var(--viz-text)">B ({d}×{r})</text>
          <rect x={220 + Math.max(4, (r / 64) * 120)} y={20} width={120} height={Math.max(4, (r / 64) * 120)} fill="var(--viz-d)" opacity={0.7} />
          <text x={220 + Math.max(4, (r / 64) * 120)} y={14} fontSize={12} fill="var(--viz-text)">A ({r}×{d})</text>
        </svg>
      }
      side={
        <>
          <Slider label="d" value={d} min={512} max={8192} step={512} onChange={setD} />
          <Slider label="Rango r" value={r} min={1} max={64} step={1} onChange={setR} />
          <Readout items={[`d^2 = ${full.toLocaleString('es')}`, `r(2d) = ${lora.toLocaleString('es')}`, `\\text{fracción} = ${((100 * lora) / full).toFixed(2)}\\%`]} />
        </>
      }
    />
  )
}

/** Coste por millón de tokens: API frente a GPU propia según la utilización. */
export function CostCompare() {
  const [gpuHour, setGpuHour] = useState(2.5)
  const [tps, setTps] = useState(1500)
  const [util, setUtil] = useState(40)
  const [api, setApi] = useState(0.6)
  const selfHosted = gpuHour / ((tps * 3600 * util) / 100 / 1e6)
  return (
    <VizLayout
      plot={<Bars values={[api, selfHosted]} labels={['API', 'GPU propia']} digits={2} color="d" />}
      side={
        <>
          <Slider label="$/h GPU" value={gpuHour} min={0.5} max={10} step={0.5} onChange={setGpuHour} />
          <Slider label="tokens/s" value={tps} min={100} max={10000} step={100} onChange={setTps} />
          <Slider label="Utilización %" value={util} min={5} max={100} step={5} onChange={setUtil} />
          <Slider label="API $/M" value={api} min={0.05} max={15} step={0.05} onChange={setApi} />
          <Readout items={[`\\text{coste propio} = \\frac{\\$/h}{\\text{tokens/h}\\cdot u}\\cdot 10^6 = ${selfHosted.toFixed(2)}\\,\\$/\\text{M}`]} />
          <p className="text-xs text-slate-500">Una GPU propia solo sale a cuenta con mucha utilización sostenida (lotes grandes y tráfico constante). Con tráfico esporádico, la API suele ganar.</p>
        </>
      }
    />
  )
}

// ── Sistemas ───────────────────────────────────────────────────────────────

/** Fiabilidad de una cadena de pasos con y sin verificación + reintento. */
export function ReliabilityViz() {
  const [p, setP] = useState(0.95)
  const [retries, setRetries] = useState(1)
  const [detect, setDetect] = useState(0.8)
  const K = 30
  const plain = Array.from({ length: K }, (_, k) => p ** (k + 1))
  // Con verificación: un fallo se detecta con prob. `detect` y se reintenta (hasta `retries` veces)
  const stepOk = (() => {
    let ok = p
    let fail = 1 - p
    for (let r = 0; r < retries; r++) {
      const caught = fail * detect
      ok += caught * p
      fail = caught * (1 - p)
    }
    return ok
  })()
  const verified = Array.from({ length: K }, (_, k) => stepOk ** (k + 1))
  return (
    <VizLayout
      plot={
        <>
          <LineChart
            series={[
              { x: plain.map((_, k) => k + 1), y: plain, color: 'b' },
              { x: plain.map((_, k) => k + 1), y: verified, color: 'c' },
            ]}
            yRange={[0, 1]}
            xLabel="pasos encadenados"
            height={220}
          />
          <Legend items={[{ label: 'sin verificación: pᵏ', color: 'b' }, { label: 'con verificación y reintento', color: 'c' }]} />
        </>
      }
      side={
        <>
          <Slider label="p por paso" value={p} min={0.8} max={0.999} step={0.005} onChange={setP} />
          <Slider label="Reintentos" value={retries} min={0} max={3} step={1} onChange={setRetries} />
          <Slider label="Detección" value={detect} min={0} max={1} step={0.05} onChange={setDetect} />
          <Readout items={[`p^{10} = ${(p ** 10).toFixed(3)}`, `\\text{con verificación: } ${(stepOk ** 10).toFixed(3)}`]} />
        </>
      }
    />
  )
}
