# Monte Carlo Tree Search con UCT: buscar una secuencia de 4 «pasos» con un verificador que puntúa
import math

import numpy as np

rng = np.random.default_rng(2)
OBJETIVO = (3, 1, 4, 1)                 # la solución desconocida
ACCIONES = range(5)


def recompensa(seq):                     # verificador parcial: aciertos en orden (p. ej. tests superados)
    r = 0
    for a, b in zip(seq, OBJETIVO):
        if a != b:
            break
        r += 1
    return r / len(OBJETIVO)


N, W = {}, {}                           # visitas y valor acumulado por nodo (prefijo)


def uct(prefijo, a, c=1.4):
    hijo = prefijo + (a,)
    if N.get(hijo, 0) == 0:
        return math.inf
    return W[hijo] / N[hijo] + c * math.sqrt(math.log(N[prefijo]) / N[hijo])


for it in range(400):
    camino, nodo = [()], ()
    while len(nodo) < 4 and N.get(nodo, 0) > 0:                  # 1. selección
        nodo = nodo + (max(ACCIONES, key=lambda a: uct(nodo, a)),)
        camino.append(nodo)
    simulacion = nodo + tuple(rng.integers(0, 5, 4 - len(nodo)))  # 2-3. expansión y simulación
    r = recompensa(simulacion)
    for n in camino:                                              # 4. retropropagación
        N[n] = N.get(n, 0) + 1
        W[n] = W.get(n, 0) + r

mejor, nodo = [], ()
while len(nodo) < 4:
    nodo = nodo + (max(ACCIONES, key=lambda a: N.get(nodo + (a,), 0)),)
print("secuencia más visitada:", nodo, "| recompensa:", recompensa(nodo), "| nodos explorados:", len(N))
