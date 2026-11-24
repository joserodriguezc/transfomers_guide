# Separar d_model en h cabezas: reshape + transpose
import numpy as np

n, d_model, h = 5, 12, 3
d_k = d_model // h
X = np.arange(n * d_model, dtype=float).reshape(n, d_model)

cabezas = X.reshape(n, h, d_k).transpose(1, 0, 2)    # (h, n, d_k)
print("forma por cabezas:", cabezas.shape)
print("cabeza 0, token 0:", cabezas[0, 0])            # columnas 0..3
print("cabeza 1, token 0:", cabezas[1, 0])            # columnas 4..7

juntas = cabezas.transpose(1, 0, 2).reshape(n, d_model)  # y de vuelta
print("¿recupera X?", np.array_equal(juntas, X))
