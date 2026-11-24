# La atención como función reutilizable (la usaremos en los módulos siguientes)
import numpy as np


def atencion(Q, K, V, mascara=None):
    """Q: (n, d_k), K: (m, d_k), V: (m, d_v). Devuelve (salida (n, d_v), pesos (n, m))."""
    S = Q @ K.T / np.sqrt(Q.shape[-1])
    if mascara is not None:
        S = S + mascara                    # -inf donde no se permite atender
    S = S - S.max(-1, keepdims=True)
    P = np.exp(S)
    P /= P.sum(-1, keepdims=True)
    return P @ V, P


# Comprobación: si todas las keys son iguales, la atención es uniforme y la salida es la media de V
Q = np.random.default_rng(2).normal(size=(3, 4))
K = np.ones((5, 4))
V = np.arange(20.0).reshape(5, 4)
Y, P = atencion(Q, K, V)
print(P.round(3))
print(np.allclose(Y, V.mean(0)))
