# Aprendizaje por diferencias temporales (Q-learning) en un pasillo de 6 casillas
import numpy as np

rng = np.random.default_rng(0)
n, meta = 6, 5                      # estados 0..5; recompensa +10 al llegar a 5, −1 por paso
Q = np.zeros((n, 2))                # acciones: 0 = izquierda, 1 = derecha
alpha, gamma, eps = 0.5, 0.9, 0.2

for episodio in range(200):
    s = 0
    while s != meta:
        a = rng.integers(2) if rng.random() < eps else int(Q[s].argmax())
        s2 = max(0, s - 1) if a == 0 else s + 1
        r = 10 if s2 == meta else -1
        objetivo = r + (0 if s2 == meta else gamma * Q[s2].max())   # bootstrap con la estimación siguiente
        Q[s, a] += alpha * (objetivo - Q[s, a])                      # actualización TD
        s = s2

print(Q.round(2))
print("política:", ["←→"[int(a)] for a in Q[:meta].argmax(1)])
