# Cuantización vectorial residual (RVQ): la idea de los códecs neuronales (EnCodec, Mimi, SoundStream)
import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(2000, 8))                   # «embeddings» de tramas de audio


def kmeans(Z, K, iters=15):
    C = Z[rng.choice(len(Z), K, replace=False)]
    for _ in range(iters):
        asign = ((Z[:, None] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([Z[asign == k].mean(0) if np.any(asign == k) else C[k] for k in range(K)])
    return C


K, niveles = 64, 4
residuo, recon, codigos = X.copy(), np.zeros_like(X), []
for nivel in range(niveles):
    libro = kmeans(residuo, K)                              # un libro de códigos por nivel
    idx = ((residuo[:, None] - libro[None]) ** 2).sum(-1).argmin(1)
    recon += libro[idx]
    residuo = X - recon
    codigos.append(idx)
    print(f"nivel {nivel + 1}: error relativo {np.linalg.norm(residuo) / np.linalg.norm(X):.3f}")
print("códigos de la primera trama:", [int(c[0]) for c in codigos])
print("bits por trama:", niveles * int(np.log2(K)))
