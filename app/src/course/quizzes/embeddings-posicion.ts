import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Un modelo tiene un vocabulario de 32 000 tokens y $d = 4096$. ¿Cuántos millones de parámetros tiene su matriz de embeddings?',
    answer: 131.072,
    tolerance: 0.01,
    explanation: '$N_v \\cdot d = 32\\,000 \\cdot 4096 = 131\\,072\\,000$, unos 131 millones.',
  },
  {
    type: 'choice',
    prompt: 'Buscar el embedding del token 3 en $E$ equivale a…',
    options: ['multiplicar $E$ por 3', 'multiplicar el vector one-hot $e_3$ (transpuesto) por $E$', 'sumar todas las filas de $E$', 'calcular la inversa de $E$'],
    answer: 1,
    explanation: '$e_3^T E$ selecciona la fila 3. Por eso la capa de embeddings es una capa lineal sin sesgo cuya entrada es un one-hot.',
  },
  {
    type: 'numeric',
    prompt: 'Calcula la similitud coseno entre $a = (1, 2, 2)$ y $b = (2, 0, 1)$.',
    answer: 0.596,
    tolerance: 0.005,
    explanation: '$a\\cdot b = 2 + 0 + 2 = 4$, $\\|a\\| = 3$, $\\|b\\| = \\sqrt5$. Coseno $= 4 / (3\\sqrt5) \\approx 0.596$.',
  },
  {
    type: 'matrix',
    prompt: 'Con $d = 2$, la codificación sinusoidal es $PE_p = (\\sin p,\\ \\cos p)$. Escribe $PE_0$ como una fila de dos números.',
    answer: [[0, 1]],
    tolerance: 0.001,
    explanation: '$\\sin 0 = 0$ y $\\cos 0 = 1$. En general, la posición 0 alterna ceros y unos.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuánto vale la norma de la codificación sinusoidal $PE_p$ para $d = 512$ (cualquier posición $p$)?',
    answer: 16,
    tolerance: 0.01,
    explanation: 'Cada uno de los $d/2 = 256$ pares cumple $\\sin^2 + \\cos^2 = 1$: $\\|PE_p\\|^2 = 256$ y $\\|PE_p\\| = 16$.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué necesita el transformer una codificación posicional?',
    options: [
      'Para que los embeddings tengan norma 1',
      'Porque la atención es equivariante a permutaciones: sin ella, el orden de los tokens no afecta al resultado',
      'Para reducir el número de parámetros',
      'Porque la softmax no funciona con secuencias largas',
    ],
    answer: 1,
    explanation: 'Permutar la entrada de la atención solo permuta su salida. Sumar (o aplicar, como en RoPE) información de posición rompe esa simetría.',
  },
  {
    type: 'choice',
    prompt: 'En la codificación sinusoidal, $PE_{p+k} = R_k\\,PE_p$. ¿De qué depende $R_k$?',
    options: ['De $p$ y de $k$', 'Solo de $k$ (la distancia)', 'Solo de $p$', 'De los embeddings de los tokens'],
    answer: 1,
    explanation: 'Cada bloque de $R_k$ es una rotación de ángulo $k\\,\\omega_i$. Por eso las relaciones entre posiciones dependen de su distancia relativa.',
  },
]
