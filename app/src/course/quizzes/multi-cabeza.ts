import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Un modelo tiene $d_{model} = 4096$ y 32 cabezas. ¿Cuánto vale $d_k$?',
    answer: 128,
    tolerance: 0,
    explanation: '$d_k = d_{model}/h = 4096/32 = 128$.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántos parámetros (sin sesgos) tiene una capa de atención multi-cabeza con $d_{model} = 512$ y $h = 8$?',
    answer: 1048576,
    tolerance: 0,
    explanation: '$4\\,d_{model}^2 = 4 \\cdot 512^2 = 1\\,048\\,576$. El número de cabezas no influye.',
  },
  {
    type: 'choice',
    prompt: 'Si duplicas el número de cabezas manteniendo $d_{model}$, ¿qué ocurre?',
    options: [
      'Se duplican los parámetros',
      'Cada cabeza trabaja en un subespacio la mitad de grande y los parámetros no cambian',
      'Se duplica la dimensión de salida',
      'La atención deja de ser cuadrática',
    ],
    answer: 1,
    explanation: '$d_k$ se reduce a la mitad; $h\\,d_k = d_{model}$ sigue igual y por tanto también los parámetros.',
  },
  {
    type: 'matrix',
    prompt: 'Con $n = 10$ tokens, $h = 4$ y $d_k = 16$, ¿qué forma tiene el tensor de puntuaciones $QK^T$ de todas las cabezas? Escríbela como una fila (h, n, n).',
    answer: [[4, 10, 10]],
    tolerance: 0,
    explanation: 'Hay una matriz $n\\times n$ por cabeza: $(4, 10, 10)$.',
  },
  {
    type: 'choice',
    prompt: '¿Para qué sirve la matriz $W_O$?',
    options: [
      'Para calcular las queries',
      'Para combinar la información de todas las cabezas concatenadas en un único vector por token',
      'Para normalizar los pesos de atención',
      'Para añadir la posición',
    ],
    answer: 1,
    explanation: 'Sin $W_O$, cada trozo del vector de salida vendría de una sola cabeza; $W_O$ mezcla todos los subespacios.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué varias cabezas pueden representar mejor que una sola cabeza del mismo tamaño total?',
    options: [
      'Porque tienen más parámetros',
      'Porque cada cabeza puede atender a un token distinto; una sola cabeza solo produce una media ponderada por token',
      'Porque eliminan la softmax',
      'Porque cada cabeza ve una parte distinta de la secuencia',
    ],
    answer: 1,
    explanation: 'Todas las cabezas ven toda la secuencia, pero cada una calcula su propia distribución de atención y puede enfocarse en una relación distinta.',
  },
]
