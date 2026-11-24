# Swin V2: atención por coseno escalado y sesgo posicional log-espaciado
import numpy as np

rng = np.random.default_rng(2)
q, k = rng.normal(size=(4, 32)) * 8, rng.normal(size=(4, 32)) * 8   # activaciones grandes

dot = q @ k.T / np.sqrt(32)
qn = q / np.linalg.norm(q, axis=1, keepdims=True)
kn = k / np.linalg.norm(k, axis=1, keepdims=True)
tau = 0.1
cos_att = (qn @ kn.T) / tau                       # acotada en [-1/τ, 1/τ]
print("rango producto punto:", dot.min().round(1), dot.max().round(1))
print("rango coseno/τ:      ", cos_att.min().round(1), cos_att.max().round(1))

# Coordenadas log-espaciadas: la distancia 63 se «parece» mucho más a la 15 que en escala lineal
for d in [1, 7, 15, 63]:
    print(f"Δ = {d:2d} -> log-espaciado {np.sign(d) * np.log1p(abs(d)):.2f}")
