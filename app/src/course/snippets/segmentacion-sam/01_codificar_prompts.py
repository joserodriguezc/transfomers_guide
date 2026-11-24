# Codificar prompts dispersos como SAM: características de Fourier aleatorias de las coordenadas
import numpy as np

rng = np.random.default_rng(0)
D = 16
B = rng.normal(size=(2, D // 2)) * 1.0           # matriz gaussiana fija (no se entrena)


def pos_fourier(xy):
    """xy normalizadas a [0, 1]. Devuelve un vector de D dimensiones."""
    proy = 2 * np.pi * (2 * np.asarray(xy) - 1) @ B
    return np.concatenate([np.sin(proy), np.cos(proy)])


tipo = {"punto+": rng.normal(size=D) * .1, "punto-": rng.normal(size=D) * .1,
        "esquina1": rng.normal(size=D) * .1, "esquina2": rng.normal(size=D) * .1}

punto = pos_fourier([0.30, 0.55]) + tipo["punto+"]          # clic positivo
caja = np.stack([pos_fourier([0.2, 0.4]) + tipo["esquina1"],
                 pos_fourier([0.6, 0.8]) + tipo["esquina2"]])  # una caja = 2 tokens
print("token del punto:", punto.shape, " tokens de la caja:", caja.shape)
# Dos puntos cercanos tienen codificaciones parecidas; dos lejanos, no
c = lambda a, b: a @ b / np.linalg.norm(a) / np.linalg.norm(b)
print("coseno vecinos:", c(pos_fourier([.3, .55]), pos_fourier([.32, .56])).round(2),
      " lejanos:", c(pos_fourier([.3, .55]), pos_fourier([.9, .1])).round(2))
