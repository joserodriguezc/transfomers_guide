import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué aprende la red en un modelo de difusión tipo DDPM?',
    options: [
      'A añadir ruido a las imágenes',
      'A predecir el ruido que se añadió a una imagen ruidosa, dado el paso $t$',
      'A clasificar las imágenes',
      'A comprimir las imágenes',
    ],
    answer: 1,
    explanation: 'El proceso hacia delante es fijo. La red $\\varepsilon_\\theta(x_t, t)$ se entrena con un error cuadrático para predecir $\\varepsilon$.',
  },
  {
    type: 'numeric',
    prompt: 'Con $\\beta_1 = 0.1$ y $\\beta_2 = 0.2$, ¿cuánto vale $\\bar\\alpha_2$?',
    answer: 0.72,
    tolerance: 0.001,
    explanation: '$\\bar\\alpha_2 = (1 - 0.1)(1 - 0.2) = 0.9\\cdot0.8 = 0.72$.',
  },
  {
    type: 'numeric',
    prompt: 'Con $\\bar\\alpha_t = 0.64$, $x_0 = 10$ y $\\varepsilon = 2$, ¿cuánto vale $x_t$?',
    answer: 9.2,
    tolerance: 0.001,
    explanation: '$\\sqrt{0.64}\\cdot10 + \\sqrt{0.36}\\cdot2 = 8 + 1.2 = 9.2$.',
  },
  {
    type: 'matrix',
    prompt: 'Guía sin clasificador con $w = 3$: $\\varepsilon_{incond} = (1, 0)$ y $\\varepsilon_{cond} = (2, 1)$. Escribe $\\tilde\\varepsilon$ como una fila.',
    answer: [[4, 3]],
    tolerance: 0.001,
    explanation: '$(1, 0) + 3\\,[(2, 1) - (1, 0)] = (1, 0) + (3, 3) = (4, 3)$.',
  },
  {
    type: 'choice',
    prompt: 'Al aumentar mucho la escala de guía $w$…',
    options: [
      'las imágenes son más diversas',
      'las imágenes se ajustan más al prompt pero pierden diversidad, y con valores extremos aparecen artefactos',
      'el muestreo necesita menos pasos',
      'no cambia nada',
    ],
    answer: 1,
    explanation: 'La guía estrecha la distribución hacia la zona más «típica» de la condición: compromiso entre fidelidad y diversidad.',
  },
  {
    type: 'numeric',
    prompt: 'Un muestreo con guía sin clasificador usa 30 pasos. ¿Cuántas evaluaciones de la red hace en total?',
    answer: 60,
    tolerance: 0,
    explanation: 'Cada paso necesita la predicción condicional y la incondicional: $2\\cdot30 = 60$ (en la práctica se calculan juntas en un lote de 2).',
  },
  {
    type: 'choice',
    prompt: '¿Por qué se entrena con un paso $t$ aleatorio sin simular toda la cadena de ruido?',
    options: [
      'Porque es una aproximación',
      'Porque $x_t$ tiene forma cerrada a partir de $x_0$: se muestrea directamente',
      'Porque solo importa el último paso',
      'Porque la red no usa $t$',
    ],
    answer: 1,
    explanation: 'La composición de pasos gaussianos es gaussiana: $x_t = \\sqrt{\\bar\\alpha_t}x_0 + \\sqrt{1-\\bar\\alpha_t}\\varepsilon$.',
  },
]
