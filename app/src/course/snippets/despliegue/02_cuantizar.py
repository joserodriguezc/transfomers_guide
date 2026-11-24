# Cuantización simétrica de pesos: por tensor frente a por grupos, y el problema de los valores atípicos
import numpy as np

rng = np.random.default_rng(0)
W = rng.normal(0, 0.02, size=(256, 256))
W[3, 7] = 0.6                                       # un valor atípico (outlier), habitual en LLMs


def cuantizar(x, bits):
    qmax = 2 ** (bits - 1) - 1
    escala = np.abs(x).max() / qmax
    q = np.clip(np.round(x / escala), -qmax - 1, qmax)
    return q * escala


def por_grupos(W, bits, g=64):
    filas = W.reshape(-1, g)                        # grupos de 64 pesos consecutivos, cada uno con su escala
    return np.vstack([cuantizar(f, bits) for f in filas]).reshape(W.shape)


for bits in [8, 4]:
    e_tensor = np.mean((W - cuantizar(W, bits)) ** 2)
    e_grupo = np.mean((W - por_grupos(W, bits)) ** 2)
    ceros = np.mean(cuantizar(W, bits) == 0)
    print(f"INT{bits}: ECM por tensor {e_tensor:.2e} ({ceros:.0%} de pesos a 0) | por grupos {e_grupo:.2e}")
print("memoria INT4 por grupos de 64 con escala FP16:", 4 + 16 / 64, "bits por peso")
