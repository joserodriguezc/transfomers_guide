# Planificar «imaginando»: probar secuencias de acciones en el modelo y ejecutar la mejor (MPC)
import numpy as np

rng = np.random.default_rng(1)
A = np.array([[1.0, 0.1], [0.0, 0.98]])
B = np.array([0.0, 0.1])
objetivo = np.array([2.0, 0.0])                    # llegar a la posición 2 y quedarse quieto


def imaginar(s, acciones):
    coste = 0.0
    for a in acciones:
        s = A @ s + B * a
        coste += np.sum((s - objetivo) ** 2) + 0.01 * a ** 2
    return coste


s = np.zeros(2)
for t in range(60):
    candidatos = rng.uniform(-1, 1, size=(200, 15))      # 200 planes de 15 pasos
    costes = [imaginar(s, plan) for plan in candidatos]
    a = candidatos[int(np.argmin(costes))][0]            # ejecutar solo la primera acción y replanificar
    s = A @ s + B * a
    if t % 12 == 0 or t == 59:
        print(f"t = {t:2d}: posición {s[0]:5.2f}, velocidad {s[1]:5.2f}")
