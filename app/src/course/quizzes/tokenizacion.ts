import type { Question } from '../../components/quiz/quizEngine'

export const quiz: Question[] = [
  {
    type: 'choice',
    prompt: '¿Qué ventaja principal tiene la tokenización por subpalabras frente a la tokenización por palabras?',
    options: [
      'Produce siempre secuencias más cortas',
      'Puede representar palabras nunca vistas combinando trozos conocidos, con un vocabulario de tamaño fijo',
      'No necesita entrenamiento',
      'Hace que el modelo entienda la gramática',
    ],
    answer: 1,
    explanation: 'Las palabras raras se descomponen en subpalabras frecuentes (`jugamos` → `j u g amos`), así que no hay «token desconocido» y el vocabulario no crece sin control.',
  },
  {
    type: 'numeric',
    prompt: 'Un tokenizador BPE parte de los 256 bytes posibles y aplica 49 744 fusiones. ¿Cuántos tokens tiene su vocabulario (sin contar tokens especiales)?',
    answer: 50000,
    tolerance: 0,
    explanation: '$N_v = |\\Sigma_0| + k = 256 + 49\\,744 = 50\\,000$. Cada fusión añade exactamente un símbolo.',
  },
  {
    type: 'choice',
    prompt: 'Corpus: `ana` (×5), `nana` (×2). Con la segmentación en caracteres, ¿qué par fusiona primero BPE (sin marcador de fin de palabra)?',
    options: ['(a, n)', '(n, a)', 'Empatan (a, n) y (n, a)', '(n, n)'],
    answer: 1,
    explanation: '`ana` aporta (a,n) y (n,a) una vez cada uno ×5. `nana` aporta (n,a) dos veces y (a,n) una vez, ×2. Total: $(a,n) = 5 + 2 = 7$ y $(n,a) = 5 + 4 = 9$.',
  },
  {
    type: 'numeric',
    prompt: 'Un texto de 1200 palabras ocupa 1680 tokens. ¿Cuál es la fertilidad del tokenizador en ese texto?',
    answer: 1.4,
    explanation: '$1680 / 1200 = 1.4$ tokens por palabra. En idiomas poco representados en el corpus del tokenizador puede pasar de 2.',
  },
  {
    type: 'choice',
    prompt: '¿Por qué los tokenizadores de GPT, Llama o Qwen parten de bytes UTF-8 en lugar de caracteres?',
    options: [
      'Porque los bytes son más rápidos de comparar',
      'Porque con 256 símbolos base cualquier texto (cualquier idioma, emoji o símbolo) es representable',
      'Porque los caracteres no se pueden fusionar',
      'Porque así las secuencias son más cortas',
    ],
    answer: 1,
    explanation: 'Unicode tiene más de 150 000 caracteres; los bytes son solo 256. Un emoji que nunca apareció en el entrenamiento se representa con sus 4 bytes.',
  },
  {
    type: 'matrix',
    prompt: 'Vocabulario: [PAD]=0, [CLS]=1, [SEP]=2, hola=3, mundo=4, adiós=5. Escribe el lote con dos frases, «hola mundo» y «adiós», cada una con [CLS] al principio, [SEP] al final y padding hasta la misma longitud.',
    answer: [
      [1, 3, 4, 2],
      [1, 5, 2, 0],
    ],
    tolerance: 0,
    explanation: 'La segunda frase tiene 3 tokens y se rellena con un [PAD] (0) para llegar a 4. La máscara de atención sería [[1,1,1,1],[1,1,1,0]].',
  },
  {
    type: 'choice',
    prompt: 'Al aumentar el tamaño del vocabulario de un tokenizador BPE (todo lo demás igual)…',
    options: [
      'las secuencias se alargan y la matriz de embeddings encoge',
      'las secuencias se acortan y la matriz de embeddings crece',
      'no cambia nada para el modelo',
      'el modelo deja de poder representar caracteres sueltos',
    ],
    answer: 1,
    explanation: 'Más fusiones = tokens más largos = menos tokens por texto; pero cada token necesita su fila en la matriz de embeddings (y en la capa de salida).',
  },
]
