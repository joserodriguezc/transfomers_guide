# TimesFM: decoder-only con parches de entrada (32) más cortos que los de salida (128)
import math

p_in, p_out = 32, 128
contexto, horizonte = 512, 512
tokens_in = contexto // p_in
pasos_mismo = math.ceil(horizonte / p_in)
pasos_largo = math.ceil(horizonte / p_out)
print(f"contexto {contexto} -> {tokens_in} tokens de entrada")
print(f"pronosticar {horizonte} pasos: {pasos_mismo} pasos autorregresivos con parches de salida de 32,"
      f" pero solo {pasos_largo} con parches de 128")

# Enmascaramiento aleatorio en entrenamiento: ocultar los primeros r puntos del primer parche
# hace que el modelo vea todas las longitudes de contexto posibles (512, 511, ..., 481, ...)
import numpy as np

rng = np.random.default_rng(0)
for _ in range(3):
    r = rng.integers(0, p_in)
    mascara = np.zeros(contexto, dtype=int)
    mascara[:r] = 1                     # 1 = oculto
    print(f"r = {r:2d}: el modelo ve {contexto - r} puntos de contexto")
