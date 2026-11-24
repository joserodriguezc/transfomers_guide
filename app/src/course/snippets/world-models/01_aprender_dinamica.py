# Aprender un modelo del mundo: predecir el siguiente estado a partir del estado y la acción
import numpy as np

rng = np.random.default_rng(0)
A_real = np.array([[1.0, 0.1], [0.0, 0.98]])        # posición y velocidad
B_real = np.array([[0.0], [0.1]])                  # la acción es una fuerza


def paso(s, a):
    return A_real @ s + B_real @ a + rng.normal(0, 0.01, 2)


# Datos de interacción con acciones aleatorias
S, A, S2 = [], [], []
s = np.zeros(2)
for _ in range(500):
    a = rng.uniform(-1, 1, 1)
    s2 = paso(s, a)
    S.append(s)
    A.append(a)
    S2.append(s2)
    s = s2 if np.abs(s2).max() < 5 else np.zeros(2)

X = np.hstack([np.array(S), np.array(A)])           # entrada: [s, a]
W, *_ = np.linalg.lstsq(X, np.array(S2), rcond=None)
print("A aprendida:\n", W[:2].T.round(3))
print("B aprendida:", W[2].round(3))
