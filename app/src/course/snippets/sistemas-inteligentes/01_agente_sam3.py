# Agente SAM 3 en miniatura: un planificador (MLLM) usa la segmentación como herramienta para
# resolver «la bola de lana roja de más a la izquierda»
objetos = [  # lo que devolvería SAM 3 para el concepto «bola de lana»: máscaras con caja y color
    {"id": 1, "x": 420, "color": "azul"},
    {"id": 2, "x": 130, "color": "roja"},
    {"id": 3, "x": 60, "color": "verde"},
    {"id": 4, "x": 300, "color": "roja"},
]


def segmentar(concepto):                      # herramienta intermedia: SAM 3
    return objetos if concepto == "bola de lana" else []


def examinar(mascaras, atributo):             # herramienta intermedia: el MLLM mira cada máscara
    return [m for m in mascaras if m["color"] == atributo]


def seleccionar(mascaras, criterio):          # herramienta terminal: termina la sesión
    return min(mascaras, key=lambda m: m["x"]) if criterio == "más a la izquierda" else None


consulta = "la bola de lana roja de más a la izquierda"
plan = [("segmentar", "bola de lana"), ("examinar", "roja"), ("seleccionar", "más a la izquierda")]
estado = None
for herramienta, argumento in plan:           # el MLLM decidiría cada paso viendo el resultado anterior
    if herramienta == "segmentar":
        estado = segmentar(argumento)
    elif herramienta == "examinar":
        estado = examinar(estado, argumento)
    else:
        estado = seleccionar(estado, argumento)
    print(f"{herramienta}({argumento!r}) ->", estado)
print("Sin el planificador, SAM 3 devolvería las 4 bolas: no entiende «roja de más a la izquierda».")
