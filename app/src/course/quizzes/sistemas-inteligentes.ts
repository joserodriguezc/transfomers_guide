import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Una cadena de 8 pasos con $p = 0.9$ por paso y sin verificación. ¿Cuál es la probabilidad de éxito?',
    answer: 0.4305,
    tolerance: 0.001,
    explanation: '$0.9^8 \\approx 0.430$: menos de la mitad de las ejecuciones terminan bien.',
  },
  {
    type: 'numeric',
    prompt: 'Con $p = 0.9$, un verificador que detecta el 50 % de los fallos ($d = 0.5$) y un reintento, ¿cuál es $p\'$ por paso? Usa $p\' = p + (1-p)\\,d\\,p$.',
    answer: 0.945,
    tolerance: 0.001,
    explanation: '$0.9 + 0.1\\cdot0.5\\cdot0.9 = 0.945$.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué SAM 3 necesita un MLLM para resolver «la bola de lana roja de más a la izquierda»?',
    options: [
      'Porque SAM 3 no puede segmentar bolas de lana',
      'Porque SAM 3 segmenta conceptos, pero razonar sobre atributos y relaciones espaciales para elegir una instancia requiere un planificador',
      'Porque SAM 3 solo funciona con vídeo',
      'Porque el MLLM produce mejores máscaras',
    ],
    answer: 1,
    explanation: 'El MLLM planifica y elige; SAM 3 ejecuta como especialista. La combinación resuelve lo que ninguno resuelve solo.',
  },
  {
    type: 'choice',
    prompt: 'Para una tarea secuencial con dependencias estrictas entre pasos, ¿qué arquitectura suele ser más estable?',
    options: [
      'Muchos agentes independientes votando',
      'Un solo agente con buenas herramientas y verificación',
      'Una red de agentes sin coordinador',
      'Ninguna: no se puede automatizar',
    ],
    answer: 1,
    explanation: 'Repartir una cadena dependiente añade traspasos (pérdida de contexto) sin añadir redundancia útil.',
  },
  {
    type: 'numeric',
    prompt: 'Tres agentes intentan la misma subtarea independiente con $p = 0.7$ y un verificador elige una solución correcta si existe. ¿Probabilidad de éxito?',
    answer: 0.973,
    tolerance: 0.001,
    explanation: '$1 - 0.3^3 = 1 - 0.027 = 0.973$.',
  },
  {
    type: 'matrix',
    prompt: 'Escribe como una fila el número de tokens de: una imagen de $224\\times224$ con parches de 16, una serie de 512 puntos con parches de 16 y paso 8, y 30 s de audio en el encoder de Whisper.',
    answer: [[196, 63, 1500]],
    tolerance: 0,
    explanation: '$(224/16)^2 = 196$; $\\lfloor(512 - 16)/8\\rfloor + 1 = 63$; $30\\cdot50 = 1500$.',
  },
]
