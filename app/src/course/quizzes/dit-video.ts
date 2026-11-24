import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'Un DiT trabaja con un latente de $64\\times64\\times4$ y parches de $p = 2$. ¿Cuántos tokens procesa?',
    answer: 1024,
    tolerance: 0,
    explanation: '$(64/2)^2 = 32^2 = 1024$.',
  },
  {
    type: 'numeric',
    prompt: 'Una imagen de $512\\times512\\times3$ se codifica con un VAE de factor 8 y 4 canales. ¿Por cuánto se divide el número de valores?',
    answer: 48,
    tolerance: 0,
    explanation: 'Latente $64\\times64\\times4 = 16\\,384$ valores frente a $786\\,432$: $786\\,432/16\\,384 = 48$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué consigue la inicialización «Zero» de adaLN-Zero?',
    options: [
      'Que el modelo no use la condición',
      'Que cada bloque empiece siendo la función identidad (compuerta a cero), lo que estabiliza el entrenamiento',
      'Que el ruido sea cero',
      'Que los pesos de atención sean uniformes',
    ],
    answer: 1,
    explanation: 'Con $g = 0$, $y = x + 0\\cdot f(\\cdot) = x$. El modelo «enciende» poco a poco cada bloque durante el entrenamiento.',
  },
  {
    type: 'numeric',
    prompt: 'Con compresión de keys/values de PixArt-Σ con $f = 2$, ¿por cuánto se divide el número de pares de atención?',
    answer: 4,
    tolerance: 0,
    explanation: 'Keys y values pasan de $N$ a $N/f^2 = N/4$: los pares pasan de $N^2$ a $N^2/4$.',
  },
  {
    type: 'numeric',
    prompt: 'Vídeo latente con $F = 10$ fotogramas y $S = 100$ tokens por fotograma. ¿Cuántos pares calcula la atención factorizada ($F S^2 + S F^2$)?',
    answer: 110000,
    tolerance: 0,
    explanation: '$10\\cdot100^2 + 100\\cdot10^2 = 100\\,000 + 10\\,000 = 110\\,000$, frente a $(1000)^2 = 1\\,000\\,000$ de la completa.',
  },
  {
    type: 'choice',
    prompt: '¿Cómo entra el texto del prompt en PixArt-α?',
    options: [
      'Como parches adicionales de imagen',
      'Mediante cross-attention a los embeddings de un codificador de texto (T5)',
      'Solo a través de adaLN',
      'No usa texto',
    ],
    answer: 1,
    explanation: 'adaLN-single solo usa el paso $t$; el texto, más rico, se atiende con cross-attention en cada bloque.',
  },
  {
    type: 'choice',
    prompt: '¿Qué compromiso hace LTX-Video al comprimir el vídeo 1:192?',
    options: [
      'Ninguno: no pierde nada',
      'Reduce muchísimo los tokens y permite atención completa, pero cada token resume mucho detalle; por eso el decodificador hace el último paso de eliminación de ruido',
      'Elimina la dimensión temporal',
      'Solo funciona con vídeos de un fotograma',
    ],
    answer: 1,
    explanation: 'El VAE de LTX-Video comprime $32\\times32\\times8$ píxeles por token; el detalle fino se recupera en el decodificador.',
  },
]
