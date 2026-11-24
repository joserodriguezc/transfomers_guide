# Aplicar RoPE sin construir la matriz: rotar cada par de componentes
import numpy as np


def rope(x, pos, base=10000):
    """x: (n, d) con d par; pos: (n,) posiciones (pueden ser fraccionarias)."""
    d = x.shape[-1]
    theta = base ** (-2 * np.arange(d // 2) / d)
    ang = pos[:, None] * theta[None, :]            # (n, d/2)
    c, s = np.cos(ang), np.sin(ang)
    x1, x2 = x[:, 0::2], x[:, 1::2]
    out = np.empty_like(x)
    out[:, 0::2] = x1 * c - x2 * s
    out[:, 1::2] = x1 * s + x2 * c
    return out


rng = np.random.default_rng(0)
q, k = rng.normal(size=(1, 64)), rng.normal(size=(1, 64))
for m, n in [(0, 5), (100, 105), (2000, 2005)]:
    s = (rope(q, np.array([m])) @ rope(k, np.array([n])).T).item()
    print(f"m = {m:4d}, n = {n:4d}  ->  q·k = {s:.6f}")     # igual: solo importa n − m
print("¿conserva la norma?", np.isclose(np.linalg.norm(rope(q, np.array([7]))), np.linalg.norm(q)))
