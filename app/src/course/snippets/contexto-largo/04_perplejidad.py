# Perplejidad: exp de la entropía cruzada media. «Entre cuántas opciones duda el modelo»
import numpy as np

# Probabilidad que el modelo asignó al token correcto en cada posición
seguro = np.array([0.9, 0.8, 0.95, 0.7, 0.85])
sorprendido = np.array([0.2, 0.05, 0.3, 0.01, 0.1])
for nombre, p in [("texto esperado", seguro), ("texto sorprendente", sorprendido)]:
    nll = -np.log(p).mean()
    print(f"{nombre:20s} NLL = {nll:.3f}   PPL = {np.exp(nll):.2f}")

# Un modelo que reparte uniformemente entre V tokens tiene PPL = V
V = 50_000
print("uniforme:", np.exp(-np.log(np.full(10, 1 / V)).mean()))

# Perplejidad con ventana deslizante sobre un texto largo (ventana 4, paso 2)
logp = np.log(np.random.default_rng(0).uniform(0.05, 0.9, size=12))
ventanas = [logp[i:i + 4] for i in range(0, len(logp) - 3, 2)]
print("PPL por ventana:", [round(float(np.exp(-w.mean())), 2) for w in ventanas])
