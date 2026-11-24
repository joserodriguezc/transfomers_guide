# Partir un mapa de parches en ventanas y desplazarlas (Swin)
import numpy as np

mapa = np.arange(8 * 8).reshape(8, 8)            # 8×8 parches numerados
M = 4


def ventanas(x, M):
    h, w = x.shape
    return x.reshape(h // M, M, w // M, M).transpose(0, 2, 1, 3).reshape(-1, M, M)


v = ventanas(mapa, M)
print("ventanas normales:", v.shape)
print(v[0])
# Desplazar medio tamaño de ventana (desplazamiento cíclico): ahora cada ventana cruza bordes anteriores
desplazado = np.roll(mapa, shift=(-M // 2, -M // 2), axis=(0, 1))
print("primera ventana tras desplazar:\n", ventanas(desplazado, M)[0])
