# AdaptThink: aprender CUÁNDO pensar. El incentivo δ premia el modo sin razonamiento si no se pierde precisión
import numpy as np

rng = np.random.default_rng(1)
dificultad = rng.uniform(0, 1, 2000)                 # problemas de fáciles (0) a difíciles (1)
p_pensar = 0.95 - 0.35 * dificultad                  # acierto con razonamiento largo
p_directo = 0.97 - 0.85 * dificultad                 # acierto respondiendo directamente
tokens_pensar, tokens_directo = 1500, 80
ref = p_pensar                                       # precisión del modelo de referencia (siempre piensa)

for delta in [0.0, 0.02, 0.05, 0.1]:
    # Recompensa esperada de cada modo: precisión respecto a la referencia, más δ si no piensa
    r_pensar = p_pensar - ref
    r_directo = p_directo - ref + delta
    directo = r_directo > r_pensar
    precision = np.where(directo, p_directo, p_pensar).mean()
    tokens = np.where(directo, tokens_directo, tokens_pensar).mean()
    print(f"δ = {delta:.2f}: sin pensar en el {directo.mean():5.1%} de los casos | precisión {precision:.3f}"
          f" | tokens medios {tokens:6.0f}")
