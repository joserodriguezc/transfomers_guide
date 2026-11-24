import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'matrix',
    prompt: 'Aplica LayerNorm (con $\\gamma = 1$, $\\beta = 0$, $\\varepsilon = 0$) a $x = (2, 4, 6)$. Escribe el resultado como una fila.',
    answer: [[-1.2247, 0, 1.2247]],
    tolerance: 0.01,
    explanation: '$\\mu = 4$, desviaciones $(-2, 0, 2)$, $\\sigma^2 = 8/3$, $\\sigma \\approx 1.633$. Resultado $(-1.225, 0, 1.225)$.',
  },
  {
    type: 'numeric',
    prompt: 'RMSNorm (sin $\\gamma$ ni $\\varepsilon$) de $x = (3, 4)$: ¿cuánto vale la primera componente?',
    answer: 0.8485,
    tolerance: 0.005,
    explanation: 'Media de cuadrados $= (9 + 16)/2 = 12.5$; raíz $\\approx 3.536$. $3/3.536 \\approx 0.849$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué diferencia hay entre pre-norm y post-norm?',
    options: [
      'Pre-norm normaliza la entrada de cada subcapa y deja el flujo residual sin normalizar; post-norm normaliza después de sumar el residual',
      'Pre-norm usa RMSNorm y post-norm LayerNorm',
      'Pre-norm no tiene conexiones residuales',
      'No hay diferencia práctica',
    ],
    answer: 0,
    explanation: 'Pre-norm: $x + f(\\operatorname{Norm}(x))$. Post-norm: $\\operatorname{Norm}(x + f(x))$. Pre-norm entrena de forma mucho más estable en modelos profundos.',
  },
  {
    type: 'numeric',
    prompt: 'Una FFN clásica tiene $d = 1024$ y $d_{ff} = 4096$. ¿Cuántos millones de parámetros tiene (sin sesgos)?',
    answer: 8.388608,
    tolerance: 0.01,
    explanation: '$2\\,d\\,d_{ff} = 2 \\cdot 1024 \\cdot 4096 = 8\\,388\\,608$. Es el doble que la atención ($4d^2 \\approx 4.19$ M).',
  },
  {
    type: 'choice',
    prompt: '¿Qué significa que la FFN se aplica «por posición»?',
    options: [
      'Que cada posición tiene sus propios pesos',
      'Que la misma red, con los mismos pesos, se aplica a cada token de forma independiente',
      'Que solo se aplica al último token',
      'Que depende de la codificación posicional',
    ],
    answer: 1,
    explanation: 'La FFN no mezcla tokens: esa es tarea de la atención. Procesar un token solo da el mismo resultado que dentro del lote.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué ayudan las conexiones residuales a entrenar modelos profundos?',
    options: [
      'Porque reducen el número de parámetros',
      'Porque cada bloque solo suma una corrección: la señal y el gradiente tienen un camino directo de identidad a través de todas las capas',
      'Porque sustituyen a la atención',
      'Porque normalizan las activaciones',
    ],
    answer: 1,
    explanation: '$\\partial (x + f(x))/\\partial x = I + \\partial f/\\partial x$: aunque $f$ tenga gradientes pequeños, el término $I$ mantiene el flujo.',
  },
  {
    type: 'choice',
    prompt: 'En un modelo tipo Llama 3 8B, ¿qué parte de cada bloque tiene más parámetros?',
    options: ['La atención', 'La FFN (SwiGLU)', 'Las normalizaciones', 'Están igualadas'],
    answer: 1,
    explanation: 'Con $d = 4096$ y $d_{ff} = 14\\,336$, la FFN tiene $3\\,d\\,d_{ff} \\approx 176$ M frente a $\\approx 42$ M de la atención (con GQA).',
  },
]
