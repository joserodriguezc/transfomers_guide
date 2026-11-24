# Atención espacio-temporal completa frente a factorizada (espacial y luego temporal), como en Latte
import numpy as np

rng = np.random.default_rng(3)
F, S, D = 8, 16, 8                       # 8 fotogramas, 16 tokens por fotograma
X = rng.normal(size=(F, S, D))


def atencion(x):                          # x: (..., n, D), atención sobre el penúltimo eje
    s = x @ np.swapaxes(x, -1, -2) / np.sqrt(D)
    p = np.exp(s - s.max(-1, keepdims=True))
    return (p / p.sum(-1, keepdims=True)) @ x


completa = atencion(X.reshape(F * S, D)).reshape(F, S, D)          # (F·S)² pares
espacial = atencion(X)                                              # cada fotograma por separado: F·S²
temporal = np.swapaxes(atencion(np.swapaxes(espacial, 0, 1)), 0, 1)  # cada posición a lo largo del tiempo: S·F²
print("pares completa:", (F * S) ** 2, "| factorizada:", F * S * S + S * F * F)
for F_ in [16, 64, 256]:
    print(f"F = {F_:3d}: completa {(F_ * S) ** 2:.1e}  factorizada {F_ * S * S + S * F_ * F_:.1e}")
print(completa.shape, temporal.shape)
