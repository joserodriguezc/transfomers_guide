# GRPO: la ventaja de cada respuesta se mide respecto a su propio grupo (sin crítico)
import numpy as np

grupos = {
    "pregunta fácil": np.array([1, 1, 1, 0, 1, 1, 1, 1], dtype=float),
    "pregunta media": np.array([1, 0, 0, 1, 0, 1, 0, 0], dtype=float),
    "pregunta imposible": np.zeros(8),
}
for nombre, r in grupos.items():
    sd = r.std()
    A = (r - r.mean()) / sd if sd > 0 else np.zeros_like(r)
    print(f"{nombre:18s} recompensas {r.astype(int)}  ventajas {A.round(2)}")
print("Sin variación dentro del grupo no hay señal de aprendizaje: el currículo de dificultad importa.")
