# Propiedad clave: PE[pos + k] es una rotación de PE[pos] que solo depende de k
import numpy as np

d, base = 8, 10000
w = 1 / base ** (2 * np.arange(d // 2) / d)      # frecuencias


def pe(pos):
    v = np.empty(d)
    v[0::2], v[1::2] = np.sin(pos * w), np.cos(pos * w)
    return v


def rot(k):
    # Matriz diagonal por bloques 2x2: cada par (sin, cos) gira un ángulo k·w_i
    R = np.zeros((d, d))
    for i, wi in enumerate(w):
        c, s = np.cos(k * wi), np.sin(k * wi)
        R[2 * i:2 * i + 2, 2 * i:2 * i + 2] = [[c, s], [-s, c]]
    return R


k = 5
for pos in [0, 10, 37]:
    print(pos, np.allclose(rot(k) @ pe(pos), pe(pos + k)))
