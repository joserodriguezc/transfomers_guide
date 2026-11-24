# RULER: un LLM juez puntúa VARIAS trayectorias de la misma tarea en relación unas con otras
import numpy as np

trayectorias = {
    "t1": "Llamó a la API de precios, calculó la media de 20 días y respondió 187.4",
    "t2": "Respondió 190 sin consultar ningún dato",
    "t3": "Consultó precios, pero calculó la media de 10 días en lugar de 20",
    "t4": "Consultó precios, calculó la media de 20 días, verificó el resultado y respondió 187.4",
}


def juez_simulado(texto):
    """En la práctica, un LLM recibe todas las trayectorias juntas y una rúbrica, y devuelve una puntuación 0–1
    para cada una (y una explicación). Aquí imitamos ese juicio con reglas."""
    p = 0.2
    p += 0.3 * ("Consultó" in texto or "Llamó" in texto)
    p += 0.3 * ("20 días" in texto)
    p += 0.1 * ("verificó" in texto)
    p -= 0.15 * ("sin consultar" in texto)
    return round(min(max(p, 0), 1), 2)


r = np.array([juez_simulado(t) for t in trayectorias.values()])
ventajas = (r - r.mean()) / (r.std() + 1e-8)        # normalización de grupo, como en GRPO
for (nombre, texto), puntuacion, a in zip(trayectorias.items(), r, ventajas):
    print(f"{nombre}: juez {puntuacion:.2f}  ventaja {a:+.2f}  | {texto}")
print("Al ser relativo, basta con que el juez ordene bien: no necesita una escala absoluta calibrada.")
