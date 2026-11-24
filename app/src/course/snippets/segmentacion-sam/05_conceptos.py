# SAM 3: un prompt de concepto («taza amarilla») busca TODAS las instancias, con un token de presencia
import numpy as np

rng = np.random.default_rng(3)
D = 32
concepto = {"taza amarilla": rng.normal(size=D), "plato": rng.normal(size=D)}
# Embeddings de 6 regiones candidatas detectadas en la imagen (2 tazas amarillas, 1 plato, 3 de fondo)
regiones = np.stack([concepto["taza amarilla"] + rng.normal(0, .2, D),
                     concepto["taza amarilla"] + rng.normal(0, .2, D),
                     concepto["plato"] + rng.normal(0, .2, D),
                     *rng.normal(size=(3, D))])


def buscar(texto):
    q = concepto[texto]
    s = regiones @ q / (np.linalg.norm(regiones, axis=1) * np.linalg.norm(q))
    presencia = 1 / (1 + np.exp(-8 * (s.max() - 0.6)))     # ¿está el concepto en la imagen?
    instancias = [int(i) for i in np.where(s > 0.6)[0]] if presencia > 0.5 else []
    return presencia, list(instancias)


concepto["tenedor"] = rng.normal(size=D)                # un concepto que NO está en la imagen
for texto in ["taza amarilla", "plato", "tenedor"]:
    p, inst = buscar(texto)
    print(f"«{texto}»: presencia {p:.2f}, instancias {inst}")
