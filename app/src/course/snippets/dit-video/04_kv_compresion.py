# PixArt-Σ: comprimir keys y values (promediando parches vecinos) para imágenes 4K
import numpy as np

rng = np.random.default_rng(2)
h = w = 16
D = 8
# Tokens con estructura espacial suave (los vecinos se parecen, como en una imagen)
base = rng.normal(size=(h // 4, w // 4, D))
X = np.kron(base, np.ones((4, 4, 1)))[:h, :w] + rng.normal(0, 0.1, (h, w, D))
X = X.reshape(h * w, D)


def atencion(Q, K, V):
    S = Q @ K.T / np.sqrt(D)
    P = np.exp(S - S.max(1, keepdims=True))
    return (P / P.sum(1, keepdims=True)) @ V


def comprimir(T, f=2):
    """Promedia bloques de f×f tokens: N -> N/f²."""
    return T.reshape(h // f, f, w // f, f, D).mean((1, 3)).reshape(-1, D)


completo = atencion(X, X, X)
comprimido = atencion(X, comprimir(X), comprimir(X))
print("keys/values:", len(X), "->", len(comprimir(X)), "| pares:", len(X) ** 2, "->", len(X) * len(comprimir(X)))
print("error relativo:", (np.linalg.norm(completo - comprimido) / np.linalg.norm(completo)).round(3))
