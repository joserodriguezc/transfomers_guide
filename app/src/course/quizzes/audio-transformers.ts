import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: 'El encoder de Whisper recibe 3000 tramas log-mel y la segunda convolución tiene paso 2. ¿Cuántas posiciones procesa el transformer?',
    answer: 1500,
    tolerance: 0,
    explanation: '$3000/2 = 1500$ posiciones, cada una de 20 ms.',
  },
  {
    type: 'choice',
    prompt: '¿Cómo indica Whisper si debe transcribir o traducir?',
    options: [
      'Con dos modelos distintos',
      'Con tokens especiales al principio de la secuencia del decoder (`<|transcribe|>` o `<|translate|>`)',
      'Con un parámetro del espectrograma',
      'No puede traducir',
    ],
    answer: 1,
    explanation: 'El decoder se condiciona con un prompt de tokens especiales: idioma, tarea y marcas de tiempo.',
  },
  {
    type: 'numeric',
    prompt: 'Un códec usa 50 tramas por segundo, 4 libros de códigos y libros de 1024 entradas. ¿Cuál es su tasa de bits en kbps?',
    answer: 2,
    tolerance: 0.001,
    explanation: '$50\\cdot4\\cdot\\log_2 1024 = 50\\cdot4\\cdot10 = 2000$ bits/s $= 2$ kbps.',
  },
  {
    type: 'choice',
    prompt: 'En la cuantización vectorial residual, ¿qué cuantiza el segundo libro de códigos?',
    options: [
      'El mismo vector que el primero',
      'El residuo: la diferencia entre el vector original y lo que reconstruyó el primer libro',
      'La fase del audio',
      'El texto transcrito',
    ],
    answer: 1,
    explanation: 'Cada nivel corrige el error acumulado; la reconstrucción es la suma de los códigos de todos los niveles.',
  },
  {
    type: 'numeric',
    prompt: 'Referencia de 20 palabras; la transcripción tiene 2 sustituciones, 1 borrado y 1 inserción. ¿Cuál es el WER?',
    answer: 0.2,
    tolerance: 0.001,
    explanation: '$(2 + 1 + 1)/20 = 0.2$, es decir, un 20 %.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántos tokens semánticos produce un minuto de audio a 12.5 Hz?',
    answer: 750,
    tolerance: 0,
    explanation: '$60\\cdot12.5 = 750$ tokens.',
  },
  {
    type: 'choice',
    prompt: '¿Qué ventaja tiene el patrón de retraso de MusicGen?',
    options: [
      'Mejora la frecuencia de muestreo',
      'Permite predecir los códigos de varios libros en un solo paso, desplazados en el tiempo, sin multiplicar los pasos de generación',
      'Elimina la necesidad de un códec',
      'Reduce el número de libros a uno',
    ],
    answer: 1,
    explanation: 'Con $Q$ libros y $T$ pasos se generan en $T + Q - 1$ pasos en lugar de $T\\cdot Q$, y cada libro ve los niveles anteriores del mismo instante.',
  },
]
