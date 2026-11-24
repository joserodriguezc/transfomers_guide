import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué diferencia a MQA de MHA?',
    options: [
      'MQA tiene una sola cabeza de query',
      'En MQA todas las cabezas de query comparten una única key y una única value',
      'MQA no usa softmax',
      'MQA solo funciona en encoders',
    ],
    answer: 1,
    explanation: 'Se mantienen $h$ queries, pero $K$ y $V$ se reducen a una cabeza: la KV cache se divide por $h$.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo con 64 cabezas de query usa GQA con 8 grupos. ¿Por cuánto se divide la KV cache respecto a MHA?',
    answer: 8,
    tolerance: 0,
    explanation: 'Pasa de 64 a 8 cabezas KV: $64/8 = 8$ veces menos memoria.',
  },
  {
    type: 'numeric',
    prompt: 'KV cache en GiB: 40 capas, 8 cabezas KV, $d_{head} = 128$, 4096 tokens, lote 1, FP16 (2 bytes). Usa $2\\cdot L\\cdot g\\cdot d\\cdot T\\cdot b$ y divide por $2^{30}$.',
    answer: 0.625,
    tolerance: 0.001,
    explanation: '$2\\cdot40\\cdot8\\cdot128\\cdot4096\\cdot2 = 671\\,088\\,640$ bytes $= 0.625$ GiB.',
  },
  {
    type: 'choice',
    prompt: '¿Qué reduce FlashAttention?',
    options: [
      'El número de operaciones de punto flotante a $O(N)$',
      'Los accesos a la memoria principal de la GPU: no materializa la matriz $N\\times N$, y el resultado es exacto',
      'La precisión de los resultados',
      'El número de cabezas',
    ],
    answer: 1,
    explanation: 'Las operaciones siguen siendo $O(N^2d)$. Lo que cae a $O(N)$ es la memoria, y con ella el tráfico HBM↔SRAM, que es el verdadero cuello de botella.',
  },
  {
    type: 'matrix',
    prompt: 'Softmax en línea. Tras un primer bloque: $m = 2$, $\\ell = 1.5$. Llega un bloque con un único logit $x = 3$. Escribe la fila $(m, \\ell)$ actualizada (redondea $\\ell$ a 3 decimales).',
    answer: [[3, 1.552]],
    tolerance: 0.002,
    explanation: '$m = \\max(2, 3) = 3$. $\\ell = 1.5\\,e^{2-3} + e^{3-3} = 1.5\\cdot0.3679 + 1 \\approx 1.552$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué problema resuelve PagedAttention?',
    options: [
      'El coste cuadrático de la atención',
      'La memoria desperdiciada al reservar para cada petición un bloque contiguo del tamaño máximo',
      'La pérdida de precisión en FP8',
      'La falta de posiciones relativas',
    ],
    answer: 1,
    explanation: 'Reserva la KV cache en páginas pequeñas bajo demanda (como la memoria virtual) y permite compartir prefijos entre peticiones.',
  },
  {
    type: 'numeric',
    prompt: 'Con ventana deslizante $w = 4096$ y 32 capas, ¿hasta cuántas posiciones atrás puede llegar, como máximo, la información a la última capa?',
    answer: 131072,
    tolerance: 0,
    explanation: 'Cada capa amplía el campo receptivo en $w$: $32\\cdot4096 = 131\\,072$ posiciones.',
  },
]
