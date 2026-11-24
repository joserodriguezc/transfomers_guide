import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: '¿Cuál es la frecuencia de Nyquist de un audio muestreado a 22 050 Hz?',
    answer: 11025,
    tolerance: 0,
    explanation: '$f_s/2 = 11\\,025$ Hz: la frecuencia más alta representable sin aliasing.',
  },
  {
    type: 'numeric',
    prompt: 'Con $f_s = 1000$ Hz, ¿a qué frecuencia parece estar un tono de 700 Hz?',
    answer: 300,
    tolerance: 0,
    explanation: 'Está por encima de Nyquist (500 Hz): aparece como $f_s - f = 1000 - 700 = 300$ Hz.',
  },
  {
    type: 'numeric',
    prompt: 'Aproximadamente, ¿qué SNR de cuantización (en dB) da un audio de 24 bits? Usa $6.02\\,b + 1.76$.',
    answer: 146.24,
    tolerance: 0.1,
    explanation: '$6.02\\cdot24 + 1.76 = 146.24$ dB, mucho más de lo que el oído distingue.',
  },
  {
    type: 'numeric',
    prompt: 'STFT con $f_s = 16\\,000$ Hz y ventana de $N = 512$ muestras. ¿Cuál es la resolución en frecuencia en Hz?',
    answer: 31.25,
    tolerance: 0.01,
    explanation: '$\\Delta f = f_s/N = 16\\,000/512 = 31.25$ Hz.',
  },
  {
    type: 'choice',
    prompt: 'Si alargas la ventana de la STFT…',
    options: [
      'mejora la resolución en tiempo y empeora en frecuencia',
      'mejora la resolución en frecuencia y empeora en tiempo',
      'mejoran ambas',
      'no cambia nada',
    ],
    answer: 1,
    explanation: '$\\Delta f = f_s/N$ baja con $N$ grande, pero cada trama abarca más tiempo: los eventos rápidos se emborronan.',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántas tramas tiene un audio de 10 s a 16 kHz con salto $H = 160$ muestras?',
    answer: 1000,
    tolerance: 0,
    explanation: '$160\\,000/160 = 1000$ tramas, una cada 10 ms.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué se usa la escala mel en lugar de hercios lineales?',
    options: [
      'Porque es más rápida de calcular',
      'Porque imita la percepción humana: más resolución en frecuencias bajas, donde el oído distingue mejor',
      'Porque elimina el ruido',
      'Porque conserva la fase',
    ],
    answer: 1,
    explanation: 'Agrupar las frecuencias altas en bandas anchas reduce la dimensión sin perder información perceptualmente relevante.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué un modelo que genera espectrogramas necesita un vocoder?',
    options: [
      'Para comprimir el audio',
      'Porque el espectrograma de magnitud no incluye la fase, y sin una fase coherente no se puede reconstruir la onda',
      'Para aumentar la frecuencia de muestreo',
      'Para traducir el audio',
    ],
    answer: 1,
    explanation: 'La misma magnitud con fases aleatorias produce una onda muy distinta (y suena mal). El vocoder aprende a generar la onda.',
  },
]
