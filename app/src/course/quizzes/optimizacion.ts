import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Por qué RULER puntúa varias trayectorias a la vez en lugar de una a una?',
    options: [
      'Para ahorrar llamadas al juez',
      'Porque juzgar de forma relativa es más fiable que dar notas absolutas, y GRPO solo necesita saber qué respuestas superan la media del grupo',
      'Porque el juez no puede leer trayectorias largas',
      'Porque así no hace falta rúbrica',
    ],
    answer: 1,
    explanation: 'Las notas absolutas de un LLM juez son ruidosas y poco calibradas; las comparaciones dentro de un grupo son más consistentes.',
  },
  {
    type: 'numeric',
    prompt: 'AdaptThink con $\\delta = 0.05$: referencia 0.80, con razonamiento 0.82, sin razonamiento 0.78. ¿Cuál es la recompensa esperada del modo sin razonamiento?',
    answer: 0.03,
    tolerance: 0.001,
    explanation: '$0.78 - 0.80 + 0.05 = 0.03$, mayor que $0.82 - 0.80 = 0.02$: gana responder directamente.',
  },
  {
    type: 'choice',
    prompt: 'Si subes mucho $\\delta$ en AdaptThink (por ejemplo a 0.1)…',
    options: [
      'el modelo piensa en todos los problemas',
      'el modelo responde sin pensar con mucha más frecuencia, ahorrando tokens pero perdiendo precisión en los problemas difíciles',
      'no cambia nada',
      'el modelo deja de responder',
    ],
    answer: 1,
    explanation: 'δ es lo que se está dispuesto a perder en precisión a cambio de eficiencia.',
  },
  {
    type: 'choice',
    prompt: '¿Qué hace la ortogonalización de Muon con la actualización $M = U\\Sigma V^T$?',
    options: [
      'La convierte en la matriz identidad',
      'La aproxima por $UV^T$: conserva las direcciones y lleva todos los valores singulares cerca de 1',
      'La normaliza por su norma de Frobenius y nada más',
      'Calcula su inversa',
    ],
    answer: 1,
    explanation: 'Así ninguna dirección domina la actualización y las direcciones con gradientes pequeños también aprenden.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué Muon usa la iteración de Newton–Schulz en lugar de calcular la SVD?',
    options: [
      'Porque la SVD no existe para matrices rectangulares',
      'Porque solo requiere multiplicaciones de matrices, que la GPU hace muy rápido, mientras que la SVD es lenta y difícil de paralelizar',
      'Porque es exacta',
      'Porque no necesita normalizar',
    ],
    answer: 1,
    explanation: 'Cinco iteraciones de productos de matrices bastan para una aproximación útil.',
  },
  {
    type: 'numeric',
    prompt: 'Un modelo de 70 000 millones de parámetros en BF16 (2 bytes) se reparte entre 8 GPUs. ¿Cuántos GB debe recibir cada GPU al sincronizar los pesos?',
    answer: 17.5,
    tolerance: 0.01,
    explanation: '$70\\cdot10^9\\cdot2/8 = 17.5\\cdot10^9$ bytes = 17.5 GB.',
  },
]
