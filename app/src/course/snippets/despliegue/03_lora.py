# LoRA: ajustar un modelo entrenando solo dos matrices pequeñas por capa
import numpy as np

rng = np.random.default_rng(1)
d, r, alpha = 512, 8, 16
W = rng.normal(0, 0.02, (d, d))                   # pesos preentrenados, congelados
A = rng.normal(0, 0.01, (r, d))                   # se inicializa aleatoria
B = np.zeros((d, r))                              # se inicializa a cero: al principio no cambia nada
x = rng.normal(size=d)

y0 = W @ x + (alpha / r) * B @ (A @ x)
print("al inicio, ¿salida = modelo original?", np.allclose(y0, W @ x))

B = rng.normal(0, 0.01, (d, r))                   # tras entrenar
y = W @ x + (alpha / r) * B @ (A @ x)
W_fusionada = W + (alpha / r) * B @ A            # para servir, se puede fusionar: coste de inferencia cero
print("¿fusionar da lo mismo?", np.allclose(W_fusionada @ x, y))
print(f"parámetros entrenables: {A.size + B.size:,} de {W.size:,} ({(A.size + B.size) / W.size:.1%})")
# QLoRA: W se guarda en 4 bits y solo A y B (y sus estados del optimizador) en 16/32 bits
print("memoria de W en INT4:", W.size * 0.5 / 1e6, "MB frente a", W.size * 2 / 1e6, "MB en FP16")
