# Construir la secuencia de entrada de un Decision Transformer
import numpy as np

rng = np.random.default_rng(1)
T, d_s, d_a, D, K = 8, 4, 2, 16, 3         # episodio de 8 pasos; contexto de K = 3 pasos
s = rng.normal(size=(T, d_s))
a = rng.normal(size=(T, d_a))
r = rng.uniform(0, 1, T)
rtg = np.cumsum(r[::-1])[::-1]

# Una proyección lineal por modalidad + un embedding del paso temporal (compartido por los 3 tokens)
W_R, W_s, W_a = rng.normal(size=(1, D)), rng.normal(size=(d_s, D)), rng.normal(size=(d_a, D))
E_t = rng.normal(size=(T, D)) * 0.1

t0 = 4                                     # ventana de contexto: pasos 4, 5, 6
tokens = []
for t in range(t0, t0 + K):
    tokens += [rtg[t:t + 1] @ W_R + E_t[t], s[t] @ W_s + E_t[t], a[t] @ W_a + E_t[t]]
X = np.stack(tokens)
print("secuencia:", X.shape, "-> 3K tokens:", ["R̂", "s", "a"] * K)
# Con atención causal, la salida en la posición del token s_t predice a_t
print("posiciones de los estados (donde se predice la acción):", list(range(1, 3 * K, 3)))
