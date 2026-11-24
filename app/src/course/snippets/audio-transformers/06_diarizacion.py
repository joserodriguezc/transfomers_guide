# Diarización: ¿quién habla cuándo? Agrupar embeddings de hablante por tramos
import numpy as np

rng = np.random.default_rng(1)
voz = {"A": rng.normal(size=16), "B": rng.normal(size=16)}
guion = ["A"] * 6 + ["B"] * 4 + ["A"] * 3 + ["B"] * 5           # tramos de 1.5 s
E = np.array([voz[s] + rng.normal(0, 0.6, 16) for s in guion])
E /= np.linalg.norm(E, axis=1, keepdims=True)

# k-means con k = 2 sobre los embeddings normalizados (similitud coseno)
C = E[[0, -1]].copy()
for _ in range(10):
    etiqueta = (E @ C.T).argmax(1)
    C = np.array([E[etiqueta == k].mean(0) for k in range(2)])
    C /= np.linalg.norm(C, axis=1, keepdims=True)

segmentos, inicio = [], 0
for i in range(1, len(etiqueta) + 1):
    if i == len(etiqueta) or etiqueta[i] != etiqueta[inicio]:
        segmentos.append((inicio * 1.5, i * 1.5, f"HABLANTE_{etiqueta[inicio]}"))
        inicio = i
for a, b, s in segmentos:
    print(f"{a:5.1f}–{b:5.1f} s  {s}")
