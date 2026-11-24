# Sin conexiones residuales, una pila profunda pierde la señal; con ellas, la conserva
import numpy as np

rng = np.random.default_rng(1)
d, L = 64, 48
Ws = [rng.normal(size=(d, d)) / np.sqrt(d) * 0.6 for _ in range(L)]
x0 = rng.normal(size=d)


def capa(x, W):
    return np.tanh(x @ W)


sin, con = x0.copy(), x0.copy()
for W in Ws:
    sin = capa(sin, W)
    con = con + capa(con / np.sqrt((con ** 2).mean()), W)   # pre-norm + residual
print("norma tras 48 capas sin residuales:", np.linalg.norm(sin).round(6))
print("norma tras 48 capas con residuales:", np.linalg.norm(con).round(2))
print("coseno con la entrada (con residuales):", (con @ x0 / np.linalg.norm(con) / np.linalg.norm(x0)).round(3))
