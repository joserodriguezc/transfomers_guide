# Recompensas verificables por reglas (como en DeepSeek-R1): exactitud + formato
import re

respuestas = [
    r"<think>12·4 = 48, más 2 son 50</think> La respuesta es \boxed{50}",
    r"<think>12·4 = 46...</think> \boxed{48}",
    r"La respuesta es \boxed{50}",                       # correcta pero sin razonamiento en <think>
    r"<think>no estoy seguro</think> creo que unos 50",  # sin el formato de respuesta
]
correcta = "50"


def recompensa(texto):
    formato = 1.0 if re.fullmatch(r"<think>.+?</think>.*\\boxed\{.+\}.*", texto, flags=re.DOTALL) else 0.0
    m = re.search(r"\\boxed\{(.+?)\}", texto)
    exactitud = 1.0 if m and m.group(1).strip() == correcta else 0.0
    return exactitud + 0.2 * formato


for r in respuestas:
    print(f"{recompensa(r):.1f}  <- {r}")
