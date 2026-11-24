# Ingeniería de contexto: seleccionar, comprimir y aislar lo que entra en la ventana del modelo
import math
from collections import Counter

memorias = [
    "El usuario suele viajar a principios de septiembre al Caribe",
    "El usuario prefiere hoteles de playa con presupuesto medio",
    "El usuario usa Python y prefiere respuestas breves",
    "El usuario tiene tarjeta de fidelización de una cadena hotelera",
    "La última reunión de proyecto fue sobre la migración de la base de datos",
]
consulta = "Busca un hotel de playa para mis vacaciones de septiembre"


def bolsa(texto):
    return Counter(w.strip(".,").lower() for w in texto.split() if len(w) > 3)


def coseno(a, b):
    comun = sum(a[w] * b[w] for w in a)
    norma = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return comun / norma if norma else 0.0


q = bolsa(consulta)
ranking = sorted(memorias, key=lambda m: -coseno(q, bolsa(m)))
presupuesto = 25                                       # «tokens» (aquí, palabras) disponibles para memorias
seleccion, usados = [], 0
for m in ranking:
    n = len(m.split())
    if coseno(q, bolsa(m)) > 0 and usados + n <= presupuesto:
        seleccion.append(m)
        usados += n
print("memorias seleccionadas:")
for m in seleccion:
    print("  -", m)

herramientas = {"buscar_hoteles", "consultar_calendario", "enviar_email", "ejecutar_sql", "crear_ticket"}
relevantes = {h for h in herramientas if any(k in h for k in ["hotel", "calendario"])}
print("herramientas expuestas:", sorted(relevantes), f"({len(relevantes)} de {len(herramientas)})")
