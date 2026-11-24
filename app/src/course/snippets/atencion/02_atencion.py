# Atención por producto escalado desde cero
import numpy as np

rng = np.random.default_rng(0)
n, d_model, d_k = 4, 8, 4                 # 4 tokens, embeddings de 8, queries/keys de 4
X = rng.normal(size=(n, d_model))         # una fila por token

W_q = rng.normal(size=(d_model, d_k)) / np.sqrt(d_model)
W_k = rng.normal(size=(d_model, d_k)) / np.sqrt(d_model)
W_v = rng.normal(size=(d_model, d_k)) / np.sqrt(d_model)

Q, K, V = X @ W_q, X @ W_k, X @ W_v       # (n, d_k) cada una
S = Q @ K.T / np.sqrt(d_k)                # (n, n): puntuación de cada par (query, key)
A = np.exp(S - S.max(1, keepdims=True))
A /= A.sum(1, keepdims=True)              # softmax por filas
Y = A @ V                                 # (n, d_k): media ponderada de los values

print("pesos de atención:\n", A.round(3))
print("cada fila suma:", A.sum(1).round(6))
print("forma de la salida:", Y.shape)
