# Una recompensa numérica verificable para un agente (media móvil simple de precios) y un grupo de rollouts
import numpy as np

rng = np.random.default_rng(0)
precios = 180 + np.cumsum(rng.normal(0, 1.5, 60))
ventana = 20
verdad = precios[-ventana:].mean()


def recompensa(prediccion, verdad, escala=1.0):
    """1 si es exacta, decae con el error relativo (en puntos porcentuales)."""
    error_pct = abs(prediccion - verdad) / verdad * 100
    return float(np.exp(-error_pct / escala))


# Un grupo de 6 rollouts del agente para la misma tarea (algunos usan otra ventana o redondean mal)
predicciones = [verdad, verdad + 0.3, precios[-10:].mean(), precios[-30:].mean(), round(verdad), 200.0]
r = np.array([recompensa(p, verdad) for p in predicciones])
A = (r - r.mean()) / r.std()
print(f"verdad: {verdad:.2f}")
for p, ri, ai in zip(predicciones, r, A):
    print(f"predicción {p:7.2f}  recompensa {ri:.3f}  ventaja {ai:+.2f}")
