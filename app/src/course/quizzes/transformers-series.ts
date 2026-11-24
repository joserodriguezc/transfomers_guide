import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Chronos escala dividiendo por la media de los valores absolutos. ¿Cuál es la escala $s$ del contexto $(10, -30, 20, 20)$?',
    answer: 20,
    tolerance: 0,
    explanation: '$s = (10 + 30 + 20 + 20)/4 = 20$.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántos parches genera PatchTST para una serie de longitud 336 con $P = 16$ y $S = 8$?',
    answer: 41,
    tolerance: 0,
    explanation: '$\\lfloor (336 - 16)/8 \\rfloor + 1 = 40 + 1 = 41$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué significa «independencia de canal» en PatchTST?',
    options: [
      'Que el modelo ignora las variables que no son el objetivo',
      'Que cada variable de una serie multivariante se procesa como una serie univariante independiente, con los mismos pesos',
      'Que los parches no se solapan',
      'Que no se usa atención entre parches',
    ],
    answer: 1,
    explanation: 'Las $M$ variables se apilan en el lote. Reduce el sobreajuste y permite usar el mismo modelo con cualquier número de variables.',
  },
  {
    type: 'numeric',
    prompt: 'TimesFM usa parches de salida de 128 puntos. ¿Cuántos pasos autorregresivos necesita para un horizonte de 400?',
    answer: 4,
    tolerance: 0,
    explanation: '$\\lceil 400/128 \\rceil = 4$ (con parches de 32 serían 13).',
  },
  {
    type: 'numeric',
    prompt: 'Pérdida pinball con $\\tau = 0.9$: el valor real es 100 y el cuantil predicho 90. ¿Cuánto vale?',
    answer: 9,
    tolerance: 0.001,
    explanation: 'Error $y - \\hat q = 10 > 0$: $\\tau \\cdot 10 = 9$. Si el cuantil hubiera sido 110, la pérdida sería $0.1\\cdot10 = 1$.',
  },
  {
    type: 'numeric',
    prompt: 'Un pronóstico tiene MAE 3 y el pronóstico ingenuo dentro del entrenamiento tiene MAE 4. ¿Cuál es el MASE?',
    answer: 0.75,
    tolerance: 0.001,
    explanation: '$\\operatorname{MASE} = 3/4 = 0.75 \\lt 1$: mejor que repetir el último valor.',
  },
  {
    type: 'choice',
    prompt: '¿Cómo obtiene AnomalyBERT ejemplos etiquetados de anomalías para entrenar?',
    options: [
      'Pide a expertos que etiqueten datos reales',
      'Degrada tramos de datos normales (sustitución, mezcla, picos, valores constantes) y aprende a localizar los tramos alterados',
      'Usa las predicciones de Chronos',
      'No usa etiquetas de ningún tipo',
    ],
    answer: 1,
    explanation: 'Es aprendizaje autosupervisado: las etiquetas salen gratis del proceso de degradación.',
  },
]
