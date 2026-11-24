# Aplicar las fusiones aprendidas (en orden) a una palabra nueva
fusiones = [("a", "m"), ("am", "o"), ("amo", "s"), ("amos", "_"), ("b", "a"), ("ba", "j"),
            ("c", "a"), ("ca", "n"), ("can", "t"), ("cant", "a")]


def codificar(palabra, fusiones):
    simbolos = list(palabra) + ["_"]
    for a, b in fusiones:  # el orden importa: primero las fusiones aprendidas antes
        i, out = 0, []
        while i < len(simbolos):
            if i < len(simbolos) - 1 and simbolos[i] == a and simbolos[i + 1] == b:
                out.append(a + b)
                i += 2
            else:
                out.append(simbolos[i])
                i += 1
        simbolos = out
    return simbolos


for w in ["cantamos", "bajamos", "cantábamos", "jugamos", "xyz"]:
    print(f"{w:12s} ->", codificar(w, fusiones))
# Ninguna palabra queda «fuera del vocabulario»: en el peor caso se usan caracteres sueltos
