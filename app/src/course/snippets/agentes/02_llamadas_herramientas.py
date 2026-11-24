# Llamadas a herramientas como JSON: esquema, validación y errores útiles para el modelo
import json

ESQUEMA = {
    "name": "reservar_sala",
    "description": "Reserva una sala de reuniones",
    "parameters": {"sala": {"type": "string", "enum": ["A", "B"]}, "hora": {"type": "integer", "min": 8, "max": 19}},
}


def validar(llamada):
    args = llamada.get("arguments", {})
    errores = []
    for nombre, regla in ESQUEMA["parameters"].items():
        if nombre not in args:
            errores.append(f"falta el argumento '{nombre}'")
            continue
        v = args[nombre]
        if regla["type"] == "integer" and not isinstance(v, int):
            errores.append(f"'{nombre}' debe ser entero")
        elif "enum" in regla and v not in regla["enum"]:
            errores.append(f"'{nombre}' debe ser uno de {regla['enum']}")
        elif "min" in regla and not regla["min"] <= v <= regla["max"]:
            errores.append(f"'{nombre}' fuera de rango [{regla['min']}, {regla['max']}]")
    return errores


llamadas = [
    '{"name": "reservar_sala", "arguments": {"sala": "C", "hora": 22}}',
    '{"name": "reservar_sala", "arguments": {"sala": "B", "hora": 10}}',
]
for texto in llamadas:
    llamada = json.loads(texto)
    errores = validar(llamada)
    # El error se devuelve al modelo como observación para que corrija la llamada
    print("OK" if not errores else "ERROR -> " + "; ".join(errores), "|", texto)
