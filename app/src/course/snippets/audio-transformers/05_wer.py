# Tasa de error de palabras (WER): distancia de edición entre transcripción y referencia
import numpy as np


def wer(referencia, hipotesis):
    r, h = referencia.split(), hipotesis.split()
    D = np.zeros((len(r) + 1, len(h) + 1), dtype=int)
    D[:, 0] = np.arange(len(r) + 1)
    D[0, :] = np.arange(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            coste = 0 if r[i - 1] == h[j - 1] else 1
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + coste)
    return D[-1, -1] / len(r)


ref = "la reunión empieza a las diez en la sala grande"
for hip in ["la reunión empieza a las diez en la sala grande",
            "la reunión empieza a las doce en la sala grande",
            "reunión empieza a las diez en sala la grande ya"]:
    print(f"WER = {wer(ref, hip):.2f}  <- {hip}")
