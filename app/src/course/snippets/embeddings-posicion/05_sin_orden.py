# Sin posiciones, la atención no distingue el orden: permutar la entrada solo permuta la salida
import numpy as np

rng = np.random.default_rng(1)
X = rng.normal(size=(4, 3))                       # 4 tokens


def atencion(X):
    S = X @ X.T / np.sqrt(X.shape[1])
    P = np.exp(S - S.max(1, keepdims=True))
    P /= P.sum(1, keepdims=True)
    return P @ X


perm = [2, 0, 3, 1]
print("¿atención(X[perm]) == atención(X)[perm]?", np.allclose(atencion(X[perm]), atencion(X)[perm]))

# Al sumar posiciones, el mismo token en otro lugar produce otra representación
pos = 0.5 * np.sin(np.arange(4)[:, None] * np.array([[1.0, 0.3, 0.1]]))
print("con posiciones:", np.allclose(atencion((X + pos)[perm]), atencion(X + pos)[perm]))
