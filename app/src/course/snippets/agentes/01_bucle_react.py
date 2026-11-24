# El bucle de un agente (ReAct): pensar -> actuar (herramienta) -> observar, hasta responder
import ast
import operator as op

OPS = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv}


def calculadora(expr: str) -> str:
    """Evalúa aritmética de forma segura (sin eval)."""
    def ev(n):
        if isinstance(n, ast.Constant):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in OPS:
            return OPS[type(n.op)](ev(n.left), ev(n.right))
        raise ValueError("expresión no permitida")
    return str(round(ev(ast.parse(expr, mode="eval").body), 4))


def buscar(consulta: str) -> str:
    datos = {"precio entrada": "0.40 $ por millón de tokens", "precio salida": "1.60 $ por millón de tokens"}
    return next((v for k, v in datos.items() if k in consulta), "sin resultados")


HERRAMIENTAS = {"calculadora": calculadora, "buscar": buscar}


def llm_simulado(historial):
    """Un «modelo» con reglas fijas que imita las decisiones de un LLM (en la práctica, una llamada a la API)."""
    vistos = [h for h in historial if h[0] == "observación"]
    if len(vistos) == 0:
        return ("acción", "buscar", "precio entrada")
    if len(vistos) == 1:
        return ("acción", "buscar", "precio salida")
    if len(vistos) == 2:
        return ("acción", "calculadora", "1.5 * 0.40 + 0.5 * 1.60")
    return ("respuesta", f"Cuesta {vistos[-1][1]} $ al día.")


historial = [("usuario", "¿Cuánto cuestan 1.5 M de tokens de entrada y 0.5 M de salida?")]
for paso in range(6):                                  # límite de pasos: evita bucles infinitos
    decision = llm_simulado(historial)
    if decision[0] == "respuesta":
        print("RESPUESTA:", decision[1])
        break
    _, nombre, argumento = decision
    resultado = HERRAMIENTAS[nombre](argumento)
    print(f"paso {paso}: {nombre}({argumento!r}) -> {resultado}")
    historial += [("acción", nombre, argumento), ("observación", resultado)]
