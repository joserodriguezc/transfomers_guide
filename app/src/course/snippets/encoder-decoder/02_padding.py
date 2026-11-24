# Máscara de padding: ninguna query debe atender a las posiciones de relleno
import numpy as np

ids = np.array([[5, 8, 2, 0, 0],        # 0 = [PAD]
                [7, 3, 9, 4, 1]])
real = ids != 0                          # (lote, n)
mascara = np.where(real[:, None, :], 0.0, -np.inf)   # (lote, 1, n): se difunde a todas las queries

rng = np.random.default_rng(1)
S = rng.normal(size=(2, 5, 5)) + mascara
P = np.exp(S - S.max(-1, keepdims=True))
P /= P.sum(-1, keepdims=True)
print(P[0].round(2))                     # columnas 3 y 4 a cero en la primera frase
