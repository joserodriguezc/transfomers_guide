import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Por qué GRPO no necesita un modelo crítico (función de valor)?',
    options: [
      'Porque no usa recompensas',
      'Porque usa como línea base la recompensa media del grupo de respuestas a la misma pregunta',
      'Porque solo entrena con SFT',
      'Porque el crítico está dentro del tokenizador',
    ],
    answer: 1,
    explanation: 'La ventaja es la recompensa normalizada dentro del grupo. Ahorra un modelo tan grande como la política.',
  },
  {
    type: 'matrix',
    prompt: 'Grupo con recompensas $(2, 0, 1, 1)$. Escribe las ventajas de GRPO como una fila (usa la desviación típica poblacional).',
    answer: [[1.4142, -1.4142, 0, 0]],
    tolerance: 0.01,
    explanation: 'Media 1, desviación $\\sqrt{(1 + 1 + 0 + 0)/4} = \\sqrt{0.5} \\approx 0.707$. Ventajas $(1, -1, 0, 0)/0.707$.',
  },
  {
    type: 'numeric',
    prompt: 'Con $\\varepsilon = 0.2$, una respuesta con ventaja $A = 2$ y razón $\\rho = 0.6$. ¿Cuánto vale $\\min(\\rho A, \\operatorname{clip}(\\rho, 0.8, 1.2)A)$?',
    answer: 1.2,
    tolerance: 0.001,
    explanation: '$\\rho A = 1.2$ y $\\operatorname{clip}(0.6)\\cdot2 = 0.8\\cdot2 = 1.6$. El mínimo es 1.2: con ventaja positiva el recorte solo limita las subidas.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo acierta el 20 % de las veces. Con un verificador perfecto, ¿cuál es pass@5?',
    answer: 0.67232,
    tolerance: 0.001,
    explanation: '$1 - 0.8^5 = 1 - 0.32768 = 0.67232$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué tipo de recompensas usó DeepSeek-R1 en su RL de razonamiento?',
    options: [
      'Un modelo de recompensa neuronal entrenado con preferencias humanas',
      'Recompensas basadas en reglas: exactitud de la respuesta (verificable) y formato del razonamiento',
      'Ninguna',
      'Solo la longitud de la respuesta',
    ],
    answer: 1,
    explanation: 'Las reglas son difíciles de «engañar» (reward hacking), a diferencia de un modelo de recompensa neuronal.',
  },
  {
    type: 'numeric',
    prompt: 'UCT con $c = 1$: un hijo con $W = 3$, $N = 4$ y el padre con $N_{padre} = 20$. Calcula su puntuación (logaritmo natural).',
    answer: 1.616,
    tolerance: 0.005,
    explanation: '$3/4 + \\sqrt{\\ln 20/4} = 0.75 + \\sqrt{2.996/4} \\approx 0.75 + 0.866 = 1.616$.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo MoE tiene 64 expertos de 1000 millones de parámetros cada uno y activa 4 por token (ignora el resto del modelo). ¿Cuántos miles de millones de parámetros de expertos usa cada token?',
    answer: 4,
    tolerance: 0,
    explanation: 'Solo los $k = 4$ expertos elegidos: $4 \\cdot 1 = 4$ mil millones, de 64 en total.',
  },
]
