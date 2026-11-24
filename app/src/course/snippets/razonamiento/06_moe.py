# Mixture of Experts: cada token activa solo k de E expertos
import numpy as np

rng = np.random.default_rng(3)
n_tokens, d, E, k = 8, 16, 8, 2
X = rng.normal(size=(n_tokens, d))
W_gate = rng.normal(size=(d, E))
logits = X @ W_gate
top = np.argsort(-logits, axis=1)[:, :k]                 # los k expertos con mayor puntuación
print("expertos elegidos por token:", top.tolist())
print("carga por experto:", np.bincount(top.ravel(), minlength=E).tolist())

for nombre, total, activos in [("Qwen3-235B-A22B (8 de 128 expertos)", 235, 22), ("Kimi K2", 1000, 32)]:
    print(f"{nombre}: {total} mil M en total, {activos} mil M activos por token ({activos / total:.0%})")
