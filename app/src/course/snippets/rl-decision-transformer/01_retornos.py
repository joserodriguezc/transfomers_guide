# Retorno descontado y return-to-go
import numpy as np

r = np.array([0, 0, 1, 0, 0, 5], dtype=float)     # recompensas de un episodio


def descontados(r, gamma):
    G, g = np.zeros_like(r), 0.0
    for t in reversed(range(len(r))):
        g = r[t] + gamma * g
        G[t] = g
    return G


for gamma in [1.0, 0.9, 0.5]:
    print(f"γ = {gamma}: G =", descontados(r, gamma).round(3))
# Return-to-go (Decision Transformer, γ = 1): suma de las recompensas que quedan desde t
rtg = np.cumsum(r[::-1])[::-1]
print("return-to-go:", rtg)
