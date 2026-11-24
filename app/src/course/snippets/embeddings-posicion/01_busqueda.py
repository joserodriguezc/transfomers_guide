# Un embedding es una fila de la matriz E: buscarla equivale a multiplicar por un vector one-hot
import numpy as np

rng = np.random.default_rng(0)
N_v, d = 6, 4                      # vocabulario de 6 tokens, embeddings de 4 dimensiones
E = rng.normal(size=(N_v, d)).round(2)

ids = np.array([3, 0, 3, 5])       # una secuencia de 4 tokens
X = E[ids]                         # búsqueda: una fila por token -> forma (4, 4)

one_hot = np.eye(N_v)[ids]         # (4, 6)
print(X)
print("¿one_hot @ E == E[ids]?", np.allclose(one_hot @ E, X))
print("parámetros de la tabla:", E.size)
