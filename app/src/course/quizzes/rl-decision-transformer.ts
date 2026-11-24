import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Recompensas $r = (1, 1, 1)$ y $\\gamma = 0.5$. ¿Cuánto vale el retorno descontado $G_1$?',
    answer: 1.75,
    tolerance: 0.001,
    explanation: '$G_3 = 1$, $G_2 = 1 + 0.5 = 1.5$, $G_1 = 1 + 0.75 = 1.75$.',
  },
  {
    type: 'matrix',
    prompt: 'Recompensas $r = (0, 3, 1, 2)$. Escribe los return-to-go $(\\hat R_1, \\hat R_2, \\hat R_3, \\hat R_4)$ como una fila.',
    answer: [[6, 6, 3, 2]],
    tolerance: 0,
    explanation: 'Suma de lo que queda desde cada paso: $6, 6, 3, 2$.',
  },
  {
    type: 'numeric',
    prompt: 'Q-learning: $Q(s,a) = 2$, $r = 1$, $\\gamma = 0.9$, $\\max_{a\'} Q(s\', a\') = 5$, $\\alpha = 0.5$. ¿Cuál es el nuevo $Q(s,a)$?',
    answer: 3.75,
    tolerance: 0.001,
    explanation: 'Objetivo $= 1 + 0.9\\cdot5 = 5.5$. Error TD $= 5.5 - 2 = 3.5$. Nuevo valor $= 2 + 0.5\\cdot3.5 = 3.75$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué diferencia al RL offline del online?',
    options: [
      'El offline no usa redes neuronales',
      'El offline aprende de un dataset fijo de interacciones, sin interactuar con el entorno durante el entrenamiento',
      'El offline solo funciona con recompensas negativas',
      'No hay diferencia',
    ],
    answer: 1,
    explanation: 'Offline (o batch) RL usa datos ya recogidos; es más seguro y barato, pero limitado por la calidad y cobertura de esos datos.',
  },
  {
    type: 'numeric',
    prompt: 'Un Decision Transformer usa un contexto de $K = 20$ pasos. ¿Cuántos tokens recibe?',
    answer: 60,
    tolerance: 0,
    explanation: 'Tres tokens por paso ($\\hat R$, $s$, $a$): $3\\cdot20 = 60$.',
  },
  {
    type: 'numeric',
    prompt: 'Al desplegar un DT pides $\\hat R_1 = 50$. Obtienes $r_1 = 10$ y $r_2 = 15$. ¿Qué return-to-go recibe el modelo en el paso 3?',
    answer: 25,
    tolerance: 0,
    explanation: '$\\hat R_3 = 50 - 10 - 15 = 25$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué añade el Online Decision Transformer al Decision Transformer?',
    options: [
      'Una función de valor entrenada con TD',
      'Ajuste online con una política estocástica (término de entropía) y un buffer de trayectorias reetiquetadas con su retorno real',
      'Un modelo del mundo',
      'Atención bidireccional',
    ],
    answer: 1,
    explanation: 'Así puede explorar y mejorar más allá de la calidad del dataset offline, sin abandonar el aprendizaje supervisado de secuencias.',
  },
]
