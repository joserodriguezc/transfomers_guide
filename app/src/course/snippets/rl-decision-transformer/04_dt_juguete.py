# Decision Transformer en miniatura: condicionar al retorno deseado cambia el comportamiento
import numpy as np

rng = np.random.default_rng(2)
# Datos offline de un bandido de 3 brazos jugado al azar: brazo 0 da ~1, brazo 1 da ~5, brazo 2 da ~9
recompensa_media = np.array([1.0, 5.0, 9.0])
acciones = rng.integers(0, 3, 3000)
retornos = recompensa_media[acciones] + rng.normal(0, 1, 3000)

# «Modelo» supervisado: p(a | R̂) estimada agrupando por retorno (lo que un DT aprende con atención y MLP)
bordes = np.linspace(-2, 12, 15)
grupo = np.digitize(retornos, bordes)
p = np.array([np.bincount(acciones[grupo == g], minlength=3) for g in range(len(bordes) + 1)], float)
p /= p.sum(1, keepdims=True).clip(1)

for objetivo in [1, 5, 9]:
    g = np.digitize([objetivo], bordes)[0]
    print(f"retorno pedido {objetivo}: acción más probable = brazo {p[g].argmax()} (p = {p[g].max():.2f})")
