import type { ComponentType } from 'react'

export interface Part {
  id: number
  title: string
  description: string
}

export interface Stage {
  /**
   * Identidad estable del módulo: nombra su MDX (`stages/<slug>.mdx`), sus preguntas
   * (`quizzes/<slug>.ts`), sus snippets (`snippets/<slug>/`), su URL y su progreso guardado.
   */
  slug: string
  /** Número que se muestra: se calcula a partir de la posición en el curso (no se escribe a mano). */
  n: number
  title: string
  part: number
  summary: string
  objectives: string[]
}

export const parts: Part[] = [
  {
    id: 1,
    title: 'Fundamentos del transformer',
    description: 'Tokens, embeddings, atención, el bloque transformer, encoder y decoder, contexto largo y variantes eficientes de atención.',
  },
  {
    id: 2,
    title: 'Más allá del texto',
    description: 'La misma arquitectura aplicada a series temporales, imágenes, segmentación, difusión, vídeo y audio.',
  },
  {
    id: 3,
    title: 'Decisión y razonamiento',
    description: 'Aprendizaje por refuerzo con transformers, modelos del mundo, modelos de razonamiento y agentes.',
  },
  {
    id: 4,
    title: 'Producción',
    description: 'Optimizar modelos y agentes, desplegarlos con cuantización y KV cache, y combinarlos en sistemas inteligentes.',
  },
]

