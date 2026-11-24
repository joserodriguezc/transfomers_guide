# Humano en el bucle: las acciones con riesgo se detienen hasta que una persona las aprueba
RIESGO = {"leer_documento": "bajo", "enviar_email": "alto", "borrar_registros": "alto", "resumir": "bajo"}
plan = [
    ("leer_documento", "contrato.pdf"),
    ("resumir", "contrato"),
    ("enviar_email", "cliente@ejemplo.com"),
    ("borrar_registros", "tabla_logs"),
]
decisiones_humanas = {"enviar_email": "editar", "borrar_registros": "rechazar"}   # simuladas

for herramienta, arg in plan:
    if RIESGO[herramienta] == "alto":
        decision = decisiones_humanas.get(herramienta, "aprobar")    # aquí el agente se pausa (interrupt)
        print(f"PAUSA: {herramienta}({arg}) requiere aprobación -> {decision}")
        if decision == "rechazar":
            print("   acción cancelada; el agente recibe el rechazo como observación")
            continue
        if decision == "editar":
            arg = arg + " (texto revisado por la persona)"
    print(f"ejecuta {herramienta}({arg})")
