# Tres formas de trocear la misma frase
frase = "Los transformers transforman la IA."

caracteres = list(frase)
palabras = frase.replace(".", " .").split()
# Subpalabras: un vocabulario de juguete y un troceo voraz (el trozo más largo que esté en el vocabulario)
vocab = {"Los", " trans", "form", "ers", "an", " la", " IA", ".", " "}


def trocear(texto, vocab):
    tokens, i = [], 0
    while i < len(texto):
        for j in range(len(texto), i, -1):  # del trozo más largo al más corto
            if texto[i:j] in vocab or j == i + 1:
                tokens.append(texto[i:j])
                i = j
                break
    return tokens


subpalabras = trocear(frase, vocab)
print(len(caracteres), "caracteres:", caracteres[:8], "...")
print(len(palabras), "palabras:", palabras)
print(len(subpalabras), "subpalabras:", subpalabras)
