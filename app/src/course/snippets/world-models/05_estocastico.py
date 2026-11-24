# Por qué un modelo del mundo estocástico: un entorno con dos futuros posibles
import numpy as np

rng = np.random.default_rng(3)
# Al pulsar el botón, la puerta se abre a la izquierda (−1) o a la derecha (+1) con prob. 0.5
futuros = rng.choice([-1.0, 1.0], size=1000)

determinista = futuros.mean()                      # minimiza el error cuadrático: predice la media
print(f"modelo determinista predice {determinista:+.2f}: un estado que nunca ocurre")

# Modelo con latente categórico (como STORM o DreamerV3): predice una distribución sobre clases
clases = np.array([-1.0, 1.0])
p = np.array([(futuros == c).mean() for c in clases])
muestras = rng.choice(clases, size=8, p=p)
print("modelo categórico: p =", p.round(2), "-> imaginaciones:", muestras)
