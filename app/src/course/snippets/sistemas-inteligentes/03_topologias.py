# ¿Cuándo ayudan más agentes? Simulación de tareas paralelizables y secuenciales con distintas topologías
import numpy as np

rng = np.random.default_rng(0)
p = 0.85            # acierto de un agente en una subtarea
ensayos = 20000


def tarea_paralela(n_agentes, verificador):
    """Subtareas independientes: cada una la intentan n agentes; basta con que una salga bien
    si hay un verificador que elija (centralizado), o mayoría si no (independiente)."""
    exitos = rng.random((ensayos, n_agentes)) < p
    if verificador:
        return exitos.any(1).mean()
    return (exitos.sum(1) > n_agentes / 2).mean()


def tarea_secuencial(n_agentes, pasos=6, coste_coordinacion=0.02):
    """Pasos dependientes repartidos entre agentes: cada traspaso entre agentes pierde contexto."""
    traspasos = min(n_agentes - 1, pasos - 1)
    p_paso = p + (1 - p) * 0.5                       # cada agente usa herramientas y se autocorrige un poco
    return p_paso ** pasos * (1 - coste_coordinacion) ** traspasos * (1 - 0.03 * traspasos)


for n in [1, 3, 5]:
    print(f"{n} agente(s): paralela con supervisor {tarea_paralela(n, True):.3f} | "
          f"paralela por mayoría {tarea_paralela(n, False):.3f} | secuencial {tarea_secuencial(n):.3f}")
print("Más agentes ayudan en tareas paralelizables con buena coordinación; en cadenas secuenciales,"
      " cada traspaso añade fricción y un solo agente con herramientas suele ser más estable.")
