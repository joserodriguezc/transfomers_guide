# Tokenizar una serie como Chronos: escalado por la media absoluta + cuantización uniforme
import numpy as np

rng = np.random.default_rng(0)
contexto = 200 + 30 * np.sin(np.arange(96) / 6) + rng.normal(0, 3, 96)   # p. ej. demanda horaria

# 1) Escalado por la media (mean scaling): divide por la media de los valores absolutos del contexto
s = np.abs(contexto).mean()
x = contexto / s

# 2) Cuantización: B cubetas uniformes en [-15, 15] (Chronos usa 4094 + 2 tokens especiales = 4096)
B, lo, hi = 4094, -15.0, 15.0
bordes = np.linspace(lo, hi, B + 1)
centros = (bordes[:-1] + bordes[1:]) / 2
ids = np.clip(np.digitize(x, bordes) - 1, 0, B - 1)

# 3) Decuantizar: centro de la cubeta y deshacer el escalado
reconstruida = centros[ids] * s
print("escala s =", s.round(2))
print("primeros tokens:", ids[:8])
print("error máximo de cuantizar:", np.abs(reconstruida - contexto).max().round(3),
      " (anchura de cubeta × s =", ((hi - lo) / B * s).round(3), ")")
