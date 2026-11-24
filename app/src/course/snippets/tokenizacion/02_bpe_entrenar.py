# Byte Pair Encoding desde cero: fusionar una y otra vez el par de símbolos más frecuente
from collections import Counter

corpus = {"bajo": 6, "bajar": 3, "bajamos": 2, "cantar": 5, "cantamos": 4,
          "saltar": 3, "saltamos": 2, "alto": 4}
# Cada palabra empieza como una lista de caracteres más un marcador de fin de palabra
palabras = {tuple(w) + ("_",): f for w, f in corpus.items()}


def contar_pares(palabras):
    pares = Counter()
    for simbolos, f in palabras.items():
        for a, b in zip(simbolos, simbolos[1:]):
            pares[a, b] += f
    return pares


def fusionar(palabras, par):
    nuevas = {}
    for simbolos, f in palabras.items():
        out, i = [], 0
        while i < len(simbolos):
            if i < len(simbolos) - 1 and (simbolos[i], simbolos[i + 1]) == par:
                out.append(simbolos[i] + simbolos[i + 1])
                i += 2
            else:
                out.append(simbolos[i])
                i += 1
        nuevas[tuple(out)] = f
    return nuevas


fusiones = []
for paso in range(10):
    pares = contar_pares(palabras)
    # El más frecuente (desempate alfabético, como en la visualización)
    mejor = min(pares, key=lambda p: (-pares[p], p))
    palabras = fusionar(palabras, mejor)
    fusiones.append(mejor)
    print(f"{paso + 1:2d}. {mejor[0]!r} + {mejor[1]!r} -> {mejor[0] + mejor[1]!r} ({pares[mejor]} veces)")

print()
for simbolos in palabras:
    print(" ".join(simbolos))
