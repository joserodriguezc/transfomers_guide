# Online Decision Transformer: buffer de trayectorias y reetiquetado del retorno en retrospectiva
from collections import deque

import numpy as np

rng = np.random.default_rng(3)
offline = [rng.uniform(0, 100) for _ in range(50)]                  # retornos de trayectorias offline
buffer = deque(sorted(offline, reverse=True)[:10], maxlen=10)       # se inicia con las N mejores
print("buffer inicial (media):", round(float(np.mean(buffer)), 1))

objetivo = 120                                                      # se pide más de lo visto: exploración
for ronda in range(5):
    logrado = min(objetivo, max(buffer) + rng.normal(5, 3))         # la política mejora poco a poco
    # Reetiquetado en retrospectiva: la trayectoria se guarda con el retorno que REALMENTE obtuvo
    buffer.append(logrado)                                          # sustituye a la más antigua (FIFO)
    print(f"ronda {ronda}: logrado {logrado:6.1f} | media del buffer {np.mean(buffer):6.1f}")
