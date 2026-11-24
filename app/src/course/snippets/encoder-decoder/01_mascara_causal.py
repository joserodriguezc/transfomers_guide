# Máscara causal: el token i solo puede atender a las posiciones j <= i
import numpy as np

n = 5
mascara = np.triu(np.full((n, n), -np.inf), k=1)   # -inf por encima de la diagonal
print(mascara)

rng = np.random.default_rng(0)
S = rng.normal(size=(n, n)) + mascara
P = np.exp(S - S.max(1, keepdims=True))
P /= P.sum(1, keepdims=True)
print(P.round(2))                                    # triangular inferior; cada fila suma 1
