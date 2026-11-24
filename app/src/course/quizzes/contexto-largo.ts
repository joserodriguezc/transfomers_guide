import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Dónde se aplica RoPE dentro del transformer?',
    options: [
      'Se suma a los embeddings de entrada',
      'Gira las queries y las keys antes de calcular la atención, en cada capa',
      'Se aplica a los values',
      'Se aplica a la salida de la FFN',
    ],
    answer: 1,
    explanation: 'RoPE no toca la entrada ni los values: rota $q$ y $k$ para que su producto dependa de la distancia relativa.',
  },
  {
    type: 'numeric',
    prompt: 'Con RoPE, una query en la posición 7 y una key en la posición 12 dan cierta puntuación. ¿Qué distancia $n - m$ tiene otra pareja con la misma puntuación si la query está en la posición 100?',
    answer: 5,
    tolerance: 0,
    explanation: 'La puntuación solo depende de $n - m = 12 - 7 = 5$; la key debería estar en la posición 105.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo se entrenó con $L = 4096$ y queremos $L\' = 16\\,384$ con interpolación de posiciones. ¿Qué posición «ve» el modelo para el token 10 000?',
    answer: 2500,
    tolerance: 0.5,
    explanation: '$m L / L\' = 10\\,000 \\cdot 4096 / 16\\,384 = 2500$: dentro del rango entrenado.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo asigna probabilidad $1/8$ al token correcto en todas las posiciones. ¿Cuál es su perplejidad?',
    answer: 8,
    tolerance: 0.001,
    explanation: '$\\operatorname{PPL} = \\exp(-\\log(1/8)) = 8$: «duda» entre 8 opciones equiprobables.',
  },
  {
    type: 'choice',
    prompt: '¿Qué desventaja tiene la interpolación de posiciones (PI) pura?',
    options: [
      'Necesita reentrenar el modelo desde cero',
      'Comprime también las frecuencias altas, de modo que los tokens vecinos se distinguen peor',
      'Aumenta la memoria de la KV cache',
      'Solo funciona con codificación sinusoidal',
    ],
    answer: 1,
    explanation: 'Dividir todas las posiciones por $s$ reduce la resolución local. NTK-aware y YaRN dejan las frecuencias altas casi intactas para evitarlo.',
  },
  {
    type: 'numeric',
    prompt: 'La aguja tiene un logit $\\Delta = \\ln 99$ por encima de 9 900 tokens irrelevantes (logit 0). ¿Qué peso de atención recibe?',
    answer: 0.01,
    tolerance: 0.0005,
    explanation: '$e^{\\Delta} = 99$; peso $= 99/(99 + 9900) = 99/9999 \\approx 0.0099$. Con 99 tokens irrelevantes habría sido 0.5.',
  },
  {
    type: 'choice',
    prompt: '¿Qué propiedad tiene la matriz de rotación de RoPE?',
    options: ['Es simétrica', 'Es ortogonal: conserva la norma de los vectores', 'Es singular', 'Tiene todos los elementos positivos'],
    answer: 1,
    explanation: 'Cada bloque es una rotación 2D; $R^TR = I$. Girar no cambia la longitud de $q$ ni de $k$.',
  },
]
