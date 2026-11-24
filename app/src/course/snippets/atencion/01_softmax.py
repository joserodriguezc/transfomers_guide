# Softmax estable: restar el máximo no cambia el resultado y evita desbordamientos
import numpy as np


def softmax(z, tau=1.0):
    z = np.asarray(z, dtype=float) / tau
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)


z = np.array([2.0, 1.0, 0.1])
print("softmax:", softmax(z).round(3), "suma =", softmax(z).sum())
print("logits grandes:", softmax(z + 1000).round(3))      # sin restar el máximo, exp(1002) = inf
for tau in [0.25, 1, 4]:
    print(f"τ = {tau:4}: {softmax(z, tau).round(3)}")
