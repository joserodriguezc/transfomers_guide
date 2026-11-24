import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Por qué responde SAM tan rápido a cada clic aunque su encoder sea muy grande?',
    options: [
      'Porque usa una CNN pequeña',
      'Porque el embedding de la imagen se calcula una sola vez y cada clic solo ejecuta el decodificador ligero',
      'Porque reduce la imagen a 64×64 píxeles',
      'Porque no usa atención',
    ],
    answer: 1,
    explanation: 'Es la clave del diseño: el coste pesado se amortiza entre todas las interacciones sobre la misma imagen.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántos tokens de prompt genera una caja delimitadora en SAM?',
    answer: 2,
    tolerance: 0,
    explanation: 'Una caja se codifica con sus dos esquinas (superior izquierda e inferior derecha), cada una con su embedding de tipo.',
  },
  {
    type: 'numeric',
    prompt: 'Máscara predicha: 200 píxeles. Verdad: 300 píxeles. Intersección: 150. ¿Cuánto vale el IoU?',
    answer: 0.4286,
    tolerance: 0.002,
    explanation: 'Unión $= 200 + 300 - 150 = 350$. $\\operatorname{IoU} = 150/350 \\approx 0.429$.',
  },
  {
    type: 'numeric',
    prompt: 'Si el IoU es 0.5, ¿cuánto vale el Dice? Usa $\\operatorname{Dice} = 2\\operatorname{IoU}/(1 + \\operatorname{IoU})$.',
    answer: 0.6667,
    tolerance: 0.002,
    explanation: '$2\\cdot0.5/1.5 \\approx 0.667$.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué devuelve SAM tres máscaras para un único punto?',
    options: [
      'Para promediarlas',
      'Porque un punto es ambiguo (parte, objeto o todo) y conviene proponer varias hipótesis con su calidad estimada',
      'Porque hay tres canales de color',
      'Porque tiene tres encoders',
    ],
    answer: 1,
    explanation: 'Un clic en una puerta puede querer decir «la puerta» o «la casa». Con varios prompts la ambigüedad desaparece y basta una máscara.',
  },
  {
    type: 'choice',
    prompt: '¿Qué añade SAM 2 para segmentar vídeo?',
    options: [
      'Un decodificador de texto',
      'Un banco de memoria con los fotogramas y predicciones anteriores, al que atiende cada fotograma nuevo',
      'Una red recurrente LSTM',
      'Un clasificador de escenas',
    ],
    answer: 1,
    explanation: 'La atención a la memoria mantiene la identidad del objeto a lo largo del vídeo y permite recuperarlo tras oclusiones.',
  },
  {
    type: 'choice',
    prompt: 'En SAM 3, ¿para qué sirve el token de presencia?',
    options: [
      'Para indicar la posición del objeto',
      'Para decidir si el concepto aparece en la imagen antes de localizarlo, separando reconocimiento y localización',
      'Para contar los fotogramas',
      'Para codificar la caja',
    ],
    answer: 1,
    explanation: 'Evita que las queries del detector tengan que resolver a la vez «¿existe?» y «¿dónde?», lo que reduce falsos positivos.',
  },
]
