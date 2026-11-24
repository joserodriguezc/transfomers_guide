import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: 'En la atención, ¿qué papel cumple la key $k_j$?',
    options: [
      'Es el contenido que se entrega al token que pregunta',
      'Es lo que se compara con la query para decidir cuánta atención recibe el token $j$',
      'Es la posición del token $j$',
      'Es el resultado final de la capa',
    ],
    answer: 1,
    explanation: 'La query se compara con cada key ($q_i\\cdot k_j$); el contenido que se mezcla es el value $v_j$.',
  },
  {
    type: 'numeric',
    prompt: 'Con $Q$ de forma $10\\times64$ y $K$ de forma $10\\times64$, ¿cuántos elementos tiene la matriz $QK^T$?',
    answer: 100,
    tolerance: 0,
    explanation: '$QK^T$ es $10\\times10$: una puntuación por cada par (query, key).',
  },
  {
    type: 'matrix',
    prompt: 'Calcula $\\operatorname{softmax}(0, 0, \\ln 2)$ como una fila de tres números.',
    answer: [[0.25, 0.25, 0.5]],
    tolerance: 0.005,
    explanation: 'Exponenciales: $1, 1, 2$; suma 4. Pesos: $1/4, 1/4, 2/4$.',
  },
  {
    type: 'numeric',
    prompt: 'Si las componentes de $q$ y $k$ son independientes con media 0 y varianza 1, y $d_k = 256$, ¿cuál es la desviación típica de $q\\cdot k$ sin escalar?',
    answer: 16,
    tolerance: 0.01,
    explanation: '$\\operatorname{Var}(q\\cdot k) = d_k = 256$, desviación típica $\\sqrt{256} = 16$. Dividir por $\\sqrt{d_k} = 16$ la devuelve a 1.',
  },
  {
    type: 'choice',
    prompt: '¿Qué ocurre con la softmax si sus entradas tienen una varianza muy grande?',
    options: [
      'Se vuelve uniforme',
      'Se satura: casi todo el peso va a un token y los gradientes se hacen casi cero',
      'Deja de sumar 1',
      'Da valores negativos',
    ],
    answer: 1,
    explanation: 'Con diferencias grandes entre logits, $e^{z}$ del mayor domina. En esa zona la derivada de la softmax es casi nula y el entrenamiento se atasca.',
  },
  {
    type: 'matrix',
    prompt: 'Pesos de atención de un token: $(0.5, 0.5, 0)$. Values: $v_1 = (2, 0)$, $v_2 = (0, 4)$, $v_3 = (9, 9)$. ¿Cuál es su salida (fila de 2 números)?',
    answer: [[1, 2]],
    tolerance: 0.001,
    explanation: '$0.5\\,(2,0) + 0.5\\,(0,4) + 0\\,(9,9) = (1, 2)$. Un value con peso 0 no aporta nada.',
  },
  {
    type: 'choice',
    prompt: 'Si se duplica la longitud de la secuencia, el coste de calcular $QK^T$…',
    options: ['se duplica', 'se cuadruplica', 'no cambia', 'se reduce a la mitad'],
    answer: 1,
    explanation: 'El coste es $O(n^2 d_k)$: $(2n)^2 = 4n^2$.',
  },
  {
    type: 'choice',
    prompt: 'Restar el máximo de los logits antes de la softmax…',
    options: ['cambia las probabilidades', 'no cambia las probabilidades y evita desbordamientos de $e^x$', 'hace que sumen 0', 'equivale a dividir por $\\sqrt{d_k}$'],
    answer: 1,
    explanation: '$e^{z_j - c}/\\sum_l e^{z_l - c} = e^{z_j}/\\sum_l e^{z_l}$: el factor $e^{-c}$ se cancela.',
  },
]
