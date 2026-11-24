# PatchTST: parches, independencia de canal y normalización por instancia (RevIN)
import numpy as np

rng = np.random.default_rng(1)
lote, canales, L = 4, 3, 512          # 3 variables (p. ej. temperatura, humedad, consumo)
X = rng.normal(size=(lote, canales, L)).cumsum(-1) + rng.uniform(0, 100, size=(lote, canales, 1))

# Normalización por instancia: cada serie se centra y escala con SUS estadísticos (y se deshace al final)
mu, sd = X.mean(-1, keepdims=True), X.std(-1, keepdims=True) + 1e-5
Xn = (X - mu) / sd

# Independencia de canal: cada variable es una serie univariante más del lote
Xc = Xn.reshape(lote * canales, L)

P, S = 16, 8                           # longitud y paso del parche
N = (L - P) // S + 1
idx = np.arange(N)[:, None] * S + np.arange(P)[None, :]
parches = Xc[:, idx]                   # (lote·canales, N, P)
print("parches:", parches.shape, "-> N =", N, "tokens por serie")

D = 128
W_p = rng.normal(size=(P, D)) / np.sqrt(P)
tokens = parches @ W_p                 # proyección lineal de cada parche a D dimensiones
print("tokens para el encoder:", tokens.shape)
print(f"coste de atención: {N}² = {N * N} frente a {L}² = {L * L} sin parches")
