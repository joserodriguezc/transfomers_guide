# Atención multi-cabeza completa con einsum
import numpy as np

rng = np.random.default_rng(0)
n, d_model, h = 6, 16, 4
d_k = d_model // h
X = rng.normal(size=(n, d_model))
W_q, W_k, W_v, W_o = (rng.normal(size=(d_model, d_model)) / np.sqrt(d_model) for _ in range(4))


def softmax(S):
    S = S - S.max(-1, keepdims=True)
    P = np.exp(S)
    return P / P.sum(-1, keepdims=True)


def mha(X):
    # Proyectar y separar cabezas: (h, n, d_k)
    Q, K, V = ((X @ W).reshape(n, h, d_k).transpose(1, 0, 2) for W in (W_q, W_k, W_v))
    S = np.einsum("hqd,hkd->hqk", Q, K) / np.sqrt(d_k)   # (h, n, n): una matriz por cabeza
    P = softmax(S)
    O = np.einsum("hqk,hkd->hqd", P, V)                  # (h, n, d_k)
    O = O.transpose(1, 0, 2).reshape(n, d_model)         # concatenar cabezas
    return O @ W_o, P


Y, P = mha(X)
print("salida:", Y.shape, " pesos:", P.shape)
for i in range(h):
    print(f"cabeza {i}: token 0 atiende sobre todo al token {P[i, 0].argmax()}")
