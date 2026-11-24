import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: '¿Cuántos GB ocupan los pesos de un modelo de 13 mil millones de parámetros cuantizado a 4 bits (sin contar escalas)?',
    answer: 6.5,
    tolerance: 0.01,
    explanation: '$13\\cdot10^9\\cdot0.5$ bytes $= 6.5$ GB (en FP16 serían 26 GB).',
  },
  {
    type: 'choice',
    prompt: '¿Qué limita la velocidad del decode (generar token a token) con lotes pequeños?',
    options: [
      'La capacidad de cálculo de la GPU',
      'El ancho de banda de memoria: en cada paso hay que leer todos los pesos',
      'El tokenizador',
      'La red',
    ],
    answer: 1,
    explanation: 'Con lote 1 se hacen ~2 FLOP por parámetro pero hay que mover todos los bytes de los pesos: la GPU espera a la memoria.',
  },
  {
    type: 'numeric',
    prompt: 'Cuantización simétrica a 8 bits de un tensor cuyo máximo absoluto es 2.54. ¿Cuánto vale la escala $s$?',
    answer: 0.02,
    tolerance: 0.0001,
    explanation: '$s = 2.54/(2^7 - 1) = 2.54/127 = 0.02$.',
  },
  {
    type: 'numeric',
    prompt: 'LoRA con $r = 16$ sobre una matriz de $4096\\times4096$. ¿Cuántos parámetros entrenables añade?',
    answer: 131072,
    tolerance: 0,
    explanation: '$r(d + k) = 16\\cdot(4096 + 4096) = 131\\,072$, un 0.78 % de los 16.8 millones de la matriz.',
  },
  {
    type: 'numeric',
    prompt: 'Una GPU cuesta 3 dólares por hora y genera 2000 tokens/s a plena utilización. ¿Cuál es el coste por 1000 tokens (en dólares)?',
    answer: 0.000417,
    tolerance: 0.00001,
    explanation: '$1000\\cdot3/(2000\\cdot3600) \\approx 0.000417$ dólares, es decir, unos 0.42 dólares por millón de tokens.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué conviene optimizar el p95 o el p99 de latencia en lugar de la media?',
    options: [
      'Porque la media siempre es mayor',
      'Porque la experiencia de los usuarios la definen las peticiones lentas, y la media puede ocultar colas muy largas',
      'Porque es más fácil de calcular',
      'Porque los SLO se definen siempre con la media',
    ],
    answer: 1,
    explanation: 'Un 1–5 % de peticiones muy lentas apenas mueve la media, pero son las que generan quejas y reintentos.',
  },
  {
    type: 'choice',
    prompt: '¿Qué ventaja tiene que $B$ se inicialice a cero en LoRA?',
    options: [
      'Que el entrenamiento es más rápido',
      'Que al principio $BA = 0$ y el modelo adaptado es exactamente el original',
      'Que no hace falta $A$',
      'Que se puede cuantizar',
    ],
    answer: 1,
    explanation: 'El ajuste parte del comportamiento preentrenado y se desvía de él solo lo que los datos justifiquen.',
  },
]
