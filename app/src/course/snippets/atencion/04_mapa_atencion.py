# Un mapa de atención interpretable con proyecciones hechas a mano
import matplotlib.pyplot as plt
import numpy as np

tokens = ["el", "gato", "come", "porque", "tiene", "hambre"]
# Dimensiones del embedding: (es sustantivo, es verbo, es función)
X = np.array([[0, 0, 1], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]], dtype=float)
# Diseñamos W_q y W_k para que los verbos busquen sustantivos y el resto se mire a sí mismo
W_q = np.array([[0, 0, 0], [3, 0, 0], [0, 0, 0]], dtype=float)  # un verbo pregunta «¿sustantivo?»
W_k = np.eye(3)
Q, K = X @ W_q, X @ W_k
S = Q @ K.T + 2 * np.eye(len(tokens)) * (Q.sum(1) == 0)[:, None]
A = np.exp(S - S.max(1, keepdims=True))
A /= A.sum(1, keepdims=True)

plt.imshow(A, cmap="Blues")
plt.xticks(range(6), tokens, rotation=45)
plt.yticks(range(6), tokens)
plt.title("¿A quién atiende cada token?")
plt.colorbar()
plt.show()
print(A.round(2))
