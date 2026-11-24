# Codificación posicional sinusoidal del transformer original
import matplotlib.pyplot as plt
import numpy as np


def pe_sinusoidal(n_pos, d, base=10000):
    pos = np.arange(n_pos)[:, None]              # (n_pos, 1)
    i = np.arange(d // 2)[None, :]               # (1, d/2)
    ang = pos / base ** (2 * i / d)              # (n_pos, d/2)
    PE = np.zeros((n_pos, d))
    PE[:, 0::2] = np.sin(ang)                    # dimensiones pares
    PE[:, 1::2] = np.cos(ang)                    # dimensiones impares
    return PE


PE = pe_sinusoidal(64, 32)
print(PE[:3, :6].round(3))
plt.imshow(PE.T, aspect="auto", cmap="RdBu")
plt.xlabel("posición")
plt.ylabel("dimensión")
plt.colorbar()
plt.title("Codificación posicional sinusoidal")
plt.show()
