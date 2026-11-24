import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué distingue a un agente de una llamada normal a un LLM?',
    options: [
      'Que usa un modelo más grande',
      'Un bucle en el que el modelo decide acciones, usa herramientas, observa los resultados y vuelve a decidir',
      'Que no necesita prompt',
      'Que siempre usa varios modelos',
    ],
    answer: 1,
    explanation: 'La autonomía está en el bucle percibir–razonar–actuar, no en el tamaño del modelo.',
  },
  {
    type: 'numeric',
    prompt: 'Mensaje de sistema de 1000 tokens; cada paso añade 200. ¿Cuántos tokens de entrada procesa en total una tarea de 5 pasos sin caché?',
    answer: 7000,
    tolerance: 0,
    explanation: '$5\\cdot1000 + 200\\,(0 + 1 + 2 + 3 + 4) = 5000 + 2000 = 7000$.',
  },
  {
    type: 'choice',
    prompt: 'En una arquitectura con supervisor, ¿qué hace el supervisor?',
    options: [
      'Ejecuta todas las herramientas',
      'Decide en cada paso qué agente especializado actúa a continuación o si se termina',
      'Entrena a los demás agentes',
      'Almacena la memoria a largo plazo',
    ],
    answer: 1,
    explanation: 'Actúa como enrutador. En una arquitectura jerárquica, hay supervisores que coordinan a otros supervisores.',
  },
  {
    type: 'choice',
    prompt: '¿Cuál es un error común de ingeniería de contexto?',
    options: [
      'Dar al modelo solo las herramientas necesarias',
      'Meter en cada llamada toda la memoria, todos los documentos y todas las herramientas disponibles',
      'Resumir los pasos antiguos',
      'Separar el contexto entre agentes',
    ],
    answer: 1,
    explanation: 'Satura la ventana, encarece cada llamada y diluye la información relevante (el problema del pajar).',
  },
  {
    type: 'choice',
    prompt: '«La receta para desplegar: cuantizar, activar la KV cache en FP8 y lanzar vLLM» es un ejemplo de memoria…',
    options: ['episódica', 'semántica', 'procedimental', 'de trabajo'],
    answer: 2,
    explanation: 'La memoria procedimental guarda cómo hacer las cosas (habilidades, secuencias de acciones).',
  },
  {
    type: 'numeric',
    prompt: 'Recuperación con recencia: similitud 0.8, vida media de 7 días y una memoria de hace 14 días. ¿Cuál es su puntuación?',
    answer: 0.2,
    tolerance: 0.001,
    explanation: '$0.8\\cdot0.5^{14/7} = 0.8\\cdot0.25 = 0.2$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué acción de un agente debería requerir aprobación humana?',
    options: ['Leer un documento interno', 'Resumir un texto', 'Enviar un correo a un cliente o borrar registros', 'Buscar en la documentación'],
    answer: 2,
    explanation: 'Las acciones externas o irreversibles se pausan (interrupt) hasta que una persona las aprueba, edita o rechaza.',
  },
]
