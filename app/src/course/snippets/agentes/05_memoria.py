# Tipos de memoria de un agente: episódica (qué pasó), semántica (hechos) y procedimental (cómo hacer)
import time

memoria = {
    "episodica": [],                  # experiencias concretas con su marca de tiempo
    "semantica": {},                  # hechos estables sobre el usuario o el dominio
    "procedimental": {},              # recetas que funcionaron
}


def recordar_episodio(texto, t):
    memoria["episodica"].append({"t": t, "texto": texto})


def recuperar_episodios(palabra, ahora, k=2, vida_media=7 * 86400):
    candidatos = [e for e in memoria["episodica"] if palabra in e["texto"]]
    # Puntuación con decaimiento temporal: lo reciente pesa más
    return sorted(candidatos, key=lambda e: -0.5 ** ((ahora - e["t"]) / vida_media))[:k]


ahora = time.time()
recordar_episodio("El despliegue falló por falta de memoria en la GPU", ahora - 20 * 86400)
recordar_episodio("El despliegue funcionó con cuantización INT4", ahora - 2 * 86400)
recordar_episodio("Reunión sobre el presupuesto", ahora - 1 * 86400)
memoria["semantica"]["gpu"] = "A100 de 40 GB"
memoria["procedimental"]["desplegar"] = ["cuantizar a INT4", "activar KV cache FP8", "lanzar vLLM"]

for e in recuperar_episodios("despliegue", ahora):
    print(f"hace {(ahora - e['t']) / 86400:.0f} días: {e['texto']}")
print("hecho:", memoria["semantica"]["gpu"])
print("receta:", " -> ".join(memoria["procedimental"]["desplegar"]))
