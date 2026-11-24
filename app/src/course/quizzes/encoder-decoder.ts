import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué familia de transformer elegirías para transcribir audio a texto?',
    options: ['Encoder-only', 'Decoder-only', 'Encoder-decoder', 'Ninguna'],
    answer: 2,
    explanation: 'El encoder procesa la señal completa y el decoder genera el texto token a token consultándola con cross-attention: es la arquitectura de Whisper.',
  },
  {
    type: 'matrix',
    prompt: 'Escribe la máscara causal (0 = permitido, 1 = bloqueado) para 3 tokens.',
    answer: [
      [0, 1, 1],
      [0, 0, 1],
      [0, 0, 0],
    ],
    tolerance: 0,
    explanation: 'El token $i$ ve las posiciones $j \\le i$: se bloquea el triángulo superior estricto.',
  },
  {
    type: 'numeric',
    prompt: 'Con máscara causal, ¿cuántos pares (query, key) se calculan realmente para una secuencia de 10 tokens?',
    answer: 55,
    tolerance: 0,
    explanation: '$1 + 2 + \\dots + 10 = 10\\cdot11/2 = 55$ de los 100 posibles.',
  },
  {
    type: 'choice',
    prompt: 'En la cross-attention de un encoder-decoder, ¿de dónde salen las queries?',
    options: ['Del encoder', 'Del decoder', 'De la máscara', 'De la codificación posicional'],
    answer: 1,
    explanation: 'El decoder pregunta (queries) y el encoder aporta keys y values: cada token de salida consulta la entrada completa.',
  },
  {
    type: 'numeric',
    prompt: 'Puntuaciones de la segunda fila: $(2, 2, 7)$. Tras aplicar la máscara causal, ¿cuánto peso recibe la primera posición?',
    answer: 0.5,
    tolerance: 0.001,
    explanation: 'La tercera posición queda a $-\\infty$. $\\operatorname{softmax}(2, 2) = (0.5, 0.5)$.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué entrenar un decoder es mucho más rápido que generar con él?',
    options: [
      'Porque al entrenar se usan GPUs y al generar no',
      'Porque con la máscara causal y teacher forcing todas las posiciones se predicen en una sola pasada; al generar, cada token depende del anterior',
      'Porque al generar no se usa la atención',
      'No es más rápido',
    ],
    answer: 1,
    explanation: 'Durante el entrenamiento la secuencia correcta se conoce entera. Al generar, el token $t+1$ no existe hasta que se elige el $t$.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo asigna probabilidad 0.25 al token correcto en cada una de 4 posiciones. ¿Cuánto vale la pérdida de entropía cruzada media (logaritmo natural)?',
    answer: 1.386,
    tolerance: 0.005,
    explanation: '$-\\log 0.25 = \\log 4 \\approx 1.386$ en cada posición; la media es la misma.',
  },
]
