# Escalar el cómputo en test: best-of-N con verificador frente a votación por mayoría
import numpy as np

rng = np.random.default_rng(1)
p, opciones_erroneas, ensayos = 0.35, 3, 3000          # el modelo acierta el 35 % de las veces
for N in [1, 4, 16, 64]:
    muestras = np.where(rng.random((ensayos, N)) < p, 0, rng.integers(1, opciones_erroneas + 1, (ensayos, N)))
    pass_n = np.mean((muestras == 0).any(1))                       # con un verificador perfecto
    votos = np.array([np.bincount(m, minlength=opciones_erroneas + 1) for m in muestras])
    mayoria = np.mean(votos.argmax(1) == 0)                        # sin verificador
    print(f"N = {N:2d}: pass@N = {pass_n:.2f}   votación = {mayoria:.2f}")
print("La votación ayuda porque la respuesta correcta es la más probable (0.35 > 0.65/3).")
