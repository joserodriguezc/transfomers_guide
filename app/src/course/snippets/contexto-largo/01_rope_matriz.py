# La matriz de rotación de RoPE para d = 6 (bloques 2x2 en la diagonal)
import numpy as np


def matriz_rotacion(d, m, base=10000):
    assert d % 2 == 0, "la dimensión debe ser par"
    theta = base ** (-2 * np.arange(d // 2) / d)   # θ_1, ..., θ_{d/2}
    R = np.zeros((d, d))
    for i, t in enumerate(theta):
        c, s = np.cos(m * t), np.sin(m * t)
        R[2 * i:2 * i + 2, 2 * i:2 * i + 2] = [[c, -s], [s, c]]
    return R


np.set_printoptions(precision=4, suppress=True)
print(matriz_rotacion(6, m=1))
# Propiedad relativa: R_mᵀ R_n = R_{n−m}
m, n = 3, 10
print(np.allclose(matriz_rotacion(6, m).T @ matriz_rotacion(6, n), matriz_rotacion(6, n - m)))
