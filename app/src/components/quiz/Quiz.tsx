import { useState } from 'react'
import { PASS_SCORE, recordQuiz, useProgress } from '../../lib/progress'
import { useCurrentStage } from '../lesson/stageContext'
import { RichText } from '../lesson/Tex'
import { isCorrect, score, type Question, type Response } from './quizEngine'

interface Props {
  questions: Question[]
}

export function Quiz({ questions }: Props) {
  const stageSlug = useCurrentStage()
  const [responses, setResponses] = useState<Response[]>(() => questions.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const progress = useProgress()[stageSlug]

  const setResponse = (i: number, r: Response) =>
    setResponses((rs) => rs.map((x, j) => (j === i ? r : x)))

  const result = score(questions, responses)
  const answered = responses.filter((r) => r !== null && r !== '').length

  function submit() {
    setSubmitted(true)
    recordQuiz(stageSlug, result)
  }

  function retry() {
    setSubmitted(false)
    setResponses(questions.map(() => null))
  }

  return (
    <div className="not-prose my-6 space-y-4">
      {progress && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mejor puntaje: {Math.round(progress.bestScore * 100)}%{' '}
          {progress.completed ? '· Módulo completado ✓' : `· Necesitas ${PASS_SCORE * 100}% para completarlo`}
        </p>
      )}
      <ol className="space-y-4">
        {questions.map((q, i) => {
          const ok = submitted && isCorrect(q, responses[i])
          return (
            <li
              key={i}
              className={`rounded-xl border p-4 ${
                !submitted
                  ? 'border-slate-200 dark:border-slate-800'
                  : ok
                    ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-red-300 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30'
              }`}
            >
              <p className="mb-3 font-medium">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                <RichText text={q.prompt} />
              </p>
              <QuestionInput q={q} value={responses[i]} disabled={submitted} onChange={(r) => setResponse(i, r)} />
              {submitted && (
                <div className="mt-3 text-sm">
                  <p className={`font-semibold ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {ok ? 'Correcto' : `Incorrecto. Respuesta: `}
                    {!ok && <CorrectAnswer q={q} />}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    <RichText text={q.explanation} />
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <div className="flex items-center gap-4">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={answered === 0}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Comprobar respuestas ({answered}/{questions.length})
          </button>
        ) : (
          <>
            <p className="font-semibold">
              Resultado: {Math.round(result * 100)}%{' '}
              {result >= PASS_SCORE ? '🎉 ¡Módulo superado!' : '— repasa las explicaciones e inténtalo de nuevo.'}
            </p>
            <button
              type="button"
              onClick={retry}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function QuestionInput({
  q,
  value,
  disabled,
  onChange,
}: {
  q: Question
  value: Response
  disabled: boolean
  onChange: (r: Response) => void
}) {
  const inputCls =
    'rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 disabled:opacity-70'
  if (q.type === 'choice') {
    return (
      <div className="grid gap-2">
        {q.options.map((opt, j) => (
          <label
            key={j}
            className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              value === j ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-800'
            } ${disabled ? 'cursor-default' : 'hover:border-brand-500'}`}
          >
            <input
              type="radio"
              className="mt-1"
              checked={value === j}
              disabled={disabled}
              onChange={() => onChange(j)}
            />
            <span>
              <RichText text={opt} />
            </span>
          </label>
        ))}
      </div>
    )
  }
  if (q.type === 'numeric') {
    return (
      <input
        type="text"
        inputMode="decimal"
        placeholder="Tu respuesta (ej. 3.74, 3/4, √2)"
        className={`${inputCls} w-64`}
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  const rows = q.answer.length
  const cols = q.answer[0].length
  const grid = Array.isArray(value) ? value : Array.from({ length: rows }, () => Array(cols).fill('') as string[])
  return (
    <div className="inline-flex items-stretch gap-1">
      <span className="w-2 rounded-l border-y-2 border-l-2 border-slate-400" />
      <div className="grid gap-1 py-1" style={{ gridTemplateColumns: `repeat(${cols}, 4rem)` }}>
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              aria-label={`Fila ${i + 1}, columna ${j + 1}`}
              className={`${inputCls} w-16 text-center`}
              value={cell}
              disabled={disabled}
              onChange={(e) => onChange(grid.map((r, a) => r.map((c, b) => (a === i && b === j ? e.target.value : c))))}
            />
          )),
        )}
      </div>
      <span className="w-2 rounded-r border-y-2 border-r-2 border-slate-400" />
    </div>
  )
}

function CorrectAnswer({ q }: { q: Question }) {
  if (q.type === 'choice') return <RichText text={q.options[q.answer]} />
  if (q.type === 'numeric') return <span className="font-mono">{q.answer}</span>
  return <span className="font-mono">[{q.answer.map((r) => `[${r.join(', ')}]`).join(', ')}]</span>
}
