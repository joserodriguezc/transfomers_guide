# Cointegración: dos series no estacionarias cuya combinación lineal sí lo es
import numpy as np

rng = np.random.default_rng(3)
n = 1000
comun = np.cumsum(rng.normal(size=n))              # tendencia estocástica compartida
a = comun + rng.normal(0, 0.5, n)
b = 2 * comun + 5 + rng.normal(0, 0.5, n)          # cointegrada con a
c = np.cumsum(rng.normal(size=n))                  # otro paseo, independiente

for nombre, y in [("b (cointegrada)", b), ("c (independiente)", c)]:
    beta, alfa = np.polyfit(a, y, 1)
    residuo = y - (beta * a + alfa)
    print(f"{nombre:18s} corr = {np.corrcoef(a, y)[0, 1]:.2f}  beta = {beta:.2f}  "
          f"var(residuo) 1.ª/2.ª mitad = {residuo[:n // 2].var():.1f} / {residuo[n // 2:].var():.1f}")
# Dos paseos independientes pueden tener una correlación alta «espuria»: su residuo no es estable
