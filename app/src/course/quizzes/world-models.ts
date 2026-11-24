import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué predice un modelo del mundo?',
    options: [
      'La mejor acción en cada estado',
      'El siguiente estado (o latente), la recompensa y si el episodio termina, dados el estado y la acción',
      'Solo la recompensa final',
      'El retorno deseado',
    ],
    answer: 1,
    explanation: 'Es un simulador aprendido del entorno; la política se aprende aparte, imaginando con él.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué los agentes con modelo del mundo imaginan horizontes cortos?',
    options: [
      'Porque los transformers no admiten secuencias largas',
      'Porque el error del modelo se acumula al encadenar predicciones',
      'Porque las recompensas solo llegan al principio',
      'Porque es más divertido',
    ],
    answer: 1,
    explanation: 'Un pequeño error por paso crece con el horizonte; se imagina poco y se vuelve a partir de estados reales.',
  },
  {
    type: 'numeric',
    prompt: 'Una pérdida InfoNCE con $N = 64$ candidatos. ¿Cuánto vale (aproximadamente) para un modelo al azar?',
    answer: 4.159,
    tolerance: 0.01,
    explanation: '$\\log 64 \\approx 4.159$: el modelo asigna probabilidad $1/64$ al positivo.',
  },
  {
    type: 'numeric',
    prompt: 'Futuro con dos resultados equiprobables, $-1$ y $+1$. ¿Qué valor predice un modelo determinista entrenado con error cuadrático?',
    answer: 0,
    tolerance: 0.001,
    explanation: 'La media, 0: un estado que nunca ocurre. Un modelo estocástico mantendría los dos modos.',
  },
  {
    type: 'numeric',
    prompt: 'InfoNCE con $\\tau = 1$ y similitudes $(\\ln 3, 0)$, siendo la primera la del positivo. ¿Qué probabilidad asigna el modelo al positivo?',
    answer: 0.75,
    tolerance: 0.001,
    explanation: '$e^{\\ln 3} = 3$ y $e^0 = 1$: $3/(3 + 1) = 0.75$.',
  },
  {
    type: 'choice',
    prompt: '¿Qué ventaja tiene la codificación predictiva contrastiva frente a reconstruir el siguiente fotograma píxel a píxel?',
    options: [
      'Es exacta',
      'Obliga a capturar la información que distingue un futuro de otro, sin gastar capacidad en detalles irrelevantes',
      'No necesita negativos',
      'No usa redes neuronales',
    ],
    answer: 1,
    explanation: 'Reconocer el futuro real entre muchos falsos requiere representar lo esencial, no el valor exacto de cada píxel.',
  },
]
