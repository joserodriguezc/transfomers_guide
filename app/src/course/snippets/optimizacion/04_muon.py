# Muon: ortogonalizar la actualización con la iteración de Newton–Schulz (sin calcular la SVD)
import numpy as np


def newton_schulz(G, pasos=5):
    a, b, c = 3.4445, -4.7750, 2.0315              # coeficientes de la implementación de referencia
    X = G / (np.linalg.norm(G) + 1e-7)             # normalizar (norma de Frobenius)
    transpuesta = X.shape[0] > X.shape[1]
    if transpuesta:
        X = X.T
    for _ in range(pasos):
        A = X @ X.T
        X = a * X + (b * A + c * A @ A) @ X
    return X.T if transpuesta else X


rng = np.random.default_rng(0)
G = rng.normal(size=(64, 32)) @ np.diag(np.logspace(0, 1.5, 32)) @ rng.normal(size=(32, 32))  # muy anisotrópico
print("valores singulares del gradiente:  ", np.linalg.svd(G, compute_uv=False)[[0, 8, 16, 31]].round(1))
O = newton_schulz(G)
print("tras Newton–Schulz (≈ 1):          ", np.linalg.svd(O, compute_uv=False)[[0, 8, 16, 31]].round(2))
U, _, Vt = np.linalg.svd(G, full_matrices=False)
print("parecido con U·Vᵀ (coseno):", (np.sum(O * (U @ Vt)) / np.linalg.norm(O) / np.linalg.norm(U @ Vt)).round(3))

# Un paso de Muon: momento + ortogonalización + escala
W, M, lr, beta = rng.normal(size=(64, 32)) * 0.02, np.zeros((64, 32)), 0.02, 0.95
M = beta * M + G
W -= lr * newton_schulz(M) * np.sqrt(max(1, W.shape[0] / W.shape[1]))
print("norma de la actualización:", np.linalg.norm(lr * newton_schulz(M)).round(4))
