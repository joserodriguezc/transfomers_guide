import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'numeric',
    prompt: '¿Cuántos parches de $16\\times16$ tiene una imagen de $256\\times256$?',
    answer: 256,
    tolerance: 0,
    explanation: '$(256/16)^2 = 16^2 = 256$ parches (257 tokens con [CLS]).',
  },
  {
    type: 'numeric',
    prompt: '¿Cuántos valores tiene cada parche aplanado de $16\\times16$ en una imagen RGB?',
    answer: 768,
    tolerance: 0,
    explanation: '$P^2 C = 16\\cdot16\\cdot3 = 768$.',
  },
  {
    type: 'choice',
    prompt: '¿Para qué sirve el token [CLS] en ViT?',
    options: [
      'Para marcar el final de la imagen',
      'Es un token aprendido cuya salida, tras atender a todos los parches, se usa como resumen para clasificar',
      'Contiene la posición de cada parche',
      'Es el parche central de la imagen',
    ],
    answer: 1,
    explanation: 'Igual que en BERT: un vector extra que agrega información de toda la secuencia. Otra opción es promediar las salidas de los parches.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué desplaza Swin las ventanas en capas alternas?',
    options: [
      'Para reducir el número de parámetros',
      'Para que la información pueda cruzar las fronteras entre ventanas; si no, cada ventana estaría aislada',
      'Para aumentar la resolución',
      'Para aplicar aumento de datos',
    ],
    answer: 1,
    explanation: 'Con ventanas fijas, dos parches vecinos en ventanas distintas nunca se atenderían. El desplazamiento conecta ventanas capa tras capa.',
  },
  {
    type: 'numeric',
    prompt: 'Con $N = 3136$ tokens y ventanas de $M\\times M = 49$ parches, ¿cuántas veces menos puntuaciones calcula la atención por ventanas que la global? ($N^2$ frente a $N\\cdot M^2$)',
    answer: 64,
    tolerance: 0,
    explanation: '$N^2/(N M^2) = N/M^2 = 3136/49 = 64$.',
  },
  {
    type: 'numeric',
    prompt: 'Pérdida Dice: la predicción binaria tiene 30 píxeles positivos, la verdad 50, y coinciden 20. ¿Cuánto vale $\\mathcal{L}_{Dice}$?',
    answer: 0.5,
    tolerance: 0.001,
    explanation: 'Coeficiente Dice $= 2\\cdot20/(30 + 50) = 0.5$; pérdida $= 1 - 0.5 = 0.5$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué ventaja tiene la atención por coseno escalado de Swin V2 frente al producto punto?',
    options: [
      'Es más rápida de calcular',
      'Está acotada: las puntuaciones no crecen con la magnitud de las activaciones, lo que estabiliza modelos grandes',
      'No necesita softmax',
      'Elimina el sesgo posicional',
    ],
    answer: 1,
    explanation: 'Con producto punto, activaciones grandes producen logits enormes y mapas de atención dominados por pocos pares.',
  },
]
