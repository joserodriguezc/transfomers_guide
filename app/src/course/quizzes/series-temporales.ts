import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: 'La ACF de una serie decae muy lentamente desde 1 y sigue siendo alta en el retardo 30. ¿Qué sugiere?',
    options: ['Que es ruido blanco', 'Que tiene tendencia y no es estacionaria', 'Que tiene periodo 30', 'Que está mal calculada'],
    answer: 1,
    explanation: 'Con tendencia, valores lejanos siguen pareciéndose porque comparten el nivel. Diferenciar suele hacer que la ACF caiga rápido.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuánto vale la banda de significación $1.96/\\sqrt{T}$ de la ACF para una serie de $T = 400$ puntos?',
    answer: 0.098,
    tolerance: 0.001,
    explanation: '$1.96/20 = 0.098$. Autocorrelaciones menores en valor absoluto son compatibles con ruido blanco.',
  },
  {
    type: 'matrix',
    prompt: 'Calcula la primera diferencia $\\nabla y_t$ de $y = (3, 5, 4, 8)$ como una fila de 3 números.',
    answer: [[2, -1, 4]],
    tolerance: 0,
    explanation: '$5-3 = 2$, $4-5 = -1$, $8-4 = 4$. La serie diferenciada tiene un elemento menos.',
  },
  {
    type: 'choice',
    prompt: 'La PACF de un proceso es significativa en los retardos 1, 2 y 3 y prácticamente cero después. ¿Qué modelo sugiere?',
    options: ['Media móvil de orden 3', 'Autorregresivo de orden 3', 'Ruido blanco', 'Paseo aleatorio'],
    answer: 1,
    explanation: 'En un AR($p$), la PACF se corta tras el retardo $p$. En un MA($q$) es la ACF la que se corta.',
  },
  {
    type: 'choice',
    prompt: 'Dos series de precios con tendencia tienen correlación 0.95. ¿Qué puedes concluir?',
    options: [
      'Que una causa la otra',
      'Que están cointegradas',
      'Nada todavía: dos tendencias independientes suelen correlacionar; hay que comprobar si el residuo de su regresión es estacionario',
      'Que son la misma serie',
    ],
    answer: 2,
    explanation: 'Es el clásico caso de correlación espuria. La cointegración exige que $y_t - \\beta x_t$ sea estacionaria.',
  },
  {
    type: 'numeric',
    prompt: 'La correlación cruzada $\\operatorname{corr}(x_t, y_{t+k})$ es máxima en $k = 3$. ¿Cuántos pasos adelanta $x$ a $y$?',
    answer: 3,
    tolerance: 0,
    explanation: 'Lo que pasa en $x$ hoy se refleja en $y$ tres pasos después.',
  },
  {
    type: 'choice',
    prompt: '¿Cuál es la forma correcta de crear los conjuntos de entrenamiento y validación de una serie temporal?',
    options: [
      'Barajar las ventanas y separar al azar',
      'Entrenar con el tramo más antiguo y validar con el siguiente, calculando el escalado solo con el tramo de entrenamiento',
      'Escalar con la media de toda la serie y luego separar',
      'Validar con el tramo más antiguo',
    ],
    answer: 1,
    explanation: 'Cualquier otra opción deja que información del futuro entre en el entrenamiento y da métricas optimistas.',
  },
]
