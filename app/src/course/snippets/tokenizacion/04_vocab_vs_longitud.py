# Compromiso: un vocabulario más grande produce secuencias más cortas
from collections import Counter

import matplotlib.pyplot as plt

texto = ("el modelo aprende a predecir el siguiente token del texto y el texto "
         "se trocea en tokens que el modelo convierte en vectores ") * 3
palabras = Counter(texto.split())
seq = {tuple(w) + ("_",): f for w, f in palabras.items()}

longitudes, tamanos = [], []
vocab = {c for w in seq for c in w}
for _ in range(60):
    total = sum(len(s) * f for s, f in seq.items())
    longitudes.append(total)
    tamanos.append(len(vocab))
    pares = Counter()
    for s, f in seq.items():
        for p in zip(s, s[1:]):
            pares[p] += f
    if not pares:
        break
    a, b = max(pares, key=pares.get)
    vocab.add(a + b)
    nuevo = {}
    for s, f in seq.items():
        out, i = [], 0
        while i < len(s):
            if i < len(s) - 1 and (s[i], s[i + 1]) == (a, b):
                out.append(a + b)
                i += 2
            else:
                out.append(s[i])
                i += 1
        nuevo[tuple(out)] = f
    seq = nuevo

plt.plot(tamanos, longitudes, marker=".")
plt.xlabel("tamaño del vocabulario")
plt.ylabel("tokens necesarios para el texto")
plt.title("Más vocabulario, secuencias más cortas")
plt.show()
print("de", longitudes[0], "a", longitudes[-1], "tokens")
