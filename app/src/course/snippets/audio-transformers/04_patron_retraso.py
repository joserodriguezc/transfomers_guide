# MusicGen: el «patrón de retraso» intercala los libros de códigos para generar en una sola pasada por paso
import numpy as np

libros, pasos = 4, 6
# Sin retraso habría que predecir los 4 códigos del paso t a la vez (o 4 veces más pasos si se aplanan).
# Con retraso, el libro k se desplaza k posiciones: cada paso predice 4 códigos de instantes distintos.
patron = np.full((libros, pasos + libros - 1), "  .  ", dtype=object)
for k in range(libros):
    for t in range(pasos):
        patron[k, t + k] = f"c{k}[{t}]"
for k in range(libros):
    print(f"libro {k}: " + " ".join(patron[k]))
print(f"pasos de generación: {pasos + libros - 1} (frente a {pasos * libros} aplanando)")