/** Módulos en orden. Insertar o reordenar aquí renumera todo el curso automáticamente. */
const STAGE_DEFS: Omit<Stage, 'n'>[] = [
  // ── Parte 1 · Fundamentos ────────────────────────────────────────────────
  {
    slug: 'tokenizacion',
    title: 'Tokenización',
    part: 1,
    summary: 'Cómo se convierte un texto en una secuencia de enteros: caracteres, palabras y subpalabras (BPE).',
    objectives: [
      'Comparar la tokenización por caracteres, por palabras y por subpalabras',
      'Ejecutar a mano el algoritmo BPE (Byte Pair Encoding)',
      'Relacionar el tamaño del vocabulario con la longitud de las secuencias',
      'Reconocer los tokens especiales ([CLS], [SEP], <eos>, padding)',
    ],
  },
  {
    slug: 'embeddings-posicion',
    title: 'Embeddings y codificación posicional',
    part: 1,
    summary: 'De IDs a vectores con la matriz de embeddings, y cómo se le enseña al modelo el orden de los tokens.',
    objectives: [
      'Ver la búsqueda de un embedding como un producto por un vector one-hot',
      'Medir similitud entre embeddings con el coseno',
      'Calcular la codificación posicional sinusoidal',
      'Explicar por qué la atención sin posiciones ignora el orden',
    ],
  },
  {
    slug: 'atencion',
    title: 'Atención por producto escalado',
    part: 1,
    summary: 'Queries, keys y values: cada token pregunta, compara y mezcla la información de los demás.',
    objectives: [
      'Calcular Q, K y V como proyecciones lineales de los embeddings',
      'Aplicar softmax por filas a QKᵀ/√d_k y leer la matriz de atención',
      'Explicar por qué se divide por √d_k',
      'Implementar la atención con NumPy en cinco líneas',
    ],
  },
  {
    slug: 'multi-cabeza',
    title: 'Atención multi-cabeza',
    part: 1,
    summary: 'Varias atenciones en paralelo, cada una en su subespacio, que se concatenan y proyectan.',
    objectives: [
      'Dividir d_model en h cabezas de dimensión d_k = d_model/h',
      'Concatenar las salidas y aplicar la proyección W_O',
      'Contar los parámetros de una capa de atención multi-cabeza',
      'Interpretar qué tipo de relación captura cada cabeza',
    ],
  },
  {
    slug: 'bloque-transformer',
    title: 'El bloque transformer',
    part: 1,
    summary: 'Conexiones residuales, normalización (LayerNorm y RMSNorm) y la red feed-forward por posición.',
    objectives: [
      'Escribir un bloque pre-norm completo',
      'Calcular LayerNorm y RMSNorm a mano',
      'Explicar el papel del flujo residual',
      'Contar los parámetros de un bloque y de un modelo',
    ],
  },
  {
    slug: 'encoder-decoder',
    title: 'Encoder, decoder y máscaras',
    part: 1,
    summary: 'Atención bidireccional y causal, cross-attention y las familias encoder-only, decoder-only y encoder-decoder.',
    objectives: [
      'Construir una máscara causal y una de padding',
      'Implementar la cross-attention (queries del decoder, keys y values del encoder)',
      'Generar texto token a token (decodificación autorregresiva)',
      'Elegir entre encoder-only, decoder-only y encoder-decoder según la tarea',
    ],
  },
  {
    slug: 'contexto-largo',
    title: 'Contexto largo: RoPE, PI y YaRN',
    part: 1,
    summary: 'Posiciones relativas por rotación, cómo ampliar la ventana de contexto y cómo medirlo con la perplejidad.',
    objectives: [
      'Construir la matriz de rotación de RoPE y comprobar que solo depende de n − m',
      'Ampliar el contexto con interpolación de posiciones (PI) y entender NTK y YaRN',
      'Calcular la perplejidad de un modelo',
      'Explicar el problema del pajar (haystack): por qué softmax se aplana con contextos largos',
    ],
  },
  {
    slug: 'variantes-atencion',
    title: 'Atención eficiente: MQA, GQA, KV cache y FlashAttention',
    part: 1,
    summary: 'Compartir keys y values, cachearlos al generar y calcular la atención por bloques sin la matriz N×N.',
    objectives: [
      'Calcular el tamaño de la KV cache con MHA, GQA y MQA',
      'Implementar la decodificación con KV cache',
      'Implementar el softmax en línea (online softmax) que usa FlashAttention',
      'Explicar PagedAttention y la atención en FP8',
    ],
  },
  // ── Parte 2 · Más allá del texto ─────────────────────────────────────────
  {
    slug: 'series-temporales',
    title: 'Series temporales: lo que hay que entender antes del modelo',
    part: 2,
    summary: 'Autocorrelación, estacionariedad, tendencia, estacionalidad, cointegración y correlación cruzada.',
    objectives: [
      'Calcular e interpretar la autocorrelación (ACF) y la autocorrelación parcial',
      'Decidir si una serie es estacionaria y hacerla estacionaria diferenciando',
      'Descomponer una serie en tendencia, estacionalidad y residuo',
      'Preparar ventanas de entrada y horizonte para un modelo',
    ],
  },
  {
    slug: 'transformers-series',
    title: 'Transformers para series temporales',
    part: 2,
    summary: 'Tokenizar valores reales: Chronos (escalado y cuantización), PatchTST (parches), TimesFM y AnomalyBERT.',
    objectives: [
      'Tokenizar una serie al estilo Chronos: escalado por la media y cuantización en cubetas',
      'Partir una serie en parches como PatchTST y contar cuántos tokens ahorra',
      'Distinguir pronóstico probabilístico, decoder-only (TimesFM) y detección de anomalías',
      'Evaluar un pronóstico con MAE, MASE y cuantiles',
    ],
  },
  {
    slug: 'vision-transformers',
    title: 'Vision transformers: ViT y Swin',
    part: 2,
    summary: 'Imágenes como secuencias de parches, el token [CLS] y la atención por ventanas desplazadas.',
    objectives: [
      'Convertir una imagen en parches y proyectarlos a embeddings',
      'Calcular el número de tokens y el coste de la atención para una imagen',
      'Explicar la atención por ventanas y las ventanas desplazadas de Swin',
      'Conocer las estrategias de aumento de datos y regularización para visión',
    ],
  },
  {
    slug: 'segmentacion-sam',
    title: 'Segmentación con Segment Anything',
    part: 2,
    summary: 'Encoder de imagen, codificador de prompts y decodificador de máscaras; de imágenes a vídeo y conceptos.',
    objectives: [
      'Describir las tres piezas de SAM y por qué el encoder se ejecuta una sola vez',
      'Codificar un punto o una caja como prompt',
      'Medir una máscara con IoU y Dice',
      'Explicar la memoria de SAM 2 para vídeo y los prompts de concepto de SAM 3',
    ],
  },
  {
    slug: 'difusion',
    title: 'Modelos de difusión',
    part: 2,
    summary: 'Añadir ruido poco a poco y aprender a quitarlo: DDPM, el programa de ruido y la guía sin clasificador.',
    objectives: [
      'Muestrear x_t directamente a partir de x_0 con el truco de reparametrización',
      'Escribir la pérdida de predicción de ruido',
      'Ejecutar el muestreo inverso paso a paso',
      'Aplicar classifier-free guidance y entender su escala',
    ],
  },
  {
    slug: 'dit-video',
    title: 'Transformers de difusión: imagen y vídeo',
    part: 2,
    summary: 'DiT, adaLN, difusión latente, PixArt y la generación de vídeo con atención espacio-temporal.',
    objectives: [
      'Explicar cómo DiT sustituye la U-Net por un transformer sobre parches latentes',
      'Implementar la modulación adaLN-Zero',
      'Calcular cuánto reduce el coste trabajar en el espacio latente',
      'Comparar la atención espacio-temporal completa con la factorizada en vídeo',
    ],
  },
  {
    slug: 'audio-senales',
    title: 'Del sonido a la señal: ondas y espectrogramas',
    part: 2,
    summary: 'Muestreo, Nyquist, cuantización, transformada de Fourier, STFT y espectrograma mel.',
    objectives: [
      'Elegir una frecuencia de muestreo con el teorema de Nyquist',
      'Calcular un espectro con la FFT',
      'Construir un espectrograma con la STFT y entender el compromiso tiempo-frecuencia',
      'Convertir hercios a mels y construir un banco de filtros mel',
    ],
  },
  {
    slug: 'audio-transformers',
    title: 'Transformers de audio: Whisper y más allá',
    part: 2,
    summary: 'Whisper, tokens de audio con códecs neuronales, modelos fundacionales de audio y generación de música.',
    objectives: [
      'Describir el pipeline de Whisper: log-mel, encoder, decoder y tokens de tarea',
      'Explicar la cuantización vectorial residual (RVQ) de los códecs de audio',
      'Calcular la tasa de tokens de audio por segundo',
      'Distinguir los modelos de audio de comprensión, de generación y conversacionales',
    ],
  },
  // ── Parte 3 · Decisión y razonamiento ────────────────────────────────────
  {
    slug: 'rl-decision-transformer',
    title: 'Aprendizaje por refuerzo y Decision Transformer',
    part: 3,
    summary: 'Conceptos de RL y cómo convertir el control en un problema de modelado de secuencias.',
    objectives: [
      'Distinguir RL online y offline, con y sin modelo, on-policy y off-policy',
      'Calcular retornos descontados y el return-to-go',
      'Aplicar una actualización de diferencias temporales (TD)',
      'Construir la secuencia (R̂, s, a) que modela Decision Transformer',
    ],
  },
  {
    slug: 'world-models',
    title: 'Modelos del mundo con transformers',
    part: 3,
    summary: 'Aprender la dinámica del entorno e imaginar trayectorias; codificación predictiva contrastiva (TWISTER).',
    objectives: [
      'Explicar qué aprende un modelo del mundo y para qué sirve imaginar',
      'Entrenar un modelo de transición sencillo y planificar con él',
      'Calcular la pérdida contrastiva InfoNCE',
      'Describir el Online Decision Transformer y los modelos del mundo estocásticos',
    ],
  },
  {
    slug: 'razonamiento',
    title: 'Modelos de razonamiento y cómputo en test',
    part: 3,
    summary: 'RL con recompensas verificables (GRPO), modos de pensamiento y escalado en inferencia con búsqueda.',
    objectives: [
      'Calcular las ventajas relativas al grupo de GRPO',
      'Comparar best-of-N, votación por mayoría y búsqueda en árbol',
      'Aplicar la fórmula UCT de Monte Carlo Tree Search',
      'Explicar el pensamiento con presupuesto y el razonamiento agéntico para código',
    ],
  },
  {
    slug: 'agentes',
    title: 'Agentes de IA',
    part: 3,
    summary: 'Bucle percibir-razonar-actuar, herramientas, flujos multi-agente, contexto, memoria y humano en el bucle.',
    objectives: [
      'Implementar un bucle ReAct con herramientas',
      'Comparar los patrones de flujo: cadena, enrutador, orquestador-trabajadores, evaluador-optimizador',
      'Gestionar el contexto y la memoria de un agente',
      'Diseñar puntos de aprobación humana',
    ],
  },
  // ── Parte 4 · Producción ─────────────────────────────────────────────────
  {
    slug: 'optimizacion',
    title: 'Optimizar LLMs y agentes',
    part: 4,
    summary: 'RL para agentes con recompensas relativas (RULER/ART), cómputo adaptativo y el optimizador Muon.',
    objectives: [
      'Convertir juicios relativos en ventajas para entrenar un agente',
      'Penalizar el razonamiento innecesariamente largo',
      'Ortogonalizar una actualización con la iteración de Newton–Schulz (Muon)',
      'Explicar la sincronización de pesos entre entrenamiento e inferencia',
    ],
  },
  {
    slug: 'despliegue',
    title: 'Desplegar transformers',
    part: 4,
    summary: 'Abierto o cerrado, memoria y latencia de un decoder, cuantización, LoRA y coste por token.',
    objectives: [
      'Estimar la memoria de pesos y de KV cache de un modelo',
      'Cuantizar pesos a INT8 e INT4 y medir el error',
      'Calcular cuántos parámetros entrena LoRA',
      'Comparar el coste por millón de tokens entre opciones de despliegue',
    ],
  },
  {
    slug: 'sistemas-inteligentes',
    title: 'De modelos a sistemas inteligentes',
    part: 4,
    summary: 'Combinar capacidades (SAM 3 como herramienta de un agente) y la ciencia de escalar sistemas agénticos.',
    objectives: [
      'Componer un modelo de visión y un LLM en un agente',
      'Estimar la fiabilidad de una cadena de pasos',
      'Razonar sobre cuándo añadir agentes ayuda y cuándo perjudica',
      'Trazar un mapa de todo el curso: qué cambia y qué se mantiene entre dominios',
    ],
  },
]

export const stages: Stage[] = STAGE_DEFS.map((s, i) => ({ ...s, n: i + 1 }))

type MdxModule = { default: ComponentType }

const stageModules = import.meta.glob<MdxModule>('./stages/*.mdx')

/** Devuelve el cargador del MDX del módulo, o undefined si aún no existe. */
export function stageLoader(stage: Stage): (() => Promise<MdxModule>) | undefined {
  return stageModules[`./stages/${stage.slug}.mdx`]
}

export function getStage(slug: string | undefined): Stage | undefined {
  return stages.find((s) => s.slug === slug)
}

/** Igual que getStage, pero lanza un error si el slug no existe (para referencias escritas a mano). */
export function stageBySlug(slug: string): Stage {
  const s = getStage(slug)
  if (!s) throw new Error(`No existe el módulo «${slug}»`)
  return s
}

export function neighbors(stage: Stage): { prev?: Stage; next?: Stage } {
  const i = stage.n - 1
  return { prev: stages[i - 1], next: stages[i + 1] }
}
