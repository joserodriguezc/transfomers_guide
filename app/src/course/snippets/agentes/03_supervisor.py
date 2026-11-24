# Arquitectura con supervisor: un enrutador decide qué agente especializado actúa a continuación
estado = {"tarea": "informe de mercado sobre baterías de sodio", "hechos": [], "borrador": None, "pasos": 0}


def investigador(e):
    e["hechos"].append(f"hecho {len(e['hechos']) + 1} sobre {e['tarea']}")


def redactor(e):
    e["borrador"] = f"Informe con {len(e['hechos'])} hechos."


def revisor(e):
    e["aprobado"] = e["borrador"] is not None and len(e["hechos"]) >= 3


AGENTES = {"investigador": investigador, "redactor": redactor, "revisor": revisor}


def supervisor(e):
    """En la práctica, un LLM con salida estructurada del tipo {"siguiente": ...}."""
    if len(e["hechos"]) < 3:
        return "investigador"
    if e["borrador"] is None:
        return "redactor"
    if "aprobado" not in e:
        return "revisor"
    return "FIN"


MAX_PASOS = 10                                      # protección contra bucles sin fin entre agentes
while estado["pasos"] < MAX_PASOS:
    siguiente = supervisor(estado)
    print(f"supervisor -> {siguiente}")
    if siguiente == "FIN":
        break
    AGENTES[siguiente](estado)
    estado["pasos"] += 1
print(estado["borrador"], "| aprobado:", estado.get("aprobado"))
