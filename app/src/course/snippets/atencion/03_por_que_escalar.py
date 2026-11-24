# Por qué dividir por √d_k: la varianza de q·k crece con d_k y satura la softmax
import numpy as np

rng = np.random.default_rng(0)
for d_k in [4, 64, 512]:
    q = rng.normal(size=(10000, d_k))
    k = rng.normal(size=(10000, d_k))
    dots = (q * k).sum(1)
    print(f"d_k = {d_k:3d}: var(q·k) = {dots.var():7.1f}   var(q·k/√d_k) = {(dots / np.sqrt(d_k)).var():.2f}")

# Efecto sobre la softmax de 8 keys
logits = rng.normal(size=8) * np.sqrt(512)
p = np.exp(logits - logits.max())
p /= p.sum()
print("sin escalar, peso máximo:", p.max().round(4))
p2 = np.exp(logits / np.sqrt(512) - (logits / np.sqrt(512)).max())
p2 /= p2.sum()
print("escalado,    peso máximo:", p2.max().round(4))
